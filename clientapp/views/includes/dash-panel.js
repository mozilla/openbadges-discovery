var HumanView = require('human-view');
var templates = require('templates');
var Achievements = require('../../models/achievements');
var ListingView = require('./listing');

module.exports = HumanView.extend({
  template: templates.includes.dashPanel,
  initialize: function (opts) {
    this.backpack = opts.sources.backpack;
    this.wishlist = opts.sources.wishlist;
    this.pathways = opts.sources.pathways;
  },
  render: function () {
    this.renderAndBind();
    this.backpackList = new ListingView({collection: this.backpack});
    this.wishlistList = new ListingView({collection: this.wishlist});
    this.pathwayList = new ListingView({collection: this.pathways});
    this.renderSubview(this.backpackList, '.js-backpack-items');
    this.renderSubview(this.wishlistList, '.js-wishlist-items');
    this.renderSubview(this.pathwayList, '.js-pathway-items');
    console.log('backpack ', this.backpack.models.length);
    return this;
  }

});