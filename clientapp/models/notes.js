var Backbone = require('backbone');
var Note = require('./note');

module.exports = Backbone.Collection.extend({
  model: Note,
  url: function () {
    return '/api/pathway/' + this.parentId + '/note';
  },
  initialize: function (opts) {
    opts = opts || {};
    this.parentId = opts.parentId;
  }
});
