var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  initialize: function (opts) {
    this.template = templates.pages.static[opts.name] || templates.pages.static['404'];
  },
  render: function () {
    this.renderAndBind();
    return this;
  }
});
