import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/event/login", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForSelector("#login-email"); await p.waitForTimeout(3500);
await p.fill("#login-email", "verified@example.com"); await p.fill("#login-password", "TestPass123!");
await p.click('button[type="submit"]');
await p.waitForURL("**/event/dashboard**", { timeout: 30000 }).catch(()=>{});
await p.goto("http://localhost:3000/event/payment", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(1500);
const rules = await p.evaluate(() => {
  const el = [...document.querySelectorAll(".ops-status-approved")].find(e=>/verified/i.test(e.textContent||""));
  if (!el) return { found:false };
  const matches = [];
  for (const sheet of document.styleSheets) {
    let rr; try { rr = sheet.cssRules; } catch { continue; }
    for (const rule of rr) {
      if (!rule.selectorText || !rule.style || !rule.style.color) continue;
      try { if (el.matches(rule.selectorText)) matches.push({ sel: rule.selectorText.slice(0,120), color: rule.style.color, important: rule.style.getPropertyPriority('color') }); } catch {}
    }
  }
  return { found:true, computed: getComputedStyle(el).color, matches };
});
console.log(JSON.stringify(rules, null, 2));
await b.close();
