const http=require("http");
function req(method,p,body){return new Promise((res,rej)=>{const data=body?JSON.stringify(body):null;const o={host:"127.0.0.1",port:3001,path:p,method,headers:body?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{}};const r=http.request(o,x=>{let b="";x.on("data",c=>b+=c);x.on("end",()=>res({status:x.statusCode,body:b}));});r.on("error",rej);if(data)r.write(data);r.end();});}
(async()=>{
  const c=await req("POST","/api/dashboard/openproject/work-package",{subject:"8A — Ticket Webhook Enhancement + Two-Way Sync",projectId:7,typeId:4,description:""});
  console.log("status",c.status);
  console.log("body",c.body.slice(0,400));
})();
