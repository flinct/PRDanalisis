const http=require("http");
function get(p){return new Promise((r,j)=>{http.get("http://127.0.0.1:3001"+p,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>{try{r(JSON.parse(b))}catch(e){r({ok:false,raw:b.slice(0,80)})}});}).on("error",j);});}
(async()=>{
  for(const id of [4432,4457]){const s=await get("/api/dashboard/openproject/work-package/"+id);if(s.ok){const w=s.workPackage;console.log("#"+id,"["+w.typeName+"]",JSON.stringify(w.subject),"status:",w.statusName,"created:",w.createdAt);}else console.log("#"+id,"err");}
})();
