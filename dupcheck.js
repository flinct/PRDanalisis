const http=require("http");
function get(p){return new Promise((r,j)=>{http.get("http://127.0.0.1:3001"+p,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>{try{r(JSON.parse(b))}catch(e){r({ok:false})}});}).on("error",j);});}
(async()=>{
  const d=await get("/api/dashboard/openproject/work-packages?all=1&includeClosed=1&pageSize=200");
  const rows=d.allWorkPackages||[];
  const titles=["infra stability","sales module","9a —","10a —","faq (halaman","wizard setting","db topology","chat bot auto","widget app","8a —"];
  console.log("duplicate scan for today's pushed titles:");
  for(const t of titles){const m=rows.filter(w=>String(w.subject||"").toLowerCase().includes(t));console.log("  "+(m.length>1?"⚠ DUP("+m.length+")":"ok(1)"),t,"->",m.map(w=>"#"+w.id).join(","));}
})();
