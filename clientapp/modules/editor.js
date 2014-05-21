var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = window.$; // WHHHHHHYYYYYYYY?!

var badgeBackground = new createjs.Bitmap("/static/badge-background.svg");
var coreFlag = new createjs.Bitmap("/static/badge-core.svg");
var newFlag = new createjs.Bitmap("/static/badge-new.svg");
var doneBtnSheet = new createjs.SpriteSheet({
  images: ["/static/pathway/badge-icon-checked-spritesheet-v2.svg"],
  frames: {width: 30, height: 30},
  animations: {
    unchecked: [0],
    checked: [1],
    button: ['unchecked', 'checked']
  }
});
var noteIcon = new createjs.Bitmap("/static/pathway/note-icon.svg");
var grayscale = new createjs.ColorMatrixFilter(new createjs.ColorMatrix(0, 0, -100));

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
  container.name = item.cid;

  container.setBounds(0, 0, world.columnWidth, world.columnWidth);

  function reemit (obj, evtName, newName) {
    obj.on(evtName, function (evt) {
      var newEvt = evt.clone();
      newEvt.type = newName;
      newEvt.nativeEvent = evt.nativeEvent;
      container.dispatchEvent(newEvt);
    });
  }

  var grabContainer = new createjs.Container();
  reemit(grabContainer, 'rollover', 'grab-rollover');
  reemit(grabContainer, 'rollout', 'grab-rollout');
  reemit(grabContainer, 'mousedown', 'grab');
  reemit(grabContainer, 'pressmove', 'move');
  reemit(grabContainer, 'pressup', 'release');
  var move = false;
  grabContainer.on('mousedown', function (evt) {
    move = false;
  });
  grabContainer.on('pressmove', function (evt) {
    move = true;
  });
  grabContainer.on('click', function () {
    if (!move) container.dispatchEvent('tile-click');
  });
  reemit(grabContainer, 'dblclick', 'tile-dblclick');

  var rect = badgeBackground.clone();
  var img = new createjs.Bitmap(item.imgSrc);
  img.image.onload = function () {
    container.layout();
    container.dispatchEvent('ready');
  };
  var title = new createjs.Text(item.name, "14px 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif");
  grabContainer.addChild(rect, img, title);
  container.addChild(grabContainer);

  var core;
  if (item.core) {
    core = coreFlag.clone();
    container.addChild(core);
  }

  var doneBtn = new createjs.Sprite(doneBtnSheet, "button");
  container.addChild(doneBtn);
  reemit(doneBtn, 'rollover', 'button-rollover');
  reemit(doneBtn, 'rollout', 'button-rollout');
  reemit(doneBtn, 'click', 'toggleComplete');

  var delBtn = new createjs.Shape();
  delBtn.graphics.beginFill('#0fa1d6').drawRoundRect(0, 0, 40, 40, 40)
    .beginStroke('white').moveTo(10, 10).lineTo(30, 30)
    .moveTo(10, 30).lineTo(30, 10);
  reemit(delBtn, 'click', 'delete');
  reemit(delBtn, 'rollover', 'button-rollover');
  reemit(delBtn, 'rollout', 'button-rollout');

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
    rect.x = rect.y = margin;
    rect.scaleX = rw / rect.getBounds().width;
    rect.scaleY = rh / rect.getBounds().height;

    doneBtn.visible = world.showProgress;
    if (doneBtn.visible) {
      doneBtn.x = doneBtn.y = margin + 2;
      if (item.complete) {
        doneBtn.gotoAndStop('checked');
        img.filters = [];
        img.cache(0, 0, img.getBounds().width, img.getBounds().height);
      }
      else {
        doneBtn.gotoAndStop('unchecked');
        img.filters = [grayscale];
        img.cache(0, 0, img.getBounds().width, img.getBounds().height);
      }
    }

    if (item.core) {
      core.x = margin + rect.getTransformedBounds().width - core.getBounds().width - 5;
      core.y = margin + 5;
    }

    var imgBounds = scaleToMax(img, rw, rh - (24 * 2));
    if (imgBounds) {
      img.x = margin + (rw / 2) - (imgBounds.width / 2);
      img.y = margin + (rh / 2) - (imgBounds.height / 2) - (24 / 2);

      title.lineWidth = rw - 20;
      title.textAlign = "center";
      title.x = margin + (rw / 2);
      title.y = img.y + imgBounds.height;
    }

    if (!item.core) {
      var idx = container.getChildIndex(delBtn);
      if (world.deletable) {
        if (idx === -1) container.addChild(delBtn);
      }
      else {
        if (idx !== -1) container.removeChildAt(idx);
      }
    }

    var coords = world.gridToPixel(item.x, item.y);
    container.x = coords.x;
    container.y = coords.y;
  };

  return container;
}

function makeNote(model) {
  var container = new createjs.Container();
  container.model = model;
  container.name = model.cid;
  container.setBounds(0, 0, world.columnWidth, world.columnWidth);

  function reemit (obj, evtName, newName) {
    obj.on(evtName, function (evt) {
      var newEvt = evt.clone();
      newEvt.type = newName;
      newEvt.nativeEvent = evt.nativeEvent;
      container.dispatchEvent(newEvt);
    });
  }

  var icon = noteIcon.clone();
  icon.scaleX = icon.scaleY = ((container.getBounds().width - 20) / icon.getBounds().width) * 0.5;
  icon.regX = icon.getBounds().width / 2;
  icon.regY = icon.getBounds().height / 2;
  icon.x = container.getBounds().width / 2;
  icon.y = container.getBounds().height / 2;
  reemit(icon, 'rollover', 'grab-rollover');
  reemit(icon, 'rollout', 'grab-rollout');
  reemit(icon, 'mousedown', 'grab');
  reemit(icon, 'pressmove', 'move');
  reemit(icon, 'pressup', 'release');
  reemit(icon, 'dblclick', 'note-dblclick');

  var delBtn = new createjs.Shape();
  delBtn.graphics.beginFill('#0fa1d6').drawRoundRect(0, 0, 40, 40, 40)
    .beginStroke('white').moveTo(10, 10).lineTo(30, 30)
    .moveTo(10, 30).lineTo(30, 10);
  delBtn.x = 60;
  delBtn.y = 20;
  reemit(delBtn, 'click', 'delete');
  reemit(delBtn, 'rollover', 'button-rollover');
  reemit(delBtn, 'rollout', 'button-rollout');

  container.addChild(icon, delBtn);

  container.layout = function () {
    var coords = world.gridToPixel(model.x, model.y);
    container.x = coords.x;
    container.y = coords.y;

    delBtn.visible = world.deletable;
  };

  return container;
}

module.exports = Backbone.View.extend({
  initialize: function (opts) {
    if (!(opts && opts.canvas && opts.columns && opts.requirements && opts.notes))
      throw new Error('You must specify canvas, columns, requirements, and notes options');

    var self = this;
    ["columnCount", "mode", "showProgress"].forEach(function (prop) {
      Object.defineProperty(self, prop, {
        get: function () { return world[prop]; },
        set: function (val) { world[prop] = val; }
      });
    });
    world.canvasWidth = opts.canvas.width;
    world.columnCount = opts.columns;

    _.extend(this, opts);

    this.stage = new createjs.Stage(this.canvas);
    createjs.Touch.enable(this.stage, true, true);
    if (this.isRearrangeable()) {
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

    this.listenTo(this.requirements, "add", this.addBadge, this);

    this.listenTo(this.requirements, "remove", function (req) {
      if (req.cid) {
        var item = this.stage.getChildByName(req.cid);
        this.stage.removeChild(item);
        this.refresh();
      }
    });

    this.notes.forEach(function (note) {
      this.addNote(note);
    }.bind(this));

    this.listenTo(this.notes, "add", this.addNote, this);

    this.listenTo(this.notes, "remove", function (note) {
      if (note.cid) {
        var item = this.stage.getChildByName(note.cid);
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
  position: function (model) {
    if (model.y === undefined) {
      var row = 0;
      while (model.y === undefined) {
        var xs = _.pluck(_.where(this.requirements.models.concat(this.notes.models), {y: row}), 'x');
        var empties = _.difference(_.range(world.columnCount), xs);
        if (empties.length) {
          model.set({
            x: empties.shift(),
            y: row
          });
          model.trigger('positioned', model);
        }
        else {
          row++;
        }
      }
    }
  },
  addBadge: function (model) {
    this.position(model);
    this.maxRow = Math.max(this.maxRow, model.y);
    var item = makePathwayItem(model);

    if (model.newFlag) {
      var flag = newFlag.clone();
      flag.x = item.getBounds().width - flag.getBounds().width;
      flag.y = 0;
      flag.name = 'newFlag';
      item.addChild(flag);

      item.on('mousedown', function () {
        item.model.newFlag = false;
        item.removeChild(item.getChildByName('newFlag'));
        this.refresh();
      }, this);
    }

    item.on('ready', function () {
      this.stage.addChild(item);
      this.refresh(item);
    }, this);

    item.on('toggleComplete', function () {
      if (this.isRearrangeable()) {
        item.model.complete = !item.model.complete;
        this.refresh(item);
      }
    }, this);

    item.on('button-rollover', function () {
      $(this.stage.canvas).addClass('cursor-button');
    }, this);
    item.on('button-rollout', function () {
      $(this.stage.canvas).removeClass('cursor-button');
    }, this);
    item.on('delete', function (evt) {
      this.trigger('delete', evt.target.model);
    }, this);

    item.on('grab-rollover', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).addClass('cursor-grab');
    }, this);
    item.on('grab', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).addClass('cursor-grabbing');
    }, this);
    item.on('release', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).removeClass('cursor-grabbing');
    }, this);
    item.on('grab-rollout', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).removeClass('cursor-grab');
    }, this);

    item.on('move', function (evt) {
      if (this.isRearrangeable()) {
        var coords = world.pixelToGrid(this.stage.globalToLocal(evt.stageX, evt.stageY));
        var model = item.model.set({
          x: coords.x,
          y: coords.y
        });
        evt.nativeEvent.preventDefault();
        if (model.changedAttributes())
          this.refresh(item);
      }
    }, this);

    item.on('tile-dblclick', function (evt) {
      this.trigger('click', evt.currentTarget.model);
    }, this);
  },
  addNote: function (note) {
    this.position(note);
    var item = makeNote(note);

    item.on('grab-rollover', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).addClass('cursor-grab');
    }, this);
    item.on('grab', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).addClass('cursor-grabbing');
    }, this);
    item.on('release', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).removeClass('cursor-grabbing');
    }, this);
    item.on('grab-rollout', function () {
      if (this.isRearrangeable()) $(this.stage.canvas).removeClass('cursor-grab');
    }, this);

    item.on('move', function (evt) {
      if (this.isRearrangeable()) {
        var coords = world.pixelToGrid(this.stage.globalToLocal(evt.stageX, evt.stageY));
        var model = item.model.set({
          x: coords.x,
          y: coords.y
        });
        evt.nativeEvent.preventDefault();
        if (model.changedAttributes())
          this.refresh(item);
      }
    }, this);
    
    item.on('button-rollover', function () {
      $(this.stage.canvas).addClass('cursor-button');
    }, this);
    item.on('button-rollout', function () {
      $(this.stage.canvas).removeClass('cursor-button');
    }, this);
    item.on('delete', function (evt) {
      this.trigger('delete', evt.target.model);
    }, this);

    item.on('note-dblclick', function (evt) {
      this.trigger('click', evt.currentTarget.model);
    }, this);

    this.stage.addChild(item);
    this.refresh(item);
  },
  isRearrangeable: function () {
    return world.mode && (world.mode === 'edit');
  },
  isDeletable: function () {
    return world.deletable;
  },
  layout: function (item) {
    world.canvasWidth = this.stage.canvas.width;
    this.stage.children.forEach(function (child) {
      if (child.layout) child.layout();
    });
  },
  render: function (item) {
    if (!item)
      this.stage.canvas.height = this.stage.getTransformedBounds().height;
    this.stage.update();
    return this;
  },
  refresh: function (item) {
    if (item)
      item.layout();
    else
      this.layout();
    this.render(item);
  },
  remove: function () {
    createjs.Touch.disable(this.stage);
    this.$el.remove();
    this.stopListening();
    return this;
  },
  enableDelete: function (flag) {
    world.deletable = flag;
  }
});
