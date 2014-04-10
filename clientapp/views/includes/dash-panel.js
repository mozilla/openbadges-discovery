var HumanView = require('human-view');
var templates = require('templates');
var ItemList = require('./add-list');
var Achievements = require('../../models/achievements');

module.exports = HumanView.extend({
  template: templates.includes.dashPanel,
  initialize: function (opts) {
    this.backpack = opts.sources.backpack;
    this.wishlist = opts.sources.wishlist;
    this.pathways = opts.sources.pathways;
  },
  render: function () {
    this.renderAndBind();
    this.backpackList = new ItemList({collection: this.backpack});
    this.wishlistList = new ItemList({collection: this.wishlist});
    this.pathwayList = new ItemList({collection: this.pathways});
    this.renderSubview(this.backpackList, '.js-backpack-items');
    this.renderSubview(this.wishlistList, '.js-wishlist-items');
    this.renderSubview(this.pathwayList, '.js-pathway-items');
    console.log('backpack ', this.backpack.models.length);
    return this;
  }

});