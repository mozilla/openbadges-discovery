var HumanView = require('human-view');
var templates = require('templates');
var Achievements = require('../../models/achievements');
var ListingView = require('./listing');

module.exports = HumanView.extend({
  template: templates.includes.dashPanel,
  initialize: function (opts) {
    this.currentUser = window.app.currentUser;
    this.backpack = opts.sources.backpack;
    this.wishlist = opts.sources.wishlist;
    this.pathways = opts.sources.pathways;
    this.listenToAndRun(this.backpack, 'add', this.render);
    this.listenToAndRun(this.wishlist, 'add', this.render);
    this.listenToAndRun(this.pathways, 'add', this.render);
  },
  render: function () {
    this.renderAndBind({
        currentUser: this.currentUser,
        backpack: this.backpack,
        wishlist: this.wishlist,
        pathways: this.pathways
    });

    this.backpackList = new ListingView({collection: this.backpack});
    this.wishlistList = new ListingView({collection: this.wishlist});
    this.pathwayList = new ListingView({collection: this.pathways});
    this.renderSubview(this.backpackList, '.js-backpack-items');
    this.renderSubview(this.wishlistList, '.js-wishlist-items');
    this.renderSubview(this.pathwayList, '.js-pathway-items');
    return this;
  }

});