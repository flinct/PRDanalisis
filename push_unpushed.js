const fs=require("fs"),http=require("http");
function req(method,p,body){return new Promise((res,rej)=>{const data=body?JSON.stringify(body):null;const o={host:"127.0.0.1",port:3001,path:p,method,headers:body?{"Content-Type":"application/json","Content-Length":data.length}:{}};const r=http.request(o,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>{try{res(JSON.parse(b))}catch(e){res({ok:false,raw:b.slice(0,120)})}});});r.on("error",rej);if(data)r.write(data);r.end();});}
const SEED="Assessments/audit/00-Timeline/.roadmap-seed.json";
(async()=>{
  let raw=JSON.parse(fs.readFileSync(SEED,"utf8"));
  const isDict=!Array.isArray(raw);
  let arr=isDict?(raw.roadmap_v1||[]):raw;
  const FEATURE=4;
  const results=[];
  for(const t of arr){
    if(t.opId) continue;
    if(typeof t.id==="string"&&t.id.startsWith("op-")) continue;
    if(t.sourceColumn==="OP") continue;
    const title=(t.task||"").trim();
    if(!title) continue;
    // fraud dashboard -> link existing #3400, no create
    if(title.toLowerCase().startsWith("fraud dashboard")){ t.opId="3400"; results.push(["LINK #3400",title]); continue; }
    // priority map P0-P3; backlog-ish stays as-is (OP priority optional)
    const body={subject:title,projectId:7,typeId:FEATURE,description:t.desc||""};
    const d=await req("POST","/api/dashboard/openproject/work-package",body);
    if(d.ok&&d.workPackage){ t.opId=String(d.workPackage.id); results.push(["CREATED #"+d.workPackage.id,title]); }
    else { results.push(["FAIL: "+(d.error||d.raw||"?").slice(0,60),title]); }
  }
  // write back
  if(isDict){ raw.roadmap_v1=arr; } else { raw=arr; }
  fs.writeFileSync(SEED,JSON.stringify(raw,null,2),"utf8");
  console.log("=== PUSH RESULTS ===");
  results.forEach(([s,t])=>console.log(s.padEnd(18),"|",t.slice(0,55)));
  console.log("\nseed updated. opId now set:",arr.filter(x=>x.opId).length,"/",arr.length);
})();
