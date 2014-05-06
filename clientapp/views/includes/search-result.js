var HumanView = require('human-view');
var templates = require('templates');
var util = require('util');

module.exports = HumanView.extend({
  template: templates.includes.searchResult,
  render: function (opts) {
    var container = opts.containerEl;
    this.renderAndBind(this.model);
    this.$el.appendTo(container);
  }
});
