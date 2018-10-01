var {rmDirSync} = require("./tools");
var {clean} = require("./clean");

function cleanAll() {
  clean();
  rmDirSync("node_modules");
}

module.exports = {
  cleanAll
};