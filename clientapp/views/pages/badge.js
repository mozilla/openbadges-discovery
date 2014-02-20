var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.pages.badge,
  classBindings: {
    'userFavorite': '.favorite-icon' 
  },
  render: function () {
    this.renderAndBind(this.model);
    return this;
  },
  events: {
    'click .wishlist-button': 'toggleWishlist'
  },
  toggleWishlist: function (evt) {
    if (me.currentUser.loggedIn) {
      this.model.favorite = !this.model.favorite;
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
