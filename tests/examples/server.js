const express = require('express');
const config = require('../../app/lib/config');
const browserify = require('browserify');
const path = require('path');
const fs = require('fs');

const PORT = config('PORT', 3000);
function concatFiles(arrayOfFiles) {
    return (arrayOfFiles || []).reduce(function (result, fileName) {
        return result + fs.readFileSync(fileName) + '\n';
    }, '');
}

var app = express();

var b = browserify();
var modulesDir = path.join(__dirname, '../../clientapp/modules');
var main = path.join(__dirname, 'editor.js');
var modules = fs.readdirSync(modulesDir);
modules.forEach(function (moduleFileName) {
  if (path.extname(moduleFileName) === '.js') {
    b.require(modulesDir + '/' + moduleFileName, {expose: path.basename(moduleFileName, '.js')});
  }
});
b.add(main);
app.get('/editor.js', function (req, res, next) {
  b.bundle({debug: true}, function (err, js) {
    if (err) throw err;
    res.type('application/javascript');
    res.send(js);
  });
});

app.use('/bower_components', express.static(path.join(__dirname, '../../bower_components')));
app.use('/static', express.static(path.join(__dirname, '../../static')));
app.use(express.static(__dirname));

app.listen(PORT, function(err) {
  if (err) {
    throw err;
  }

  console.log('Listening on port ' + PORT + '.');
});
