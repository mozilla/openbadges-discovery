var Backbone = require('backbone');
var Requirement = require('./requirement');
var _ = require('underscore');

module.exports = Backbone.Collection.extend({
  model: Requirement,
  url: function () {
    var id = this.parent ? this.parent._id : this.parentId;
    return '/api/pathway/' + id + '/requirement';
  },
  initialize: function (opts) {
    opts = opts || {};
    this.parentId = opts.parentId;
  }
});
