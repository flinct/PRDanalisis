# Inline theme.css + all .js into one self-contained HTML (device-portable, no folder needed).
# ponytail: string-replace 2 tag jenis; regen tiap ubah source dgn `python build_standalone.py`.
from pathlib import Path

ROOT = Path(__file__).parent
IDX = ROOT / "index.html"
OUT = ROOT.parent / "sales-clone-standalone.html"

SCRIPTS = ["pages/leads.js", "pages/visits.js", "pages/settings-lead-pipeline.js",
           "shared/data.js", "shared/router.js", "shared/auth.js"]

html = IDX.read_text(encoding="utf-8")

# 1) inline theme.css
css = (ROOT / "shared/theme.css").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="shared/theme.css">',
                    f"<style>\n{css}\n</style>")

# 2) inline each <script src=...>
for src in SCRIPTS:
    js = (ROOT / src).read_text(encoding="utf-8")
    # ponytail: page .js strings contain literal </script> (from page HTML) → would close the
    # inline <script> tag prematurely in browsers. Escape it; <\/script> is identical in JS strings.
    js = js.replace("</script>", "<\\/script>")
    html = html.replace(f'<script src="{src}"></script>',
                        f"<script>\n{js}\n</script>")

# guard: no external refs left
assert 'href="shared/' not in html and 'src="pages/' not in html and 'src="shared/' not in html, \
    "masih ada referensi eksternal — inline gagal"
# guard: browser-parse safety — walk like an HTML parser, every </script> closes the open script.
# After escaping, no inlined block may contain a bare </script> that truncates it.
import re as _re
_opens = list(_re.finditer(r'<script\b[^>]*>', html))
for _m in _opens:
    _body = html[_m.end():]
    _cut = _body.split('</script>')[0]
    # an inlined block carrying page data must still contain its full assignment terminator
    if 'window.__PAGES' in _cut and not _cut.rstrip().endswith(';'):
        raise AssertionError("inlined page block truncated by a bare </script> — escaping failed")

OUT.write_text(html, encoding="utf-8")
print(f"OK -> {OUT.name} ({len(html):,} chars, self-contained)")
