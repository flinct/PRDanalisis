const fs=require("fs"),http=require("http");
function req(body){return new Promise((res,rej)=>{const data=Buffer.from(JSON.stringify(body),"utf8");const o={host:"127.0.0.1",port:3001,path:"/api/dashboard/openproject/work-package",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}};const r=http.request(o,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>{try{res(JSON.parse(b))}catch(e){res({ok:false,raw:b.slice(0,120)})}});});r.on("error",rej);r.write(data);r.end();});}
const SEED="Assessments/audit/00-Timeline/.roadmap-seed.json";
(async()=>{
  const raw=JSON.parse(fs.readFileSync(SEED,"utf8"));
  const arr=Array.isArray(raw)?raw:(raw.roadmap_v1||[]);
  const out=[];
  for(const t of arr){
    if(t.opId) continue;
    if(typeof t.id==="string"&&t.id.startsWith("op-")) continue;
    if(t.sourceColumn==="OP") continue;
    const title=(t.task||"").trim(); if(!title) continue;
    // 8A already exists as #4455 — just record opId, no create
    if(title.toLowerCase().startsWith("8a —")||title.toLowerCase().startsWith("8a -")){ t.opId="4455"; out.push(["RECORD #4455",title]); continue; }
    const d=await req({subject:title,projectId:7,typeId:4,description:t.desc||""});
    if(d.ok&&d.workPackage){ t.opId=String(d.workPackage.id); out.push(["CREATED #"+d.workPackage.id,title]); }
    else { out.push(["FAIL:"+(d.error||d.raw||"?").slice(0,50),title]); }
  }
  if(Array.isArray(raw)) fs.writeFileSync(SEED,JSON.stringify(arr,null,2),"utf8"); else { raw.roadmap_v1=arr; fs.writeFileSync(SEED,JSON.stringify(raw,null,2),"utf8"); }
  console.log("=== PUSH REST ===");
  out.forEach(([s,t])=>console.log(s.padEnd(16),"|",t.slice(0,55)));
  const left=arr.filter(t=>!t.opId && !(typeof t.id==="string"&&t.id.startsWith("op-")) && t.sourceColumn!=="OP" && (t.task||"").trim());
  console.log("\nstill unpushed:",left.length, "| opId set:",arr.filter(x=>x.opId).length,"/",arr.length);
})();
