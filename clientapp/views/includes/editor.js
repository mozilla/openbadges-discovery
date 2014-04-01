var HumanView = require('human-view');
var templates = require('templates');
var RequirementView = require('./requirement');
var _ = require('underscore');
var Editor = require('editor');

module.exports = HumanView.extend({
  template: templates.includes.editor,
  initialize: function (opts) {
    this.mode = opts.mode;
  },
  render: function () {
    this.renderAndBind({showControls: this.mode === "edit"});
    this.editor = new Editor({
      columns: 3,
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
  events: {
    'click [data-toggle]': 'toggle',
    'click .js-delete': 'deleteMode',
  },
  deleteMode: function (evt) {
    var state = $(evt.target).attr('data-toggle');
    this.editor.enableDelete(state === 'on');
    this.editor.refresh();
    evt.preventDefault();
  },
  toggle: function (evt) {
    var btn = $(evt.target);
    var state = btn.attr('data-toggle');
    btn.attr('data-toggle', state === 'on' ? 'off' : 'on');
  }
});
