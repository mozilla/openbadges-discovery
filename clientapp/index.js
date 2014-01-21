var Moonboots = require('moonboots');
var _ = require('underscore');
var path = require('path');

module.exports = function (app, config) {
  config = config || {};

  var opts = _.extend({
    main: path.join(__dirname, 'app.js'),
    developmentMode: true,
    server: app
  }, config);

  return new Moonboots(opts);
};