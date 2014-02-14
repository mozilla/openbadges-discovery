var Backbone = require('backbone');
var _ = require('underscore');
var Achievement = require('./achievement');

function fakeAchievement () {
  var type = Math.random() < 0.5 ? 'Badge' : 'Pathway';
  var data = {
    type: type.toLowerCase(),
    title: 'A Very Long ' + type + ' Title',
    tags: ['service', 'barista', 'coffeelover', 'fake'],
    creator: 'Starbucks'
  };
  if (me.loggedIn)
    data.favorite = Math.random() < 0.2 ? true : false;
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
  }
});
