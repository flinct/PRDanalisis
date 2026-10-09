
const AV = { DC:"#3b82f6", NY:"#a78bfa", AG:"#22c55e", RS:"#06b6d4" };
const FULL = { DC:"Dany Christian", NY:"Naftal Yunior", AG:"Agung D", RS:"Rizky S" };
const flatAssignees = (list) => (Array.isArray(list) ? list : [])
  .flatMap((slot) => Array.isArray(slot) ? slot : (slot ? [slot] : []))
  .filter(Boolean)
  .map((a) => (typeof a === "object" ? a : { ini: a, color: AV[a], name: FULL[a] || a }));

const assert = (c,m)=>{ if(!c){ console.error("FAIL",m); process.exit(1);} };

// roadmap: [assignee, [qa...], accountable]
let f = flatAssignees(["DC", ["NY","AG"], "RS"]);
assert(f.length===4, "count 4 got "+f.length);
assert(f[0].ini==="DC" && f[0].name==="Dany Christian" && f[0].color==="#3b82f6", "DC chip");
assert(f[1].ini==="NY" && f[2].ini==="AG" && f[3].ini==="RS", "qa flattened in order");

// empty assignee slot preserved roles: ["", ["NY"], ""]
f = flatAssignees(["", ["NY"], ""]);
assert(f.length===1 && f[0].ini==="NY", "empty slots dropped, qa kept");

// legacy flat string list (r[8] seed)
f = flatAssignees(["DC","NY"]);
assert(f.length===2 && f[0].ini==="DC", "legacy flat");

// OP object list passthrough
f = flatAssignees([{ini:"DC",color:"#111",name:"dany"}, {ini:"NY",color:"#222",name:"naf"}]);
assert(f.length===2 && f[0].name==="dany" && f[1].color==="#222", "object passthrough");

// empty / undefined
assert(flatAssignees([]).length===0 && flatAssignees(undefined).length===0, "empty");
console.log("OK all flatAssignees asserts passed");
