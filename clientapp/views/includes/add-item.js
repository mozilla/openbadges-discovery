var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.includes.addItem,
  classBindings: {
    userAddBadge: '.js-add-badge-icon'
  },
  render: function () {
    this.renderAndBind(this.model);
    return this;
  }
});