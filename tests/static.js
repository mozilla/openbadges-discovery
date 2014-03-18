const express = require('express');
const config = require('../app/lib/config');
const browserify = require('browserify');
const path = require('path');
const fs = require('fs');

const PORT = config('PORT', 3000);

var app = express();

var b = browserify();
var modulesDir = path.join(__dirname, '../clientapp/modules');
var modules = fs.readdirSync(modulesDir);
modules.forEach(function (moduleFileName) {
  if (path.extname(moduleFileName) === '.js') {
    b.require(modulesDir + '/' + moduleFileName, {expose: path.basename(moduleFileName, '.js')});
  }
});
b.bundle({}, function (err, js) {
  if (err) throw err;
  app.get('/modules.js', function (req, res, next) {
    res.type('application/javascript');
    res.send(js);
  });
});

app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));
app.use('/static', express.static(path.join(__dirname, '../static')));
app.use(express.static(path.join(__dirname, 'static')));

app.listen(PORT, function(err) {
  if (err) {
    throw err;
  }

  console.log('Listening on port ' + PORT + '.');
});
