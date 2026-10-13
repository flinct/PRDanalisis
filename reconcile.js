const fs=require("fs"),http=require("http");
function get(p){return new Promise((r,j)=>{http.get("http://127.0.0.1:3001"+p,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>{try{r(JSON.parse(b))}catch(e){r({ok:false})}});}).on("error",j);});}
(async()=>{
  const raw=JSON.parse(fs.readFileSync("Assessments/audit/00-Timeline/.roadmap-seed.json","utf8"));
  const arr=Array.isArray(raw)?raw:(raw.roadmap_v1||[]);
  const noOp=arr.filter(t=>!t.opId && !(typeof t.id==="string"&&t.id.startsWith("op-")) && t.sourceColumn!=="OP" && (t.task||"").trim());
  console.log("STILL unpushed in seed:",noOp.length);
  noOp.forEach(t=>console.log("  -",(t.task||"").slice(0,55)));
  // OP current: subjects
  const d=await get("/api/dashboard/openproject/work-packages?all=1&includeClosed=1&pageSize=200");
  const subs=(d.allWorkPackages||[]).map(w=>({id:w.id,s:String(w.subject||"").trim().toLowerCase(),type:w.typeName}));
  console.log("\ncross-check each unpushed against OP subjects:");
  for(const t of noOp){const title=(t.task||"").trim().toLowerCase();const hit=subs.find(x=>x.s===title);console.log("  ",hit?("EXISTS #"+hit.id+" ["+hit.type+"]"):"MISSING","|",(t.task||"").slice(0,50));}
})();
