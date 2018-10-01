var fs = require("fs");
var {rmDirSync, copySync, mkDirSync} = require("./tools");


function prepareNpmPublish() {
  // Setup output folder
  rmDirSync("publish");
  copySync("out/src", "publish");
  let json = JSON.parse(fs.readFileSync("package.json"));
  let version = json.version.split(".");
  version[version.length - 1] = Number(version[version.length - 1]) + 1;
  json.version = version.join(".");
  fs.writeFileSync("publish/package.json", JSON.stringify(json, null, 2) ,"utf8");
  console.log("done !");
}

prepareNpmPublish();