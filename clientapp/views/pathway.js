var HumanView = require('human-view');
var templates = require('../templates');

module.exports = HumanView.extend({
  template: templates.pathway,
  events: {
    'dragstart .pathway-cell': 'start',
    'drop .pathway-cell': 'drop'
  },
  render: function () {
    this.renderAndBind({pathway: this.model});
    this.$el.find('.pathway-badge').draggable({
      helper: "clone",
      revert: "invalid"
    });
    this.$el.find('.pathway-cell').droppable({
      accept: function () {
        return !$(this).find('.pathway-badge').length;
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
