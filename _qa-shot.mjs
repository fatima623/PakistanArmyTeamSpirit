import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.QA_BASE || "http://localhost:3000";
const EMAIL = process.env.QA_EMAIL || "verified@example.com";
const PASSWORD = process.env.QA_PASSWORD || "TestPass123!";
const TAG = process.env.QA_TAG || "verified";
const OUT =
  process.env.QA_OUT ||
  "C:/Users/fatim/AppData/Local/Temp/claude/d--PakistanArmyTeamSpirit/f006030d-0493-41e9-bd6d-d4f0caf001b7/scratchpad/shots";
const ROUTES = (
  process.env.QA_ROUTES ||
  "/event/dashboard,/event/payment,/event/team,/event/edit/unit"
).split(",");
const WIDTH = parseInt(process.env.QA_WIDTH || "1440", 10);
const HEIGHT = parseInt(process.env.QA_HEIGHT || "900", 10);

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

// --- login ---
await page.goto(`${BASE}/event/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("#login-email", { timeout: 30000 });
// Wait for React hydration so the controlled inputs + onSubmit handler are live
// (otherwise the form does a native GET submit and never authenticates).
await page.waitForTimeout(3500);
await page.fill("#login-email", EMAIL);
await page.fill("#login-password", PASSWORD);
// Confirm React actually captured the values before submitting.
await page.waitForFunction(
  (email) => document.querySelector("#login-email")?.value === email,
  EMAIL,
  { timeout: 5000 }
).catch(() => {});
await page.click('button[type="submit"]');
try {
  await page.waitForURL("**/event/dashboard**", { timeout: 30000 });
  console.log(`[${TAG}] logged in as ${EMAIL}`);
} catch {
  const alert = await page
    .locator(".cp-alert-error, [role=alert]")
    .first()
    .textContent()
    .catch(() => null);
  console.log(`[${TAG}] login did NOT reach dashboard. url=${page.url()} alert=${alert}`);
}
await page.waitForTimeout(1200);

// --- screenshots ---
for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1400);
  const slug = route.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "") || "root";
  const file = `${OUT}/${TAG}__${WIDTH}__${slug}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  ${route} -> ${file}  (final url: ${page.url()})`);
}

await browser.close();
console.log(`[${TAG}] done`);
