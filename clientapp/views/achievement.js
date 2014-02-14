var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.achievement,
  classBindings: {
    favorite: '.favorite-icon'
  },
  render: function (opts) {
    var container = opts.containerEl;
    this.renderAndBind(this.model);
    this.$el.appendTo(container);
  }
});
