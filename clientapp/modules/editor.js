var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = window.$; // WHHHHHHYYYYYYYY?!

function World () { 

  Object.defineProperty(this, "columnWidth", {
    get: function () { return this.canvasWidth / this.columnCount; },
    set: function () { throw new Error('Cannot set columnWidth directly'); }
  });

  this.gridToPixel = function gridToPixel (gx, gy) {
    if (typeof gx === 'object') {
      var obj = gx;
      gx = obj.x;
      gy = obj.y;
    }
    var x = gx * this.columnWidth;
    var y = gy * this.columnWidth;
    return {
      x: x,
      y: y,
      w: this.columnWidth,
      cx: x + (this.columnWidth / 2),
      cy: y + (this.columnWidth / 2),
      bounds: [x, y, this.columnWidth, this.columnWidth]
    };
  };

  this.pixelToGrid = function pixelToGrid (x, y) {
    if (typeof x === 'object') {
      var obj = x;
      x = obj.x;
      y = obj.y;
    }
    var col = Math.floor(x / this.columnWidth);
    var row = Math.floor(y / this.columnWidth);
    return {
      x: col,
      y: row
    };
  };

  return this;
}
var world = new World();

function makePathwayItem(item) {
  var container = new createjs.Container();
  container.model = item;
  container.name = item.id;
  container.setBounds(0, 0, world.columnWidth, world.columnWidth);
  var rect = new createjs.Shape();
  var img = new createjs.Bitmap('/static/badge.png');
  var title = new createjs.Text(item.name, "24px 'Helvetica Neue', Helvetica, Arial, sans-serif");
  container.addChild(rect, img, title);

  img.image.onload = function () {
    container.layout();
    container.dispatchEvent('ready'); 
  };

  function scaleToMax (img, w, h) {
    var imgBounds = img.getBounds();
    if (imgBounds) {
      var width = Math.min(imgBounds.width, w);
      var height = Math.min(imgBounds.height, h);
      var scale = Math.min(width / imgBounds.width, height / imgBounds.height);
      img.scaleX = img.scaleY = scale;
    }
    return img.getTransformedBounds();
  }

  container.layout = function () {
    var width = world.columnWidth;
    var height = width;
    container.setBounds(0, 0, width, height);

    var margin = 10;
    var corners = 10;
    var rw = width - (2 * margin);
    var rh = height - (2 * margin);
    var fill = item.core ? "#ECC" : "#EEE";
    rect.graphics.clear().beginFill(fill)
      .drawRoundRect(margin, margin, rw, rh, corners);
    rect.setBounds(0, 0, rw, rh);

    var imgBounds = scaleToMax(img, rw, rh - (24 * 2));
    if (imgBounds) {
      img.x = margin + (rw / 2) - (imgBounds.width / 2);
      img.y = margin + (rh / 2) - (imgBounds.height / 2) - (24 / 2);

      title.x = margin + (rw / 2) - (title.getBounds().width /2);
      title.y = img.y + imgBounds.height;
    }

    var coords = world.gridToPixel(item.x, item.y);
    container.x = coords.x;
    container.y = coords.y;
  };

  return container;
}

module.exports = Backbone.View.extend({
  initialize: function (opts) {
    if (!(opts && opts.canvas && opts.columns && opts.requirements)) 
      throw new Error('You must specify canvas, columns, and requirements options');

    Object.defineProperty(this, "columnCount", {
      get: function () { return world.columnCount; },
      set: function (val) { world.columnCount = val; }
    });
    world.canvasWidth = opts.canvas.width;
    world.columnCount = opts.columns;

    _.extend(this, opts);

    this.stage = new createjs.Stage(this.canvas);
    createjs.Touch.enable(this.stage, true, true);
    if (this.mode === 'edit') {
      var pollRate = 20;
      this.stage.enableMouseOver(pollRate);
      $(this.stage.canvas).addClass('edit-mode');
    }

    var gridLayer = this.gridLayer = new createjs.Container();
    this.stage.addChild(this.gridLayer);

    this.maxRow = 0;
    this.requirements.forEach(function (req) {
      this.addBadge(req);
    }.bind(this));

    this.listenTo(this.requirements, "add", this.addBadge);

    this.listenTo(this.requirements, "remove", function (req) {
      if (req.id) {
        var item = this.stage.getChildByName(req.id);
        this.stage.removeChild(item);
        this.refresh();
      }
    });

    var editor = this;
    gridLayer.layout = function () {
      this.removeAllChildren();
      for (var row = 0; row <= editor.maxRow + 2; row++) {
        for (var col = 0; col < world.columnCount; col++) {
          var coords = world.gridToPixel(col, row);
          var hex = new createjs.Shape();
          hex.graphics.beginFill("#CCC")
            .drawPolyStar(0, 0, 15, 6, 0, 30);
          hex.x = coords.cx;
          hex.y = coords.cy;
          hex.setBounds(-coords.w/2, -coords.w/2, coords.w, coords.w);
          this.addChild(hex);
        }
      } 
    };

    this.layout();
  },
  addBadge: function (model) {
    if (model.y === undefined) {
      var row = 0;
      while (model.y === undefined) {
        var xs = _.pluck(this.requirements.where({y: row}), 'x');
        var empties = _.difference(_.range(world.columnCount), xs);
        if (empties.length) {
          model.x = empties.shift();
          model.y = row;
        }
        else {
          row++;
        }
      }
    }
    this.maxRow = Math.max(this.maxRow, model.y);
    var item = makePathwayItem(model);

    if (model.newFlag) {
      var newFlag = new createjs.Text('NEW', "18px 'Helvetica Neue', Helvetica, Arial, sans-serif");
      newFlag.x = item.getBounds().width - 10 - newFlag.getBounds().width - 5;
      newFlag.y = 15;
      newFlag.name = 'newFlag';
      item.addChild(newFlag);

      item.on('mousedown', function () {
        item.model.newFlag = false;
        item.removeChild(item.getChildByName('newFlag'));
        this.refresh();
      }, this);
    }

    item.on('ready', function () {
      this.stage.addChild(item); 
      this.refresh();
    }, this);

    if (this.rearrangeable()) {
      var canvas = this.stage.canvas;
      item.on('rollover', function () {
        $(canvas).addClass('cursor-grab');
      });
      item.on('mousedown', function () {
        $(canvas).addClass('cursor-grabbing');
      });
      item.on('pressup', function () {
        $(canvas).removeClass('cursor-grabbing');
      });
      item.on('rollout', function () {
        $(canvas).removeClass('cursor-grab');
      });

      item.on('pressmove', function (evt) {
        var coords = world.pixelToGrid(this.stage.globalToLocal(evt.stageX, evt.stageY));
        item.model.x = coords.x;
        item.model.y = coords.y;
        evt.nativeEvent.preventDefault();
        this.refresh();
      }, this);
    }
  },
  rearrangeable: function () {
    return this.mode && (this.mode === 'edit');
  },
  layout: function () {
    world.canvasWidth = this.stage.canvas.width;
    this.stage.children.forEach(function (child) {
      if (child.layout) child.layout();
    });
  },
  render: function () {
    this.stage.canvas.height = this.stage.getTransformedBounds().height;
    this.stage.update();
    return this;
  },
  refresh: function () {
    this.layout();
    this.render();
  },
  remove: function () {
    createjs.Touch.disable(this.stage);
    this.$el.remove();
    this.stopListening();
    return this;
  }
});
