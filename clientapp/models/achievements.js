var Backbone = require('backbone');
var Achievement = require('./achievement');

module.exports = Backbone.Collection.extend({
  model: Achievement
});
