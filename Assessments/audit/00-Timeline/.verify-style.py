# ponytail: minimal spec-conformance check for satuinbox-big-picture.html restyle
import re, pathlib
src = pathlib.Path(__file__).with_name("satuinbox-big-picture.html").read_text(encoding="utf-8")
assert "text-transform:uppercase" not in src
assert "#8b5cf6" not in src and "7c3aed" not in src
assert src.count("var(--shadow-soft)") == 1 and "--shadow-soft:" in src
assert "<i>Satu</i>Inbox" in src and "One Conversation. More Possibilities." in src
assert "2px dashed var(--connector-blue)" in src and "#c3cbdc" not in src
assert len(re.findall(r"<tr><td>\d+</td>", src)) == 29
print("ALL CHECKS PASS")
