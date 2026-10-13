const fs=require("fs"),http=require("http");
function get(p){return new Promise((r,j)=>{http.get("http://127.0.0.1:3001"+p,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>{try{r(JSON.parse(b))}catch(e){r({ok:false,raw:b.slice(0,80)})}});}).on("error",j);});}
const arr=(()=>{let raw=JSON.parse(fs.readFileSync("Assessments/audit/00-Timeline/.roadmap-seed.json","utf8"));return Array.isArray(raw)?raw:(raw.roadmap_v1||[]);})();
const noOp=arr.filter(t=>!t.opId && !(typeof t.id==="string"&&t.id.startsWith("op-")) && t.sourceColumn!=="OP");
(async()=>{
  console.log("belum-push (bukan OP-origin):",noOp.length,"\n");
  for(const t of noOp){
    const title=(t.task||"").trim();
    const d=await get("/api/dashboard/openproject/search?q="+encodeURIComponent(title.slice(0,40))+"&projectId=7");
    const hits=(d.ok&&Array.isArray(d.results))?d.results:[];
    const exact=hits.find(h=>String(h.subject||"").trim().toLowerCase()===title.toLowerCase());
    const mark=exact?"EXACT-DUP(#"+exact.id+")":(hits.length?"maybe("+hits.length+")":"NEW");
    console.log((mark).padEnd(18),"| type:"+(t.type||"-"),"|",title.slice(0,50));
    if(hits.length&&!exact)hits.slice(0,2).forEach(h=>console.log("        ~ #"+h.id+" "+String(h.subject).slice(0,45)));
  }
})();
