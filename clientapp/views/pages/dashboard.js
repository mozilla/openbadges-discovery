var HumanView = require('human-view');
var templates = require('templates');
var ListingView = require('../includes/listing');

module.exports = HumanView.extend({
  template: templates.pages.dashboard,
  initialize: function (opts) {
    opts = opts || {};
    this.sources = opts.sources;
  },
  render: function () {
    this.renderAndBind({
      currentUser: window.app.currentUser,
      backpack: this.sources.backpack,
      wishlist: this.sources.wishlist,
      pathways: this.sources.pathways
    });

    var backpackList = new ListingView({collection: this.sources.backpack});
    var wishlistList = new ListingView({collection: this.sources.wishlist});
    var pathwayList = new ListingView({collection: this.sources.pathways});
    this.renderSubview(backpackList, '.js-backpack-items');
    this.renderSubview(wishlistList, '.js-wishlist-items');
    this.renderSubview(pathwayList, '.js-pathway-items');

    return this;
  }
});
