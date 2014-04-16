var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.includes.dashTitle,
  initialize: function (opts) {
    this.currentUser = window.app.currentUser;
    this.backpack = opts.sources.backpack;
    this.wishlist = opts.sources.wishlist;
    this.pathways = opts.sources.pathways;
    this.listenTo(this.backpack, 'add', this.render);
    this.listenTo(this.wishlist, 'add', this.render);
    this.listenTo(this.pathways, 'add', this.render);
  },
  render: function() {
    this.renderAndBind({
      currentUser: this.currentUser,
      backpack: this.backpack,
      wishlist: this.wishlist,
      pathways: this.pathways
    });
  }
});