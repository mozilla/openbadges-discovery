var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  templates: templates.pages.dashTitle,
  initialize: function (opts) {
    this.backpack = opts.sources.backpack;
    this.wishlist = opts.sources.wishlist;
    this.pathways = opts.sources.pathways;
  },
  render: function() {
    this.renderAndBind();
  }
});