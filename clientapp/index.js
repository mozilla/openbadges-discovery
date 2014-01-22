var Moonboots = require('moonboots');
var _ = require('underscore');
var nunjucks = require('nunjucks');
var sass = require('node-sass');
var path = require('path');
var fs = require('fs');


module.exports = function (app, config) {
  config = config || {};

  var opts = _.extend({
    main: path.join(__dirname, 'app.js'),
    developmentMode: false,
    libraries: [
      path.join(__dirname, '../bower_components/foundation/js/vendor/jquery.js')
    ],
    stylesheets: [
      path.join(__dirname, 'build/normalize.css'),
      path.join(__dirname, 'build/styles.css')
    ],
    beforeBuildCSS: function () {
      console.log("Compiling SCSS...");
      /* We assume each stylesheet listed above gets built from a similarly named
         SCSS counterpart in clientapp/styles */
      opts.stylesheets.forEach(function (cssFile) {
        var scssFile = path.join(__dirname, 'styles', path.basename(cssFile, '.css') + '.scss');
        fs.writeFileSync(cssFile, sass.renderSync({
          file: scssFile
        }));
      });
    },
    beforeBuildJS: function () {
      console.log("Precompiling templates...");
      var templates = nunjucks.precompile(path.join(__dirname, '/templates'), {
        include: [/.*\.html/]
      });
      fs.writeFileSync(path.join(__dirname, 'build/precompiled.js'), templates);
    },
    server: app
  }, config);

  console.log("Development mode:", !!opts.developmentMode);

  return new Moonboots(opts);
};