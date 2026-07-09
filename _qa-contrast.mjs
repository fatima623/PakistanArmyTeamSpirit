import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const PASSWORD = "TestPass123!";
const EMAIL = process.env.QA_EMAIL || "verified@example.com";
const ROUTES = (
  process.env.QA_ROUTES ||
  "/event/dashboard,/event/edit/unit,/event/team,/event/payment,/event/tickets,/event/flights,/event/host-info,/event/confirm-participation"
).split(",");

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// login
await page.goto(`${BASE}/event/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("#login-email", { timeout: 30000 });
await page.waitForTimeout(3500);
await page.fill("#login-email", EMAIL);
await page.fill("#login-password", PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/event/dashboard**", { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1200);
console.log(`# Contrast audit as ${EMAIL}\n`);

const auditFn = () => {
  const parse = (str) => {
    if (!str) return null;
    const m = str.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const p = m[1].split(",").map((s) => parseFloat(s));
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  const over = (fg, bg) => {
    const a = fg.a + bg.a * (1 - fg.a);
    const ch = (f, b) => (a === 0 ? 0 : (f * fg.a + b * bg.a * (1 - fg.a)) / a);
    return { r: ch(fg.r, bg.r), g: ch(fg.g, bg.g), b: ch(fg.b, bg.b), a };
  };
  const effBg = (el) => {
    const layers = [];
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return { img: true };
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) {
        layers.push(bg);
        if (bg.a >= 1) break;
      }
      node = node.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return { img: false, color: base };
  };
  const lum = ({ r, g, b }) => {
    const f = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (c1, c2) => {
    const L1 = lum(c1), L2 = lum(c2);
    const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  };

  const out = [];
  const els = document.querySelectorAll("body *:not(script):not(style):not(svg):not(path)");
  for (const el of els) {
    // only elements with a direct, visible text node
    const hasText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 1
    );
    if (!hasText) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.1)
      continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const bg = effBg(el);
    if (bg.img) continue; // gradient/image ground — audited manually (hero/sidebar handled)
    const textColor = over(fg, bg.color);
    const r = ratio(textColor, bg.color);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const threshold = large ? 3.0 : 4.5;
    if (r < threshold) {
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString().slice(0, 50)) || "",
        text: (el.textContent || "").trim().slice(0, 45),
        ratio: Math.round(r * 100) / 100,
        need: threshold,
        color: cs.color,
        bg: `rgb(${Math.round(bg.color.r)},${Math.round(bg.color.g)},${Math.round(bg.color.b)})`,
        size: Math.round(size),
      });
    }
  }
  // dedupe by tag+text+ratio
  const seen = new Set();
  return out
    .filter((f) => {
      const k = `${f.tag}|${f.text}|${f.ratio}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => a.ratio - b.ratio);
};

for (const route of ROUTES) {
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  } catch (e) {
    console.log(`## ${route}  ->  nav timeout/error (skipped): ${e.message.slice(0, 50)}\n`);
    continue;
  }
  await page.waitForTimeout(1400);
  const finalUrl = page.url().replace(BASE, "");
  const findings = await page.evaluate(auditFn);
  if (finalUrl !== route) {
    console.log(`## ${route}  ->  redirected to ${finalUrl} (skipped)\n`);
    continue;
  }
  console.log(`## ${route}  (${findings.length} contrast failures)`);
  for (const f of findings.slice(0, 20)) {
    console.log(
      `  ${f.ratio.toFixed(2)}:1 (need ${f.need}) [${f.size}px ${f.tag}] "${f.text}"  color=${f.color} bg=${f.bg}  .${f.cls}`
    );
  }
  console.log("");
}

await browser.close();
