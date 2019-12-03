var {rmDirSync} = require("./tools");

function clean() {
  rmDirSync("publish");
  rmDirSync("out");
  rmDirSync("coverage");
}

clean();