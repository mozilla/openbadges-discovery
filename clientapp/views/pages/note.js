var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.pages.note,
  render: function () {
    this.renderAndBind(this.model);
    return this;
  }
});
