function makeMarker (col, row, grid) {
  var r = 15;
  var sides = 6;
  var angle = 30;
  var shape = new createjs.Shape();
  shape.graphics.beginFill("#CCC").drawPolyStar(0, 0, r, sides, 0, angle);
  shape.resize = function () {
    var coords = grid.gridToPixel(col, row);
    shape.x = coords.cx;
    shape.y = coords.cy;
    shape.setBounds(-coords.w/2, -coords.w/2, coords.w, coords.w);
  };
  shape.resize();
  return shape;
}

function makeTile (model, grid) {
  var width = grid.canvas.width / grid.columns;
  var height = width;

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
  var t = new createjs.Text(model.name, fontSize + "px 'Helvetica Neue', Helvetica, Arial, sans-serif");

  img.image.onload = function drawBadge () {
    var rBounds = rect.getBounds();
    scaleToMax(img, rBounds.width, rBounds.height - (fontSize * 2));
    imgBounds = img.getTransformedBounds();
    img.x = margin + (rBounds.width / 2) - (imgBounds.width / 2);
    img.y = margin + (rBounds.height / 2) - (imgBounds.height / 2) - (fontSize / 2);
    container.addChild(img);

    t.x = margin + (rBounds.width / 2) - (t.getBounds().width /2);
    t.y = img.y + imgBounds.height;
    container.addChild(t);

    container.dispatchEvent('ready');
  };

  container.resize = function () {
    var width = grid.canvas.width / grid.columns;
    var height = width;
    container.setBounds(0, 0, width, height);
    var rw = width - (2 * margin);
    var rh = height - (2 * margin);
    rect.graphics.clear().beginFill("#EEE").drawRoundRect(margin, margin, rw, rh, corners);
    rect.setBounds(0, 0, rw, rh);
    var rBounds = rect.getBounds();
    scaleToMax(img, rBounds.width, rBounds.height - (fontSize * 2));
    imgBounds = img.getTransformedBounds();
    img.x = margin + (rBounds.width / 2) - (imgBounds.width / 2);
    img.y = margin + (rBounds.height / 2) - (imgBounds.height / 2) - (fontSize / 2);
    t.x = margin + (rBounds.width / 2) - (t.getBounds().width /2);
    t.y = img.y + imgBounds.height;
    var coords = grid.gridToPixel(model.x, model.y);
    container.x = coords.x;
    container.y = coords.y;
  };

  var coords = grid.gridToPixel(model.x, model.y);
  container.x = coords.x;
  container.y = coords.y;
  return container;
}

function Editor (opts) {
  opts = opts || {};

  var self = this;

  self.canvas = opts.canvas;
  self.stage = new createjs.Stage(self.canvas);
  createjs.Touch.enable(self.stage, true, true);
  self.columns = opts.columns;

  self.allowRearrange = false;

  self.rearrange = function (toggle) {
    if (typeof toggle !== 'undefined') self.allowRearrange = !!toggle;
    else self.allowRearrange = true;
  };

  if (opts.mode === 'edit') self.rearrange();

  self.remove = function () {
    createjs.Touch.disable(self.stage);
  };

  self.gridToPixel = function (gx, gy) {
    if (typeof gx === 'object') {
      var obj = gx;
      gx = obj.x;
      gy = obj.y;
    }
    var colW = this.canvas.width / this.columns;
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
    var colW = this.canvas.width / this.columns;
    var col = Math.floor(x / colW);
    var row = Math.floor(y / colW);
    return {
      x: col,
      y: row
    };
  };

  self.redraw = function () {
    self.render(self.models);
  };

  self.render = function (models) {
    self.models = models;
    self.stage.removeAllChildren();

    var maxRow = 0;
    if (models.length) {
      models.forEach(function (model) {
        maxRow = Math.max(maxRow, model.y);
        var tile = makeTile(model, self);
        tile.on('ready', function () {
          self.stage.addChild(tile);
          self.stage.update();
        });

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
      });
    }

    for (var row = 0; row <= maxRow + 2; row++) {
      for (var col = 0; col < self.columns; col++) {
        var m = new makeMarker(col, row, self);
        self.stage.addChild(m);
      }
    }

    self.stage.update();
  };

  self.resize = function () {
    for (var idx = 0; idx < self.stage.getNumChildren(); idx++) {
      var child = self.stage.getChildAt(idx);
      if (child.resize) child.resize();
    }
    self.stage.update();
  };

  self.stage.on('tickstart', function () {
    self.sizeCanvasToStageHeight();
  });

  self.sizeCanvasToStageHeight = function () {
    self.stage.canvas.height = self.stage.getTransformedBounds().height;
  };

  return self;
}

module.exports = Editor;
