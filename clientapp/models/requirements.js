var Backbone = require('backbone');
var Requirement = require('./requirement');
var _ = require('underscore');

module.exports = Backbone.Collection.extend({
  model: Requirement,
  url: function () {
    return '/api/pathway/' + this.parentId + '/requirement';
  },
  initialize: function (opts) {
    opts = opts || {};
    this.parentId = opts.parentId;
  }
});
