var Backbone = require('backbone');
var _ = require('underscore');
var Achievement = require('./achievement');

var BACKPACK = 'backpack';
var WISHLIST = 'wishlist';
var PATHWAYS = 'pathways';

function randomType () {
  return Math.random() < 0.5 ? Achievement.BADGE : Achievement.PATHWAY;
}

var id = 1;
var type= null;
function fakeAchievement (opts) {
  if (opts.src === BACKPACK) {
       type = Achievement.BADGE;
  }
  else if (opts.src === PATHWAYS){
       type = Achievement.PATHWAY;
  }
  else{
       type = randomType() ;
  }
 // var type = opts.type || (opts.src === BACKPACK) ? Achievement.BADGE : randomType();// || (opts.src=== PATHWAYS) ? Achievement.PATHWAY : randomType()  ;
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
    this.type = opts.type;
  },
  sync: function (method, collection, options) {
    var pageSize = this.pageSize;
    var opts = {
      src: this.source,
      type: this.type
    };
    setTimeout(function () {
      options.success(_.times(pageSize, fakeAchievement.bind(null, opts)));
    }, 0);
  },
  addPage: function () {
    this.fetch({remove: false});
  }
});

module.exports.BACKPACK = BACKPACK;
module.exports.WISHLIST = WISHLIST;
module.exports.PATHWAYS = PATHWAYS;
