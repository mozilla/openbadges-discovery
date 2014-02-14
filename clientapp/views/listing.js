var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.listing,
  render: function () {
    this.renderAndBind({});
    return this;
  },
});
