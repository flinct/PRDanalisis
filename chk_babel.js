const fs=require("fs"),Babel=require("@babel/standalone");const p=process.argv[2];
try{Babel.transform(fs.readFileSync(p,"utf8"),{presets:["react"],filename:p});console.log("BABEL_OK");}
catch(e){console.log("BABEL_FAIL:",e.message);process.exit(1);}
