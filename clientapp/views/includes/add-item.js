var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.includes.addItem,
  render: function () {
    this.renderAndBind(this.model);
    return this;
  }
});