var Backbone = require('backbone');
var _ = require('underscore');
var Achievement = require('./achievement');

var id = 1;
function fakeAchievement (src) {
  var type = (src === module.exports.BACKPACK) ? 'Badge' : Math.random() < 0.5 ? 'Badge' : 'Pathway';
  var data = {
    id: id++,
    type: type.toLowerCase(),
    title: 'A Very Long ' + type + ' Title',
    tags: ['service', 'barista', 'coffeelover', 'fake'],
    creator: 'Starbucks'
  };
  return data;
}

module.exports = Backbone.Collection.extend({
  model: Achievement,
  initialize: function (opts) {
    opts = opts || {};
    this.pageSize = opts.pageSize || 8;
    this.source = opts.source;
  },
  sync: function (method, collection, options) {
    var pageSize = this.pageSize;
    var src = this.source;
    setTimeout(function () {
      options.success(_.times(pageSize, fakeAchievement.bind(null, src)));
    }, 0);
  },
  addPage: function () {
    this.fetch({remove: false});
  }
});

module.exports.BACKPACK = 'backpack';
module.exports.WISHLIST = 'wishlist';
