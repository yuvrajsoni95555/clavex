// Screenshot every section at mobile (390x844) and desktop (1440x900), and log console/network errors.
// Usage: node scripts/qa-shots.mjs <base-url> <label> [home|collections|product]
//   e.g. node scripts/qa-shots.mjs https://yuvrajsoni95555.github.io/clavex before
// Uses the installed Google Chrome (playwright-core, no browser download). Output: qa-screenshots/<label>/
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const [base, label = "shots", only] = process.argv.slice(2);
const want = (part) => !only || only === part;
if (!base) throw new Error("usage: node scripts/qa-shots.mjs <base-url> <label>");
const out = `qa-screenshots/${label}`;
mkdirSync(out, { recursive: true });

const devices = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const PRODUCT = "rose-lumiere";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const report = {};

for (const [name, device] of Object.entries(devices)) {
  const ctx = await browser.newContext(device);
  await ctx.addInitScript(() => sessionStorage.setItem("clx-preloaded", "1")); // skip the preloader for shots
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`));
  page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  const shot = (file, opts = {}) => page.screenshot({ path: `${out}/${name}-${file}.png`, ...opts });
  const scrollToEl = async (selector, nth = 0, block = "start") => {
    const ok = await page.evaluate(
      ([s, i, b]) => {
        const el = document.querySelectorAll(s)[i];
        if (!el) return false;
        el.scrollIntoView({ block: b });
        return true;
      },
      [selector, nth, block],
    );
    await wait(2500);
    return ok;
  };

  // home
  if (want("home")) {
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollBy(0, 2)); // phones load 3D on first scroll/touch
    await wait(7000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(1500);
    await shot("home-01-hero");
    for (const [i, f] of [0, 0.33, 0.66, 1].entries()) {
      await page.evaluate((f) => {
        const s = document.getElementById("craft");
        window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * f);
      }, f);
      await wait(i === 0 ? 6000 : 3500);
      await shot(`home-02-story-${i + 1}`);
    }
    const sections = [
      [".clx-marquee", 0, "home-03-marquee"],
      ["#collections .grid", 0, "home-04-collection"],
      ["[data-reveal-img]", 0, "home-05-editorial-1"],
      ["[data-reveal-img]", 1, "home-06-editorial-2"],
      ["main > section:last-of-type", 0, "home-07-numbers"],
      ["footer", 0, "home-08-footer"],
    ];
    for (const [sel, nth, file] of sections) if (await scrollToEl(sel, nth)) await shot(file);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(2500);
    await shot("home-09-footer-end");
  }

  // collections
  if (want("collections")) {
    await page.goto(`${base}/collections`, { waitUntil: "networkidle" });
    await wait(2500);
    await shot("collections-01-top");
    if (await scrollToEl("main ul")) await shot("collections-02-grid");
  }

  // product
  if (want("product")) {
    await page.goto(`${base}/products/${PRODUCT}`, { waitUntil: "networkidle" });
    const tap = page.getByRole("button", { name: "View in 3D" });
    if (await tap.count()) await tap.click();
    await wait(9000);
    await shot("product-01-top");
    const viewer = page.locator("main [role=group]").first();
    if (await viewer.count()) {
      await viewer.screenshot({ path: `${out}/${name}-product-02-ring-closeup.png` });
      // turn it with the keyboard (pauses auto-rotate), then zoom in on the setting
      await viewer.focus();
      for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
      await wait(1500);
      await viewer.screenshot({ path: `${out}/${name}-product-02b-ring-turned.png` });
      for (let i = 0; i < 4; i++) await page.keyboard.press("+");
      await wait(1500);
      await viewer.screenshot({ path: `${out}/${name}-product-02c-ring-zoomed.png` });
    }
    await page.evaluate(() => window.scrollTo(0, innerHeight * 0.9));
    await wait(2500);
    await shot("product-03-below-viewer");
  }

  report[name] = errors;
  await ctx.close();
}

// every internal link: the page must answer 200, and any #anchor must exist on it
const linkProblems = [];
{
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => sessionStorage.setItem("clx-preloaded", "1"));
  const page = await ctx.newPage();
  const origin = new URL(base).origin;
  const links = new Set();
  for (const path of ["/", "/collections", `/products/${PRODUCT}`]) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    for (const href of await page.$$eval("a[href]", (as) => as.map((a) => a.href))) if (href.startsWith(origin)) links.add(href);
  }
  for (const href of links) {
    const url = new URL(href);
    const res = await ctx.request.get(url.origin + url.pathname);
    if (res.status() !== 200) linkProblems.push(`${res.status()} ${href}`);
    else if (url.hash) {
      await page.goto(url.origin + url.pathname, { waitUntil: "domcontentloaded" });
      if (!(await page.$(url.hash))) linkProblems.push(`missing anchor ${href}`);
    }
  }
  report.links = { checked: links.size, problems: linkProblems };
  await ctx.close();
}

await browser.close();
writeFileSync(`${out}/errors.json`, JSON.stringify(report, null, 2));
console.log(`saved to ${out}`, JSON.stringify({ mobile: report.mobile?.length, desktop: report.desktop?.length, links: report.links }));
