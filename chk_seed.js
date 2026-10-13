const fs=require("fs");
const p="Assessments/audit/00-Timeline/.roadmap-seed.json";
let raw=JSON.parse(fs.readFileSync(p,"utf8"));
let arr=Array.isArray(raw)?raw:(raw.roadmap_v1||[]);
console.log("total roadmap_v1 tasks:",arr.length);
const withOp=arr.filter(t=>t.opId);
const noOp=arr.filter(t=>!t.opId);
console.log("sudah ada opId (pushed):",withOp.length);
console.log("BELUM ada opId (perlu push):",noOp.length);
// also: how many are OP-origin rows already (sourceColumn OP / id op-)
const opOrigin=arr.filter(t=>t.sourceColumn==="OP"||(typeof t.id==="string"&&t.id.startsWith("op-")));
console.log("OP-origin rows (bukan buatan lokal):",opOrigin.length);
console.log("\nsample belum-push (first 20):");
noOp.slice(0,20).forEach(t=>console.log("  ["+(t.priority||"?")+"]",(t.task||"(no title)").slice(0,55),"| area:",(t.strategicArea||"-"),"| type:",(t.type||"-"),"| status:",(t.status||"-")));
