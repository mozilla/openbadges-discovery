var Backbone = require('backbone');
var Note = require('./note');

module.exports = Backbone.Collection.extend({
  model: Note,
  url: function () {
    var id = this.parent ? this.parent._id : this.parentId;
    return '/api/pathway/' + id + '/note';
  },
  initialize: function (opts) {
    opts = opts || {};
    this.parentId = opts.parentId;
  }
});
