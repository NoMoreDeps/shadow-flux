var fs = require("fs");

function mkDirSync(source) {
  console.log(source)
  var sourceTab = source.replace(/\\\\/g, "/").split("/");
  sourceTab.reduce( (previous, current) => {
    let path = `${previous}`;
    previous && (current = `${previous}/${current}`);
    !fs.existsSync(path) && fs.mkdirSync(path);
    path = `${current}`;
    !fs.existsSync(path) && fs.mkdirSync(path);
    return current;
  });
}

function copySync(source, target) {
  let path = `${source}`;
  let files = [];
  let dirs = [];

  fs.readdirSync(path).forEach( item => {
    if (fs.lstatSync(`${source}/${item}`).isFile()) {
      files.push(item);
    } else if (fs.lstatSync(`${source}/${item}`).isDirectory()) {
      dirs.push(item);
    }
  });

  files.forEach(file => {
    fs.copyFileSync(`${source}/${file}`, `${target}/${file}`);
  });

  dirs.forEach( dir => {
    mkDirSync(`${target}/${dir}`);
    copySync(`${source}/${dir}`, `${target}/${dir}`);
  });
}

function rmDirSync(source) {
  let path = `${source}`;
  let files = [];
  let dirs = [];
  fs.readdirSync(path).forEach( item => {
    if (fs.lstatSync(`${source}/${item}`).isFile()) {
      files.push(item);
    } else if (fs.lstatSync(`${source}/${item}`).isDirectory()) {
      dirs.push(item);
    }
  });

  files.forEach( file => {
    fs.unlinkSync(`${source}/${file}`);
  });

  dirs.forEach( dir => {
    rmDirSync(`${source}/${dir}`);
    fs.rmdirSync(`${source}/${dir}`);
  })
}

module.exports = {
  mkDirSync,
  copySync,
  rmDirSync
};
