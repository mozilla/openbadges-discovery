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
      var uid = window.app.currentUser._id;
      return '/api/user/' + uid + '/' + this.source;
    }
    else {
      return '/api/achievement';
    }
  },
  initialize: function (models, opts) {
    if (!opts && _.isObject(models) && !_.isArray(models)) {
      opts = models;
      models = [];
    }
    opts = opts || {};
    this.source = opts.source;
    this.params = {
      pageSize: opts.pageSize || 8,
    };
    if (opts.type) this.params.type = opts.type;
    if (opts.tag) this.params.tag = opts.tag;
    if (opts.search) this.params.search = opts.search;
  },
  sync: function (method, collection, options) {
    options.data = _.extend({}, this.params, options.data);
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
