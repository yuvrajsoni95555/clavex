// Build the static site for GitHub Pages and publish it to the gh-pages branch.
// Usage: npm run deploy   (needs git push access to the repo)
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, cpSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });

// the repo name is the sub-path GitHub serves the site under
const BASE_PATH = "/clavex";
// origin only: asset paths already carry BASE_PATH, and Next appends them to this URL as-is
const SITE_URL = "https://yuvrajsoni95555.github.io";

run("npx next build", { env: { ...process.env, NEXT_PUBLIC_BASE_PATH: BASE_PATH, NEXT_PUBLIC_SITE_URL: SITE_URL } });
writeFileSync("out/.nojekyll", ""); // otherwise GitHub's Jekyll step drops the _next folder

const remote = execSync("git remote get-url origin").toString().trim();
const sha = execSync("git rev-parse --short HEAD").toString().trim();
const dir = mkdtempSync(path.join(tmpdir(), "clavex-pages-"));
try {
  // a fresh one-commit branch each time: gh-pages only ever holds the latest build
  run("git init -q -b gh-pages", { cwd: dir });
  for (const f of readdirSync("out")) cpSync(path.join("out", f), path.join(dir, f), { recursive: true });
  run("git add -A", { cwd: dir });
  run(`git -c user.name="CLAVEX deploy" -c user.email="deploy@clavex.invalid" commit -q -m "Deploy ${sha}"`, { cwd: dir });
  run(`git push -q -f ${remote} gh-pages`, { cwd: dir });
  console.log(`\nPublished ${sha}. Live in about a minute at ${SITE_URL}/`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
