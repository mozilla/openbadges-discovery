var HumanView = require('human-view');
var templates = require('../templates');

module.exports = HumanView.extend({
  template: templates.pathway,
  events: {
    'dragstart .columns': 'start',
    'drop .columns': 'drop'
  },
  render: function () {
    this.renderAndBind({pathway: this.model});
    this.$el.find('.badge').draggable({
      helper: "clone",
      revert: "invalid"
    });
    this.$el.find('.columns').droppable({
      accept: function () {
        return !$(this).find('.badge').length;
      },
      hoverClass: 'drop'
    });
    this.model.once('move', this.render, this);
    return this;
  },
  start: function (e, ui) {
    var start = $(e.currentTarget).data('cell-coords');
    ui.helper.start = start;
  },
  drop: function (e, ui) {
    var start = ui.helper.start;
    var stop = $(e.currentTarget).data('cell-coords');
    var that = this;
    setTimeout(function () { that.model.move(start, stop); }, 0);
  }
});
