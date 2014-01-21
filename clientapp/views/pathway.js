var HumanView = require('human-view');
var templates = require('../templates');

module.exports = HumanView.extend({
  template: templates.pathway,
  render: function () {
    this.renderAndBind();
  }
});
