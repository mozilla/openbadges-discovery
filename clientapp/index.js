
var Moonboots = require('moonboots');
var _ = require('underscore');
var nunjucks = require('nunjucks');
var path = require('path');
var fs = require('fs');

module.exports = function (app, config) {
  config = config || {};

  var opts = _.extend({
    main: path.join(__dirname, 'app.js'),
    developmentMode: true,
    libraries: [
      path.join(__dirname, '../bower_components/jquery/jquery.js')
    ],
    beforeBuild: function () {
      console.log("Precompiling templates...");
      var templates = nunjucks.precompile(path.join(__dirname, '/templates'), {
        include: [/.*\.html/]
      });
      fs.writeFileSync(path.join(__dirname, 'build/precompiled.js'), templates);
    },
    server: app
  }, config);

  return new Moonboots(opts);
};