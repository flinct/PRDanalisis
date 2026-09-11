#!/usr/bin/env node
/* Syntax check for the inline <script type="text/babel"> blob in testcase-browser.html.
   The page transpiles with Babel standalone at runtime, so a typo only surfaces as a
   blank screen in the browser. Parse it here instead:  node Test/check-jsx.js
   ponytail: parse-only (no type/lint checks). Add eslint when the blob gets split. */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "testcase-browser.html"), "utf8");

const open = '<script type="text/babel">';
const i = html.indexOf(open);
if (i < 0) {
  console.error("FAIL: inline babel script block not found");
  process.exit(1);
}
const start = i + open.length;
const end = html.indexOf("</script>", start);
const body = html.slice(start, end);

const tmp = path.join(root, "tmp");
fs.mkdirSync(tmp, { recursive: true });
const src = path.join(tmp, "_jsxcheck.jsx");
fs.writeFileSync(src, body, "utf8");

const bin = path.join(root, "node_modules", "@esbuild", "win32-x64", "esbuild.exe");
const exe = fs.existsSync(bin)
  ? bin
  : path.join(root, "node_modules", ".bin", process.platform === "win32" ? "esbuild.cmd" : "esbuild");

try {
  execFileSync(exe, ["--loader:.jsx=jsx", "--target=es2019", src, "--outfile=" + path.join(tmp, "_jsxcheck.js")], {
    stdio: "inherit",
  });
  console.log(`OK: inline JSX parses (${body.split("\n").length} lines)`);
} catch {
  console.error("FAIL: inline JSX did not parse (see esbuild error above)");
  process.exit(1);
} finally {
  fs.rmSync(src, { force: true });
  fs.rmSync(path.join(tmp, "_jsxcheck.js"), { force: true });
}
