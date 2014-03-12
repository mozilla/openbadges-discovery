var HumanView = require('human-view');
var templates = require('templates');
var RequirementView = require('./requirement');

function Marker () {
  var r = 15;
  var sides = 6;
  var angle = 30;
  var shape = new createjs.Shape();
  shape.graphics.beginFill("#CCC").drawPolyStar(0, 0, r, sides, 0, angle);
  shape.setBounds(-r, -r, r*2, r*2);
  return shape;
}

function Tile (opts) {
  opts = opts || {};

  var width = opts.w;
  var height = opts.w || opts.h;
  var model = opts.model;

  var container = new createjs.Container();
  container.setBounds(0, 0, width, height);

  var rect = new createjs.Shape();
  var margin = 10;
  var corners = 10;
  var rw = width - (2 * margin);
  var rh = height - (2 * margin);
  rect.graphics.beginFill("#EEE").drawRoundRect(margin, margin, rw, rh, corners);
  rect.setBounds(0, 0, rw, rh);
  container.addChild(rect);

  var img = new createjs.Bitmap('/static/badge.png');

  function scaleToMax (img, w, h) {
    var imgBounds = img.getBounds();
    var width = Math.min(imgBounds.width, w);
    var height = Math.min(imgBounds.height, h);
    var scale = Math.min(width / imgBounds.width, height / imgBounds.height);
    img.scaleX = img.scaleY = scale;
  }

  var fontSize = 24;
  img.image.onload = function drawBadge () {
    var rBounds = rect.getBounds();
    scaleToMax(img, rBounds.width, rBounds.height - (fontSize * 2));
    imgBounds = img.getTransformedBounds();
    img.x = margin + (rBounds.width / 2) - (imgBounds.width / 2);
    img.y = margin + (rBounds.height / 2) - (imgBounds.height / 2) - (fontSize / 2);
    container.addChild(img);

    var t = new createjs.Text(model.name, fontSize + "px 'Helvetica Neue', Helvetica, Arial, sans-serif");
    t.x = margin + (rBounds.width / 2) - (t.getBounds().width /2);
    t.y = img.y + imgBounds.height;
    container.addChild(t);
  };

  return container;
}

module.exports = HumanView.extend({
  initialize: function (opts) {
    this.canvas = opts.canvas || document.createElement('canvas');
    if (opts.width) this.canvas.width = this.initialWidth = opts.width;
    else this.initialWidth = this.canvas.width;
    this.columns = 3;
  },
  gridToPixel: function (gx, gy) {
    if (typeof gx === 'object') {
      var obj = gx;
      gx = obj.x;
      gy = obj.y;
    }
    var colW = this.initialWidth / this.columns;
    var x = gx * colW;
    var y = gy * colW;
    return {
      x: x,
      y: y,
      w: colW,
      cx: x + (colW / 2),
      cy: y + (colW / 2),
      bounds: [x, y, colW, colW]
    };
  },
  pixelToGrid: function (x, y) {
    if (typeof x === 'object') {
      var obj = x;
      x = obj.x;
      y = obj.y;
    }
    var colW = this.initialWidth / this.columns;
    var col = Math.floor(x / colW);
    var row = Math.floor(y / colW);
    return {
      x: col,
      y: row
    };
  },
  render: function () {
    this.stage = new createjs.Stage(this.canvas);
    createjs.Touch.enable(this.stage, true, true);

    for (var row = 0; row < 5; row++) {
      for (var col = 0; col < this.columns; col++) {
        var coords = this.gridToPixel(col, row);
        var m = new Marker();
        m.x = coords.cx;
        m.y = coords.cy;
        this.stage.addChild(m);
      }
    }
    this.stage.update();

    if (this.collection.length) {
      var self = this;
      this.collection.models.forEach(function (model) {
        var coords = self.gridToPixel(model.x, model.y);
        var tile = new Tile({
          w: self.initialWidth / self.columns,
          model: model
        });
        tile.x = coords.x;
        tile.y = coords.y;

        tile.on('pressmove', function (evt) {
          var coords = self.gridToPixel(self.pixelToGrid(self.stage.globalToLocal(evt.stageX, evt.stageY)));
          this.x = coords.x;
          this.y = coords.y;
          self.stage.update();
          evt.nativeEvent.preventDefault();
        });

        self.stage.addChild(tile);
      });
    }
    this.collection.on('sync', this.render.bind(this));

    this.pollAttached();
    this.setElement(this.canvas);
    return this;
  },
  pollAttached: function () {
    var parent = this.$el.parent();
    if (parent.length) this.onAttach(parent[0]);
    else setTimeout(this.pollAttached.bind(this), 500);
  },
  onAttach: function (parent) {
    this.initialHeight = this.stage.getBounds().height;
    this.scaleToParentWidth();
    $(window).bind('resize', function () {
      this.scaleToParentWidth();
    }.bind(this));
  },
  scaleToParentWidth: function () {
    var scale = this.$el.parent().width() / this.initialWidth;
    this.stage.scaleX = scale;
    this.stage.scaleY = scale;

    this.stage.canvas.width = this.initialWidth * scale;
    this.stage.canvas.height = this.initialHeight * scale;

    this.stage.update();
  }
});
