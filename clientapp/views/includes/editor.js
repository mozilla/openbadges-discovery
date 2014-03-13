var HumanView = require('human-view');
var templates = require('templates');
var RequirementView = require('./requirement');
var _ = require('underscore');

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

function Editor (opts) {
  opts = opts || {};

  var self = this;

  self.canvas = opts.canvas;
  self.stage = new createjs.Stage(self.canvas);
  createjs.Touch.enable(self.stage, true, true);
  self.columns = opts.columns;
  if (opts.width) self.canvas.width = self.initialWidth = opts.width;
  else self.initialWidth = self.canvas.width;

  self.allowRearrange = false;

  self.rearrange = function (toggle) {
    if (typeof toggle !== 'undefined') self.allowRearrange = !!toggle;
    else self.allowRearrange = true;
  };

  if (opts.mode === 'edit') self.rearrange();

  self.remove = function () {
    createjs.Touch.disable(self.stage);
    if (attachIntervalId) {
      clearInterval(attachIntervalId);
    }
  };

  self.gridToPixel = function (gx, gy) {
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
  };

  self.pixelToGrid = function (x, y) {
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
  };

  self.render = function (models) {
    for (var row = 0; row < 5; row++) {
      for (var col = 0; col < self.columns; col++) {
        var coords = self.gridToPixel(col, row);
        var m = new Marker();
        m.x = coords.cx;
        m.y = coords.cy;
        self.stage.addChild(m);
      }
    }
    self.stage.update();

    if (models.length) {
      models.forEach(function (model) {
        var coords = self.gridToPixel(model.x, model.y);
        var tile = new Tile({
          w: self.initialWidth / self.columns,
          model: model
        });
        tile.x = coords.x;
        tile.y = coords.y;

        tile.on('pressmove', function (evt) {
          if (self.allowRearrange) {
            var tile = this;
            var coords = self.gridToPixel(self.pixelToGrid(self.stage.globalToLocal(evt.stageX, evt.stageY)));
            tile.x = coords.x;
            tile.y = coords.y;
            self.stage.update();
            evt.nativeEvent.preventDefault();
          }
        });

        self.stage.addChild(tile);
      });
    }
  };

  function onAttach (parent) {
    self.initialHeight = self.stage.getBounds().height;
    self.scaleToParentWidth();
    $(window).bind('resize', function () {
      self.scaleToParentWidth();
    });
  }

  self.scaleToParentWidth = function () {
    var scale = $(self.canvas).parent().width() / self.initialWidth;
    self.stage.scaleX = scale;
    self.stage.scaleY = scale;

    self.stage.canvas.width = self.initialWidth * scale;
    self.stage.canvas.height = self.initialHeight * scale;

    self.stage.update();
  };

  function pollAttached () {
    var parents = $(self.canvas).parents('body');
    if (!parents.length) return;
    clearInterval(attachIntervalId);
    attachIntervalId = null;
    onAttach($(self.canvas).parent()[0]);
  }
  var attachIntervalId = setInterval(pollAttached, 500);

  return self;
}

module.exports = HumanView.extend({
  template: templates.includes.editor,
  initialize: function (opts) {
    this.mode = opts.mode;
    this.editorOpts = {
      width: opts.width
    };
  },
  render: function () {
    this.renderAndBind();
    this.editor = new Editor(_.extend({
      columns: 3,
      canvas: this.$('canvas')[0],
      mode: this.mode
    }, this.editorOpts));
    this.editor.render(this.collection.models);
    this.collection.on('sync', function () {
      this.editor.render(this.collection.models);
    }.bind(this));
    return this;
  },
  remove: function () {
    this.editor.remove();
    this.$el.remove();
    this.stopListening();
    return this;
  },
  events: {
    'click .js-rearrange': 'rearrange'
  },
  rearrange: function (evt) {
    this.editor.rearrange();
    evt.preventDefault();
    evt.stopPropagation();
  }
});
