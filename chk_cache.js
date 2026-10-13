// Replicate Fase 2 cache+tree logic against live OP endpoint (project 7, all WP).
const http = require("http");
function get(path){return new Promise((res,rej)=>{http.get("http://127.0.0.1:3001"+path,r=>{let b="";r.on("data",c=>b+=c);r.on("end",()=>res(JSON.parse(b)));}).on("error",rej);});}
(async()=>{
  const d = await get("/api/dashboard/openproject/work-packages?all=1&includeClosed=1&pageSize=200");
  if(!d.ok){console.log("FETCH_FAIL",d.error);process.exit(1);}
  const rows = d.allWorkPackages || d.workPackages || [];
  const payload = { rows, ts: Date.now() };
  console.log("cache rows:", payload.rows.length, "ts set:", !!payload.ts);
  // tree build (same as opTree useMemo)
  const byId = new Map(rows.map(w=>[w.id,w]));
  const childrenOf = new Map(); const roots = [];
  rows.forEach(w=>{ if(w.parentId && byId.has(w.parentId)){ if(!childrenOf.has(w.parentId)) childrenOf.set(w.parentId,[]); childrenOf.get(w.parentId).push(w);} else roots.push(w);});
  console.log("roots:", roots.length, "parents-with-children:", childrenOf.size);
  // milestones (typeId 2 / typeName Milestone) + their children
  const ms = rows.filter(w=>w.typeName==="Milestone"||w.typeId===2);
  console.log("milestones in cache:", ms.length);
  ms.slice(0,5).forEach(m=>{ const ch=childrenOf.get(m.id)||[]; console.log("  MS",m.id,JSON.stringify(m.subject).slice(0,40),"-> children:",ch.length,ch.slice(0,3).map(c=>c.id+":"+c.typeName)); });
  // sample a parent that has children
  const [pid,kids] = [...childrenOf.entries()].sort((a,b)=>b[1].length-a[1].length)[0];
  const p=byId.get(pid);
  console.log("biggest parent:",pid,JSON.stringify(p.subject).slice(0,40),"type",p.typeName,"children",kids.length);
})();
