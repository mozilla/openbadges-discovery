var Backbone = require('backbone');
var _ = require('underscore');
var Achievement = require('./achievement');

var BACKPACK = 'earned';
var WISHLIST = 'favorite';
var PLEDGED = 'pledged';

module.exports = Backbone.Collection.extend({
  model: Achievement,
  url: function () {
    if (window.app.currentUser.loggedIn && this.source) {
      var uid = window.app.currentUser.id;
      return '/api/user/' + uid + '/' + this.source;
    }
    else {
      return '/api/achievement';
    }
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
    if (this.length) data.after = this.last().created_at;
    this.fetch({
      remove: false,
      data: data
    });
  }
});

module.exports.BACKPACK = BACKPACK;
module.exports.WISHLIST = WISHLIST;
module.exports.PLEDGED = PLEDGED;
