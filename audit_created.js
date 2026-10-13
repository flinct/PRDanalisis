const http=require("http");
function get(p){return new Promise((r,j)=>{http.get("http://127.0.0.1:3001"+p,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>{try{r(JSON.parse(b))}catch(e){r({ok:false})}});}).on("error",j);});}
(async()=>{
  const d=await get("/api/dashboard/openproject/work-packages?all=1&includeClosed=1&pageSize=200");
  const rows=d.allWorkPackages||[];
  // recent = id >= 4440 (our push window today)
  const recent=rows.filter(w=>w.id>=4440).sort((a,b)=>a.id-b.id);
  console.log("WP id>=4440 (today's creates):",recent.length);
  recent.forEach(w=>console.log("  #"+w.id,"["+w.typeName+"]",JSON.stringify(w.subject).slice(0,60)));
})();
