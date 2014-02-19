var nunjucks = require('nunjucks');
var templates = require('../build/precompiled.js');
var path = require('path');

module.exports = {};
Object.keys(window.nunjucksPrecompiled).forEach(function (name) {
  var methodPath = path.dirname(name).split(path.sep);
  var methodName = path.basename(name, '.html');
  methodName = methodName.replace(/-(.)/g, function (match, p1) { 
    return p1.toUpperCase(); 
  });
  var obj = module.exports;
  methodPath.forEach(function (step) {
    if (step === '.') return;
    if (!obj[step]) obj[step] = {};
    obj = obj[step];
  });
  obj[methodName] = nunjucks.render.bind(nunjucks, name);
});
