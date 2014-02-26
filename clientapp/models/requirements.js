var Backbone = require('backbone');
var Requirement = require('./requirement');
var _ = require('underscore');

var id = 1;
function fakeRequirement (i) {
  var data = {
    id: id++,
    x: Math.floor(Math.random()*3),
    y: i, 
    name: 'Requirement ' + id,
    core: (Math.random()*2 < 1)
  };
  return data;
}

module.exports = Backbone.Collection.extend({
  model: Requirement,
  initialize: function (opts) {
    opts = opts || {};
    this.parentId = opts.parentId;
  },
  sync: function (method, collection, options) {
    setTimeout(function () {
      options.success(_.times(5, fakeRequirement));
    }, 0);
  }
});
