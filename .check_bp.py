import re, html.parser
p = 'Assessments/audit/00-Timeline/satuinbox-big-picture.html'
t = open(p, encoding='utf-8').read()
lines = t.split('\n')
start = end = None
for i, l in enumerate(lines):
    if 'id="p0"' in l and start is None: start = i
    if 'id="p1"' in l and end is None: end = i
print('p0 line', start + 1, '| p1 line', end + 1)
seg = '\n'.join(lines[start:end])
print('p0 seg: <div =', len(re.findall(r'<div\b', seg)), '| </div =', seg.count('</div'))
print('file  : <div =', len(re.findall(r'<div\b', t)), '| </div =', t.count('</div'))

VOID = {'br','img','input','hr','meta','link','path','circle','rect','line','polyline',
        'polygon','use','stop','ellipse','col','source','area','base','embed','track','wbr'}
class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.stack = []; self.err = []
    def handle_starttag(self, tag, attrs):
        if tag in VOID: return
        self.stack.append((tag, self.getpos()[0]))
    def handle_startendtag(self, tag, attrs): pass
    def handle_endtag(self, tag):
        if tag in VOID: return
        if self.stack and self.stack[-1][0] == tag: self.stack.pop()
        else: self.err.append(('mismatch </%s>' % tag, 'line', self.getpos()[0],
                               'top=', self.stack[-1] if self.stack else None))
pp = P(); pp.feed(t)
print('parse errors:', pp.err[:8] or 'none')
print('unclosed:', pp.stack[:8] or 'none')

# channel + module names
chans = ['Website Widget','WhatsApp Official (BSP)','WhatsApp Web','Instagram','Facebook',
         'Email','TikTok Chat','Shopee Chat','API Integration']
mods = ['Chat / Conversation','Ticket','Contact','Broadcast','Analytics','AI','Tools / Add-ons',
        'Payment','Theme','Affiliate','Notification','Mobile App','Open API']
print('channels missing:', [c for c in chans if c not in t])
print('modules missing :', [m for m in mods if m not in t])
print('module-item count:', t.count('class="module-item"'))
print('channel-item count:', t.count('class="channel-item"'))
