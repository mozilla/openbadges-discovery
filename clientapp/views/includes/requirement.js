var HumanView = require('human-view');
var templates = require('templates');
var util = require('util');

module.exports = HumanView.extend({
  template: templates.includes.requirement,
  render: function (opts) {
    var container = opts.containerEl || this.el;
    var cell = $(util.format('[data-coord="%d,%d"]', this.model.x, this.model.y), container);
    this.renderAndBind(this.model);
    cell.html(this.el);
  }
});
