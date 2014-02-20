var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.pages.badge,
  classBindings: {
    'userFavorite': '.favorite-icon' 
  },
  textBindings: {
    'status': '.status span'
  },
  render: function () {
    this.renderAndBind(this.model);
    this.listenToAndRun(this.model, 'change:status', function (model) {
      var hide = !this.model.status;
      this.$('.status').toggleClass('hide', hide);
    });
    return this;
  },
  events: {
    'click .wishlist-button': 'toggleWishlist'
  },
  toggleWishlist: function (evt) {
    if (me.currentUser.loggedIn) {
      this.model.favorite = !this.model.favorite;
    }
    else {
      navigator.id.request();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
