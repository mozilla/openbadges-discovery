var Backbone = require('backbone');
var _ = require('underscore');
var Achievement = require('./achievement');

var id = 1;
function fakeAchievement () {
  var type = Math.random() < 0.5 ? 'Badge' : 'Pathway';
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
  },
  sync: function (method, collection, options) {
    var pageSize = this.pageSize;
    setTimeout(function () {
      options.success(_.times(pageSize, fakeAchievement));
    }, 0);
  },
  addPage: function () {
    this.fetch({remove: false});
  }
});
