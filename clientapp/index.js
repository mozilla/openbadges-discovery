/* jshint browser:false, node:true, esnext:true */

var Moonboots = require('moonboots');
var _ = require('underscore');
var nunjucks = require('nunjucks');
var sass = require('node-sass');
var path = require('path');
var fs = require('fs');
var util = require('util');


module.exports = function (app, config) {
  config = config || {};

  var opts = _.extend({
    browserify: {
      transforms: [ "browserify-shim" ]
    },
    main: path.join(__dirname, 'app.js'),
    modulesDir: path.join(__dirname, './modules'),
    developmentMode: false,
    templateFile: path.join(__dirname, './templates/app.html'),
    libraries: [
      path.join(__dirname, '../bower_components/foundation/js/vendor/modernizr.js'),
      path.join(__dirname, '../bower_components/foundation/js/vendor/jquery.js'),
      path.join(__dirname, '../bower_components/foundation/js/vendor/fastclick.js'),
      path.join(__dirname, '../bower_components/foundation/js/foundation/foundation.js'),
      path.join(__dirname, '../bower_components/foundation/js/foundation/foundation.dropdown.js'),
      path.join(__dirname, '../bower_components/easeljs/lib/easeljs-0.7.1.min.js'),
      path.join(__dirname, '../bower_components/TweenJS/lib/tweenjs-0.5.1.min.js'),
      path.join(__dirname, '../node_modules/nunjucks/browser/nunjucks-slim.js')
    ],
    stylesheets: [
      path.join(__dirname, 'build/normalize.css'),
      path.join(__dirname, 'build/styles.css')
    ],
    beforeBuildCSS: function () {
      util.log("Compiling SCSS...");
      /* We assume each stylesheet listed above gets built from a similarly named
         SCSS counterpart in clientapp/styles */
      opts.stylesheets.forEach(function (cssFile) {
        var scssFile = path.join(__dirname, 'styles', path.basename(cssFile, '.css') + '.scss');
        util.log("  " + scssFile);
        fs.writeFileSync(cssFile, sass.renderSync({
          file: scssFile
        }));
      });
      util.log("  Done.");
    },
    beforeBuildJS: function () {
      util.log("Precompiling templates...");
      var templates = nunjucks.precompile(path.join(__dirname, '/templates'), {
        include: [/.*\.html/]
      });
      fs.writeFileSync(path.join(__dirname, 'build/precompiled.js'), templates);
      util.log("  Done.");
    },
    server: app
  }, config);

  util.log("Development mode: " + !!opts.developmentMode);

  return new Moonboots(opts);
};