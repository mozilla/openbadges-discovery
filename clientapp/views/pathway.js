var HumanView = require('human-view');
var templates = require('../templates');

module.exports = HumanView.extend({
  template: templates.pathway,
  events: {
    'dragstart .columns': 'drag',
    'dragover .columns': 'over',
    'dragenter .columns': 'enter',
    'dragleave .columns': 'leave',
    'drop .columns': 'drop'
  },
  render: function () {
    this.renderAndBind({pathway: this.model});
    this.model.once('move', this.render, this);
    return this;
  },
  drag: function (e) {
    var start = $(e.currentTarget).data('cell-coords');
    e.originalEvent.dataTransfer.setData('text/plain', start);
  },
  over: function (e) {
    e.originalEvent.dataTransfer.effectAllowed = 'move';
    e.originalEvent.dataTransfer.dropEffect = 'move';
    if (!$(e.currentTarget).find('.badge').length) {
      e.preventDefault();
      return false;
    }
  },
  enter: function (e) {
    if (!$(e.currentTarget).find('.badge').length) {
      $(e.currentTarget).addClass('drop');
    }
  },
  leave: function (e) {
    $(e.currentTarget).removeClass('drop');
  },
  drop: function (e) {
    var end = $(e.currentTarget).data('cell-coords');
    var start = e.originalEvent.dataTransfer.getData('text/plain');
    this.model.move(start, end);
    e.preventDefault();
  }
});
