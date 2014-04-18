var Backbone = require('backbone');
var _ = require('underscore');
var Achievement = require('./achievement');

var BACKPACK = 'backpack';
var WISHLIST = 'wishlist';

module.exports = Backbone.Collection.extend({
  model: Achievement,
  url: function () {
    return '/api/achievement';
  },
  initialize: function (opts) {
    opts = opts || {};
    this.pageSize = opts.pageSize || 8;
    this.source = opts.source;
    this.type = opts.type;
  },
  sync: function (method, collection, options) {
    options.data = _.extend({ pageSize: collection.pageSize }, options.data);
    return Backbone.sync(method, collection, options);
  },
  addPage: function () {
    var data = {};
    if (this.length) data.after = this.last().order;
    this.fetch({
      remove: false,
      data: data
    });
  }
});

module.exports.BACKPACK = BACKPACK;
module.exports.WISHLIST = WISHLIST;
