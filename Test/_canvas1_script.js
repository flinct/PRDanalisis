1|// ── Pen.dev Roadmap Canvas Components ─────────────────────────
2|// Load this at the start of every mcp__pencil__execute call
3|// Usage: prepend this file's content to your canvas script
4|
5|var BG='#0B0F15', CARD='#111827', CARD2='#0f172a', BORDER='#1e293b';
6|var T1='#f1f5f9', T2='#94a3b8', T3='#475569';
7|var BLUE='#3b82f6', GRN='#22c55e', ORG='#f59e0b', RED='#ef4444', PUR='#a78bfa', TEAL='#14b8a6';
8|
9|// ── Badge component (fixed 50px width) ──
10|function badge(parent, text, color, bgAlpha) {
11|  return Insert(parent, {type:'frame', padding:[2,6], cornerRadius:4, fill:color+(bgAlpha||'20'), layout:'horizontal', width:50});
12|  // NOTE: caller must Insert text child separately
13|}
14|function prioBadge(parent, p) {
15|  var c = p==='P0'?RED:p==='P1'?ORG:p==='P2'?PUR:T3;
16|  var b = Insert(parent, {type:'frame', padding:[2,6], cornerRadius:4, fill:c+'20', layout:'horizontal', width:50});
17|  Insert(b, {type:'text', content:p, fontSize:9, fontFamily:'Roboto', fill:c, fontWeight:'bold'});
18|  return b;
19|}
20|function metricBadge(parent, v) {
21|  var c = v==='H'?RED:v==='M'?ORG:GRN;
22|  var b = Insert(parent, {type:'frame', padding:[2,6], cornerRadius:4, fill:c+'18', layout:'horizontal', width:50});
23|  Insert(b, {type:'text', content:v, fontSize:9, fontFamily:'Roboto', fill:c, fontWeight:'bold'});
24|  return b;
25|}
26|
27|// ── Nav bar ──
28|function navBar(parent) {
29|  var nav = Insert(parent, {type:'frame', layout:'horizontal', alignItems:'center', width:'fill_container', padding:[12,24], fill:'#0f172a', gap:20});
30|  ['Dashboard','Workspace'].forEach(function(t){Insert(nav,{type:'text',content:t,fontSize:12,fontFamily:'Roboto',fill:T3});});
31|  Insert(nav,{type:'text',content:'Project',fontSize:13,fontFamily:'Roboto',fill:BLUE,fontWeight:'bold'});
32|  ['Memory','Settings'].forEach(function(t){Insert(nav,{type:'text',content:t,fontSize:12,fontFamily:'Roboto',fill:T3});});
33|  return nav;
34|}
35|
36|// ── Sub-tabs (returns frame, caller sets active tab) ──
37|function subTabs(parent, active) {
38|  var tabs = Insert(parent, {type:'frame', layout:'horizontal', gap:0, width:'fill_container', fill:BG, padding:[0,24]});
39|  ['Overview','Roadmap','Tracker','Cost'].forEach(function(t){
40|    var isActive = t === active;
41|    var f = Insert(tabs,{type:'frame',padding:[10,20],fill:isActive?CARD:'transparent',cornerRadius:8,layout:'horizontal'});
42|    Insert(f,{type:'text',content:t,fontSize:13,fontFamily:'Roboto',fill:isActive?BLUE:T3,fontWeight:isActive?'bold':'normal'});
43|  });
44|  return tabs;
45|}
46|
47|// ── View toggle (All/Month) ──
48|function viewToggle(parent, active) {
49|  var row = Insert(parent, {type:'frame', layout:'horizontal', gap:0, width:'fill_container', padding:[8,24], fill:BG, alignItems:'center'});
50|  ['All','Month'].forEach(function(v){
51|    var isActive = v === active;
52|    var btn = Insert(row, {type:'frame', padding:[6,16], cornerRadius:6, fill:isActive?CARD:'transparent', layout:'horizontal'});
53|    Insert(btn, {type:'text', content:v, fontSize:12, fontFamily:'Roboto', fill:isActive?BLUE:T3, fontWeight:isActive?'bold':'normal'});
54|  });
55|  return row;
56|}
57|
58|// ── Add task buttons ──
59|function addButtons(parent) {
60|  var row = Insert(parent, {type:'frame', layout:'horizontal', gap:6, width:'fill_container', justifyContent:'end'});
61|  [['+ Current',BLUE,'#fff'], ['+ Next',CARD2,T2], ['+ Backlog',CARD2,T2]].forEach(function(b){
62|    var btn=Insert(row,{type:'frame',padding:[4,12],cornerRadius:6,fill:b[1],layout:'horizontal',stroke:BORDER,strokeWidth:1});
63|    Insert(btn,{type:'text',content:b[0],fontSize:10,fontFamily:'Roboto',fill:b[2],fontWeight:'bold'});
64|  });
65|  return row;
66|}
67|
68|// ── Section header (NOW/NEXT/BACKLOG) ──
69|function sectionHeader(parent, label, color) {
70|  var r = Insert(parent, {type:'frame', layout:'horizontal', width:'fill_container', padding:[10,0,6,0], alignItems:'center', gap:8});
71|  Insert(r, {type:'frame', width:4, height:18, cornerRadius:2, fill:color});
72|  Insert(r, {type:'text', content:label, fontSize:12, fontFamily:'Roboto', fill:color, fontWeight:'bold'});
73|  Insert(r, {type:'frame', width:'fill_container', height:1, fill:color+'30'});
74|  return r;
75|}
76|
77|// ── Q header section (for timeline header) ──
78|function qHeaderSection(parent, qLabel, color, months, qWidth) {
79|  var sec = Insert(parent, {type:'frame', layout:'vertical', width:qWidth||130, fill:'transparent', gap:1});
80|  var qr = Insert(sec, {type:'frame', layout:'horizontal', gap:4, alignItems:'center'});
81|  Insert(qr, {type:'frame', width:6, height:6, cornerRadius:3, fill:color});
82|  Insert(qr, {type:'text', content:qLabel, fontSize:9, fontFamily:'Roboto', fill:T2, fontWeight:'bold'});
83|  var mr = Insert(sec, {type:'frame', layout:'horizontal', gap:0});
84|  var mw = Math.floor((qWidth||130) / months.length);
85|  months.forEach(function(m){Insert(mr,{type:'text',content:m,fontSize:8,fontFamily:'Roboto',fill:T3,textGrowth:'fixed-width',width:mw});});
86|  return sec;
87|}
88|
89|// ── Q separator line ──
90|function qSeparator(parent) {
91|  return Insert(parent, {type:'frame', width:2, height:28, fill:'#334155'});
92|}
93|
94|// ── Table header cell ──
95|function headerCell(parent, label, width) {
96|  return Insert(parent, {type:'text', content:label, fontSize:10, fontFamily:'Roboto', fill:T3, fontWeight:'bold', textGrowth:'fixed-width', width:width});
97|}
98|
99|// ── Text cell (fixed width) ──
100|function textCell(parent, text, width, color, bold) {
101|  return Insert(parent, {type:'text', content:text, fontSize:11, fontFamily:'Roboto', fill:color||T1, fontWeight:bold?'bold':'normal', textGrowth:'fixed-width', width:width});
102|}
103|
104|// ── Timeline bar cell ──
105|function barCell(parent, active, barColor, width) {
106|  var cell = Insert(parent, {type:'frame', width:width||46, height:14, layout:'horizontal', padding:[2,0]});
107|  Insert(cell, {type:'frame', width:'fill_container', height:10, cornerRadius:5, fill:active?(barColor||BLUE)+'50':'#1e293b'});
108|  return cell;
109|}
110|
111|// ── Full table header (left cols + Q sections) ──
112|function tableHeader(parent, qData, qWidth) {
113|  var hdr = Insert(parent, {type:'frame', layout:'horizontal', width:'fill_container', padding:[8,12], fill:CARD, cornerRadius:8, gap:4, alignItems:'center'});
114|  headerCell(hdr, '#', 28);
115|  headerCell(hdr, 'Task', 200);
116|  headerCell(hdr, 'Area', 100);
117|  headerCell(hdr, 'Prio', 50);
118|  headerCell(hdr, 'Status', 90);
119|  headerCell(hdr, 'Effort', 50);
120|  headerCell(hdr, 'Impact', 50);
121|  headerCell(hdr, 'Test', 50);
122|  qData.forEach(function(qd, qi) {
123|    if (qi > 0) qSeparator(hdr);
124|    qHeaderSection(hdr, qd.q, qd.c, qd.m, qWidth);
125|  });
126|  headerCell(hdr, 'OP', 50);
127|  return hdr;
128|}
129|
130|// ── Full data row ──
131|// opts: {idx, name, area, prio, status, statusColor, effort, impact, test, startM, lenM, barColor, op, expanded}
132|function dataRow(parent, opts, bgColor, qWidth) {
133|  var row = Insert(parent, {type:'frame', layout:'horizontal', width:'fill_container', padding:[7,12], fill:bgColor||'transparent', gap:4, alignItems:'center'});
134|  Insert(row,{type:'text',content:(opts.expanded?'▾':'▸')+' '+(opts.idx+1),fontSize:10,fontFamily:'Roboto',fill:T3,textGrowth:'fixed-width',width:28});
135|  textCell(row, opts.name, 200, T1, true);
136|  textCell(row, opts.area, 100, T2, false);
137|  prioBadge(row, opts.prio);
138|  textCell(row, opts.status, 90, opts.statusColor||T3, false);
139|  metricBadge(row, opts.effort);
140|  metricBadge(row, opts.impact);
141|  metricBadge(row, opts.test);
142|  // Timeline bars
143|  var barW = qWidth ? Math.floor(qWidth / 3) - 2 : 46;
144|  for (var m = opts.barStart||0; m < (opts.barEnd||12); m++) {
145|    var active = m >= opts.startM && m < opts.startM + opts.lenM;
146|    var isQSep = [3,6,9].includes(m);
147|    barCell(row, active, opts.barColor, barW);
148|  }
149|  Insert(row,{type:'text',content:opts.op||'—',fontSize:9,fontFamily:'Roboto',fill:opts.op?TEAL:T3,textGrowth:'fixed-width',width:50});
150|  return row;
151|}
152|
153|// ── Default Q data ──
154|var Q_ALL = [
155|  {q:'Q4 2026', c:ORG, m:['Oct','Nov','Dec']},
156|  {q:'Q1 2027', c:BLUE, m:['Jan','Feb','Mar']},
157|  {q:'Q2 2027', c:PUR, m:['Apr','May','Jun']},
158|  {q:'Q3 2027', c:T3, m:['Jul','Aug','Sep']}
159|];
160|var Q23_ONLY = [
161|  {q:'Q2 2027', c:PUR, m:['Apr','May','Jun']},
162|  {q:'Q3 2027', c:T3, m:['Jul','Aug','Sep']}
163|];
164|
165|// ── Standard column widths ──
166|var COL = {num:28, task:200, area:100, prio:50, status:90, effort:50, impact:50, test:50, bar:46, op:50};

// ══ Canvas 1: Expanded Row ══
var s1 = Insert('document', {type:'frame', name:'Canvas 1 — Expanded Row', x:3374, y:7, width:1440, height:900, fill:BG, layout:'vertical', gap:0, clip:true});
navBar(s1);
subTabs(s1, 'Roadmap');
var body1 = Insert(s1, {type:'frame', layout:'vertical', width:'fill_container', height:'fill_container', padding:[8,24], gap:0, fill:BG});

// Header
tableHeader(body1, Q_ALL, 130);

// NOW section
sectionHeader(body1, 'NOW', ORG);

// Row 1 EXPANDED
var r1 = dataRow(body1, {idx:0, name:'UI Conversation Redesign', area:'Omnichannel', prio:'P0', status:'Active', statusColor:BLUE, effort:'H', impact:'H', test:'H', startM:0, lenM:4, barColor:RED, op:'2697', expanded:true, barStart:0, barEnd:12}, CARD2, 130);

// Detail panel
var det = Insert(body1, {type:'frame', layout:'horizontal', width:'fill_container', padding:[12,20], fill:CARD2, gap:24, stroke:BORDER, strokeWidth:1});
var detL = Insert(det, {type:'frame', layout:'vertical', width:'fill_container', gap:8});
Insert(detL,{type:'text',content:'Description',fontSize:10,fontFamily:'Roboto',fill:T2,fontWeight:'bold'});
Insert(detL,{type:'text',content:'Redesign the entire conversation UI with new layout, embedded side-panels, and inline actions. Blocks ticket widget v2 and notification service improvements.',fontSize:11,fontFamily:'Roboto',fill:T2,textGrowth:'fixed-width',width:600});
var depRow=Insert(detL,{type:'frame',layout:'horizontal',gap:6,alignItems:'center'});
Insert(depRow,{type:'text',content:'Dependency:',fontSize:10,fontFamily:'Roboto',fill:T3,fontWeight:'bold'});
['notification-service','ticket-v2-widget'].forEach(function(d){
  var tag=Insert(depRow,{type:'frame',padding:[2,8],cornerRadius:4,fill:TEAL+'15',layout:'horizontal'});
  Insert(tag,{type:'text',content:d,fontSize:9,fontFamily:'Roboto',fill:TEAL});
});
var detR = Insert(det, {type:'frame', layout:'vertical', width:'fill_container', gap:6});
Insert(detR,{type:'text',content:'Metrics',fontSize:10,fontFamily:'Roboto',fill:T2,fontWeight:'bold'});
[{l:'Impact',v:'H',d:'High — critical path'},{l:'Effort',v:'H',d:'High — 3+ sprint points'},{l:'Testing',v:'H',d:'High — E2E + integration'}].forEach(function(m){
  var mc=m.v==='H'?RED:ORG;
  var mr=Insert(detR,{type:'frame',layout:'horizontal',gap:8,alignItems:'center'});
  Insert(mr,{type:'text',content:m.l,fontSize:10,fontFamily:'Roboto',fill:T3,textGrowth:'fixed-width',width:60});
  var bd=Insert(mr,{type:'frame',padding:[2,6],cornerRadius:4,fill:mc+'18',layout:'horizontal',width:30});
  Insert(bd,{type:'text',content:m.v,fontSize:9,fontFamily:'Roboto',fill:mc,fontWeight:'bold'});
  Insert(mr,{type:'text',content:m.d,fontSize:10,fontFamily:'Roboto',fill:T2});
});
var metaR=Insert(detR,{type:'frame',layout:'horizontal',gap:16});
Insert(metaR,{type:'text',content:'Schedule: Oct → Jan',fontSize:10,fontFamily:'Roboto',fill:T3});
Insert(metaR,{type:'text',content:'OP: #2697 ↗',fontSize:10,fontFamily:'Roboto',fill:TEAL,fontWeight:'bold'});

// Remaining NOW rows
var nowData = [
  {idx:1,name:'Notification Service',area:'Notification',prio:'P1',status:'In Progress',statusColor:GRN,effort:'M',impact:'H',test:'H',startM:0,lenM:3,barColor:ORG,op:'2332'},
  {idx:2,name:'Sales Module PRD+P0',area:'Sales',prio:'P1',status:'In Progress',statusColor:GRN,effort:'M',impact:'H',test:'M',startM:0,lenM:3,barColor:ORG,op:'2366'},
  {idx:3,name:'Advance Exporting',area:'Tools',prio:'P1',status:'In Progress',statusColor:GRN,effort:'M',impact:'M',test:'L',startM:0,lenM:2,barColor:ORG,op:'2909'},
  {idx:4,name:'Infra Stability Slice 1',area:'Growth',prio:'P1',status:'Active',statusColor:BLUE,effort:'M',impact:'H',test:'M',startM:0,lenM:2,barColor:ORG,op:''}
];
nowData.forEach(function(t,i){dataRow(body1, Object.assign(t, {expanded:false, barStart:0, barEnd:12}), i%2===0?CARD2:'transparent', 130);});

// NEXT section
sectionHeader(body1, 'NEXT', BLUE);
var nextData = [
  {idx:5,name:'Widget Module',area:'Tools',prio:'P1',status:'New',statusColor:T3,effort:'M',impact:'M',test:'M',startM:2,lenM:5,barColor:ORG,op:''},
  {idx:6,name:'Cost Simulation WA',area:'Omnichannel',prio:'P2',status:'New',statusColor:T3,effort:'L',impact:'M',test:'L',startM:2,lenM:4,barColor:BLUE,op:''},
  {idx:7,name:'Ticketing KPI Card',area:'Ticket',prio:'P2',status:'New',statusColor:T3,effort:'L',impact:'M',test:'L',startM:3,lenM:5,barColor:BLUE,op:'168'},
  {idx:8,name:'Broadcast v2',area:'Broadcast',prio:'P2',status:'New',statusColor:T3,effort:'M',impact:'M',test:'M',startM:3,lenM:5,barColor:BLUE,op:''}
];
nextData.forEach(function(t,i){dataRow(body1, Object.assign(t, {expanded:false, barStart:0, barEnd:12}), i%2===0?CARD2:'transparent', 130);});

// BACKLOG section
sectionHeader(body1, 'BACKLOG', T3);
var backlogData = [
  {idx:9,name:'Chat Bot Auto Response',area:'AI',prio:'P2',status:'New',statusColor:T3,effort:'H',impact:'H',test:'H',startM:5,lenM:9,barColor:T3,op:''},
  {idx:10,name:'Analytics Dashboard',area:'Analytics',prio:'P2',status:'New',statusColor:T3,effort:'M',impact:'M',test:'M',startM:6,lenM:9,barColor:T3,op:''},
  {idx:11,name:'Fraud Dashboard',area:'Tools',prio:'P3',status:'New',statusColor:T3,effort:'M',impact:'H',test:'M',startM:7,lenM:11,barColor:T3,op:''},
  {idx:12,name:'Telegram Channel',area:'Omnichannel',prio:'P3',status:'New',statusColor:T3,effort:'L',impact:'L',test:'L',startM:9,lenM:11,barColor:T3,op:''}
];
backlogData.forEach(function(t,i){dataRow(body1, Object.assign(t, {expanded:false, barStart:0, barEnd:12}), i%2===0?CARD2:'transparent', 130);});

Print('Canvas 1 done:', s1);
