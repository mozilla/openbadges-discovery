var Backbone = require('backbone');
var _ = require('underscore');
var Requirement = require('./pathway-requirement');

var GRID_WIDTH = 4;
var MIN_HEIGHT = 4;

module.exports = Backbone.Collection.extend({
  model: Requirement,
  url: '/api/pathway/dummy/requirement',
  rows: function () {
    var rows = [];
    var grid = this.groupBy(function (req) {
      return req.y;
    });
    _.each(_.pairs(grid), function (pair) {
      var key = pair[0];
      var rowReqs = pair[1];
      grid[key] = _.map(rowReqs, function (req) {
        return req.x;
      });
    });
    var lastRow = _.keys(grid).sort().pop() || 0;
    lastRow = Math.max(lastRow, MIN_HEIGHT-1); 
    for (var y = 0; y <= lastRow; y++) {
      rows.push([]);
      for (var x = 0; x < GRID_WIDTH; x++) {
        if (grid[y]) rows[y].push(grid[y].indexOf(x) !== -1);
        else rows[y].push(false);
      }
    }
    return rows;
  },
  move: function (start, end, opts) {
    start = start.split(',').map(function (coord) { return parseInt(coord); });
    end = end.split(',').map(function (coord) { return parseInt(coord); });
    var req = this.findWhere({x: start[0], y: start[1]});
    req.x = end[0];
    req.y = end[1];
    if (!opts || opts.sync)
      req.save(); 
    this.trigger('move');
  }
});
