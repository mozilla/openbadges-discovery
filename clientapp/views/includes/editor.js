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
    this.renderAndBind();
    this.editor = new Editor({
      columns: 3,
      canvas: this.el,
      mode: this.mode,
      requirements: this.collection
    });
    return this;
  },
  remove: function () {
    this.editor.remove();
    this.$el.remove();
    this.stopListening();
    return this;
  }
});
