var HumanView = require('human-view');
var templates = require('templates');
var RequirementView = require('./requirement');
var _ = require('underscore');
var Editor = require('editor');
var UndoManager = require('backbone-undo');
var query = require('query-param-getter');

module.exports = HumanView.extend({
  template: templates.includes.editor,

  events: {
    'click [data-toggle]': 'toggle',
    'click .js-delete': 'deleteMode',
    'click .js-undo': 'undo'
  },

  initialize: function (opts) {
    this.mode = opts.mode;
    var undoManager = this.undoManager = new UndoManager();
    undoManager.changeUndoType("remove", {
      "undo": function (collection, before, after, options) {
        if ("index" in options) {
          options.at = options.index;
        }
        collection.add(before.attributes, options);
      }
    });
    undoManager.changeUndoType("change", {
      "condition": function (model) {
        var changed = model.changedAttributes();
        return !(Object.keys(changed).length === 1 && changed.hasOwnProperty('_id'));
      }
    });
    undoManager.register(this.collection);
    undoManager.startTracking();
  },
  render: function () {
    this.renderAndBind({showControls: this.mode === "edit"});
    this.editor = new Editor({
      columns: query('columns') || 5,
      canvas: this.$('canvas')[0],
      mode: this.mode,
      requirements: this.collection
    });
    this.editor.render();

    this.editor.on('delete', function (model) {
      this.collection.remove(model);
    }, this);

    return this;
  },
  remove: function () {
    this.editor.remove();
    this.$el.remove();
    this.stopListening();
    return this;
  },

  deleteMode: function (evt) {
    var state = $(evt.target).attr('data-toggle');
    this.editor.enableDelete(state === 'on');
    this.editor.refresh();
    this.activate(evt);
  },
  toggle: function (evt) {
    var btn = $(evt.target);
    var state = btn.attr('data-toggle');
    btn.attr('data-toggle', state === 'on' ? 'off' : 'on');
  },
  undo: function (evt) {
    this.undoManager.undo();
    this.editor.refresh();
  },
  activate: function(evt) {
    var btn = $(evt.target);
    var parentLi = $(evt.target).closest('.sidebar-menu-item');
    btn.toggleClass('active');
    parentLi.toggleClass('active');
    evt.preventDefault();
  }
});
