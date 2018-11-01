var fs = require("fs");
var {rmDirSync, copySync, mkDirSync} = require("./tools");


function prepareNpmPublish() {
  // Setup output folder
  rmDirSync("publish");
  copySync("out/", "publish");
  let json    = JSON.parse(fs.readFileSync("package.json")) ;
  let version = json.version.split(".")                     ;
  
  version[version.length - 1] = Number(version[version.length - 1]) + 1;
  json.version = version.join(".");
  if (!fs.existsSync("publish/package.json")) {
    fs.writeFileSync("publish/package.json", JSON.stringify(json, null, 2) ,"utf8");
    console.log("done !");
  } else {
    console.error("out / publish directory not found. Please run yarn build first")
  }
}

prepareNpmPublish();