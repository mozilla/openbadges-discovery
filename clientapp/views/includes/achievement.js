var HumanView = require('human-view');
var templates = require('templates');
var util = require('util');

module.exports = HumanView.extend({
  template: templates.includes.achievement,
  classBindings: {
    userFavorite: '.js-favorite-icon'
  },
  render: function (opts) {
    var container = opts.containerEl;
    this.renderAndBind(this.model);
    this.$el.appendTo(container);
  },
  events: {
    'click .js-view-item': 'navToItem',
    'click .js-toggle-wishlist': 'toggleWishlist'
  },
  navToItem: function (evt) {
    var item = this.model;
    var url = util.format('%s/%d', item.type, item.id);
    app.router.navigateTo(url, item);
    evt.preventDefault();
    evt.stopPropagation();
  },
  toggleWishlist: function (evt) {
    if (window.app.currentUser.loggedIn) {
      this.model.favorite = !this.model.favorite;
    }
    else {
      window.app.startLogin();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
