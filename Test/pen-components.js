// ── Pen.dev Roadmap Canvas Components ─────────────────────────
// Load this at the start of every mcp__pencil__execute call
// Usage: prepend this file's content to your canvas script

var BG='#0B0F15', CARD='#111827', CARD2='#0f172a', BORDER='#1e293b';
var T1='#f1f5f9', T2='#94a3b8', T3='#475569';
var BLUE='#3b82f6', GRN='#22c55e', ORG='#f59e0b', RED='#ef4444', PUR='#a78bfa', TEAL='#14b8a6';

// ── Badge component (fixed 50px width) ──
function badge(parent, text, color, bgAlpha) {
  return Insert(parent, {type:'frame', padding:[2,6], cornerRadius:4, fill:color+(bgAlpha||'20'), layout:'horizontal', width:50});
  // NOTE: caller must Insert text child separately
}
function prioBadge(parent, p) {
  var c = p==='P0'?RED:p==='P1'?ORG:p==='P2'?PUR:T3;
  var b = Insert(parent, {type:'frame', padding:[2,6], cornerRadius:4, fill:c+'20', layout:'horizontal', width:50});
  Insert(b, {type:'text', content:p, fontSize:9, fontFamily:'Roboto', fill:c, fontWeight:'bold'});
  return b;
}
function metricBadge(parent, v) {
  var c = v==='H'?RED:v==='M'?ORG:GRN;
  var b = Insert(parent, {type:'frame', padding:[2,6], cornerRadius:4, fill:c+'18', layout:'horizontal', width:50});
  Insert(b, {type:'text', content:v, fontSize:9, fontFamily:'Roboto', fill:c, fontWeight:'bold'});
  return b;
}

// ── Nav bar ──
function navBar(parent) {
  var nav = Insert(parent, {type:'frame', layout:'horizontal', alignItems:'center', width:'fill_container', padding:[12,24], fill:'#0f172a', gap:20});
  ['Dashboard','Workspace'].forEach(function(t){Insert(nav,{type:'text',content:t,fontSize:12,fontFamily:'Roboto',fill:T3});});
  Insert(nav,{type:'text',content:'Project',fontSize:13,fontFamily:'Roboto',fill:BLUE,fontWeight:'bold'});
  ['Memory','Settings'].forEach(function(t){Insert(nav,{type:'text',content:t,fontSize:12,fontFamily:'Roboto',fill:T3});});
  return nav;
}

// ── Sub-tabs (returns frame, caller sets active tab) ──
function subTabs(parent, active) {
  var tabs = Insert(parent, {type:'frame', layout:'horizontal', gap:0, width:'fill_container', fill:BG, padding:[0,24]});
  ['Overview','Roadmap','Tracker','Cost'].forEach(function(t){
    var isActive = t === active;
    var f = Insert(tabs,{type:'frame',padding:[10,20],fill:isActive?CARD:'transparent',cornerRadius:8,layout:'horizontal'});
    Insert(f,{type:'text',content:t,fontSize:13,fontFamily:'Roboto',fill:isActive?BLUE:T3,fontWeight:isActive?'bold':'normal'});
  });
  return tabs;
}

// ── View toggle (All/Month) ──
function viewToggle(parent, active) {
  var row = Insert(parent, {type:'frame', layout:'horizontal', gap:0, width:'fill_container', padding:[8,24], fill:BG, alignItems:'center'});
  ['All','Month'].forEach(function(v){
    var isActive = v === active;
    var btn = Insert(row, {type:'frame', padding:[6,16], cornerRadius:6, fill:isActive?CARD:'transparent', layout:'horizontal'});
    Insert(btn, {type:'text', content:v, fontSize:12, fontFamily:'Roboto', fill:isActive?BLUE:T3, fontWeight:isActive?'bold':'normal'});
  });
  return row;
}

// ── Add task buttons ──
function addButtons(parent) {
  var row = Insert(parent, {type:'frame', layout:'horizontal', gap:6, width:'fill_container', justifyContent:'end'});
  [['+ Current',BLUE,'#fff'], ['+ Next',CARD2,T2], ['+ Backlog',CARD2,T2]].forEach(function(b){
    var btn=Insert(row,{type:'frame',padding:[4,12],cornerRadius:6,fill:b[1],layout:'horizontal',stroke:BORDER,strokeWidth:1});
    Insert(btn,{type:'text',content:b[0],fontSize:10,fontFamily:'Roboto',fill:b[2],fontWeight:'bold'});
  });
  return row;
}

// ── Section header (NOW/NEXT/BACKLOG) ──
function sectionHeader(parent, label, color) {
  var r = Insert(parent, {type:'frame', layout:'horizontal', width:'fill_container', padding:[10,0,6,0], alignItems:'center', gap:8});
  Insert(r, {type:'frame', width:4, height:18, cornerRadius:2, fill:color});
  Insert(r, {type:'text', content:label, fontSize:12, fontFamily:'Roboto', fill:color, fontWeight:'bold'});
  Insert(r, {type:'frame', width:'fill_container', height:1, fill:color+'30'});
  return r;
}

// ── Q header section (for timeline header) ──
function qHeaderSection(parent, qLabel, color, months, qWidth) {
  var sec = Insert(parent, {type:'frame', layout:'vertical', width:qWidth||130, fill:'transparent', gap:1});
  var qr = Insert(sec, {type:'frame', layout:'horizontal', gap:4, alignItems:'center'});
  Insert(qr, {type:'frame', width:6, height:6, cornerRadius:3, fill:color});
  Insert(qr, {type:'text', content:qLabel, fontSize:9, fontFamily:'Roboto', fill:T2, fontWeight:'bold'});
  var mr = Insert(sec, {type:'frame', layout:'horizontal', gap:0});
  var mw = Math.floor((qWidth||130) / months.length);
  months.forEach(function(m){Insert(mr,{type:'text',content:m,fontSize:8,fontFamily:'Roboto',fill:T3,textGrowth:'fixed-width',width:mw});});
  return sec;
}

// ── Q separator line ──
function qSeparator(parent) {
  return Insert(parent, {type:'frame', width:2, height:28, fill:'#334155'});
}

// ── Table header cell ──
function headerCell(parent, label, width) {
  return Insert(parent, {type:'text', content:label, fontSize:10, fontFamily:'Roboto', fill:T3, fontWeight:'bold', textGrowth:'fixed-width', width:width});
}

// ── Text cell (fixed width) ──
function textCell(parent, text, width, color, bold) {
  return Insert(parent, {type:'text', content:text, fontSize:11, fontFamily:'Roboto', fill:color||T1, fontWeight:bold?'bold':'normal', textGrowth:'fixed-width', width:width});
}

// ── Timeline bar cell ──
function barCell(parent, active, barColor, width) {
  var cell = Insert(parent, {type:'frame', width:width||46, height:14, layout:'horizontal', padding:[2,0]});
  Insert(cell, {type:'frame', width:'fill_container', height:10, cornerRadius:5, fill:active?(barColor||BLUE)+'50':'#1e293b'});
  return cell;
}

// ── Full table header (left cols + Q sections) ──
function tableHeader(parent, qData, qWidth) {
  var hdr = Insert(parent, {type:'frame', layout:'horizontal', width:'fill_container', padding:[8,12], fill:CARD, cornerRadius:8, gap:4, alignItems:'center'});
  headerCell(hdr, '#', 28);
  headerCell(hdr, 'Task', 200);
  headerCell(hdr, 'Area', 100);
  headerCell(hdr, 'Prio', 50);
  headerCell(hdr, 'Status', 90);
  headerCell(hdr, 'Effort', 50);
  headerCell(hdr, 'Impact', 50);
  headerCell(hdr, 'Test', 50);
  qData.forEach(function(qd, qi) {
    if (qi > 0) qSeparator(hdr);
    qHeaderSection(hdr, qd.q, qd.c, qd.m, qWidth);
  });
  headerCell(hdr, 'OP', 50);
  return hdr;
}

// ── Full data row ──
// opts: {idx, name, area, prio, status, statusColor, effort, impact, test, startM, lenM, barColor, op, expanded}
function dataRow(parent, opts, bgColor, qWidth) {
  var row = Insert(parent, {type:'frame', layout:'horizontal', width:'fill_container', padding:[7,12], fill:bgColor||'transparent', gap:4, alignItems:'center'});
  Insert(row,{type:'text',content:(opts.expanded?'▾':'▸')+' '+(opts.idx+1),fontSize:10,fontFamily:'Roboto',fill:T3,textGrowth:'fixed-width',width:28});
  textCell(row, opts.name, 200, T1, true);
  textCell(row, opts.area, 100, T2, false);
  prioBadge(row, opts.prio);
  textCell(row, opts.status, 90, opts.statusColor||T3, false);
  metricBadge(row, opts.effort);
  metricBadge(row, opts.impact);
  metricBadge(row, opts.test);
  // Timeline bars
  var barW = qWidth ? Math.floor(qWidth / 3) - 2 : 46;
  for (var m = opts.barStart||0; m < (opts.barEnd||12); m++) {
    var active = m >= opts.startM && m < opts.startM + opts.lenM;
    var isQSep = [3,6,9].includes(m);
    barCell(row, active, opts.barColor, barW);
  }
  Insert(row,{type:'text',content:opts.op||'—',fontSize:9,fontFamily:'Roboto',fill:opts.op?TEAL:T3,textGrowth:'fixed-width',width:50});
  return row;
}

// ── Default Q data ──
var Q_ALL = [
  {q:'Q4 2026', c:ORG, m:['Oct','Nov','Dec']},
  {q:'Q1 2027', c:BLUE, m:['Jan','Feb','Mar']},
  {q:'Q2 2027', c:PUR, m:['Apr','May','Jun']},
  {q:'Q3 2027', c:T3, m:['Jul','Aug','Sep']}
];
var Q23_ONLY = [
  {q:'Q2 2027', c:PUR, m:['Apr','May','Jun']},
  {q:'Q3 2027', c:T3, m:['Jul','Aug','Sep']}
];

// ── Standard column widths ──
var COL = {num:28, task:200, area:100, prio:50, status:90, effort:50, impact:50, test:50, bar:46, op:50};