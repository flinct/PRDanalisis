#!/usr/bin/env python3
# Convert each pages/*.html into a self-registering pages/*.js so the prototype runs
# from file:// (double-click) WITHOUT a server. Re-run after editing any page HTML.
# Run: python3 build.py
import re, pathlib, json

ROOT = pathlib.Path(__file__).parent
PAGES = ROOT / "pages"

html_files = sorted(PAGES.glob("*.html"))
for hf in html_files:
    rel = f"pages/{hf.name}"
    html = hf.read_text(encoding="utf-8")
    js = f"window.__PAGES=window.__PAGES||{{}};window.__PAGES[{json.dumps(rel)}]={json.dumps(html, ensure_ascii=False)};\n"
    (PAGES / (hf.stem + ".js")).write_text(js, encoding="utf-8")

print(f"OK -> {len(html_files)} page(s) converted to pages/*.js")

# self-check: every .html has a matching .js that references it
for hf in html_files:
    jf = PAGES / (hf.stem + ".js")
    assert jf.exists() and f'pages/{hf.name}' in jf.read_text(encoding="utf-8"), f"missing/bad js for {hf.name}"
print("self-check OK")
