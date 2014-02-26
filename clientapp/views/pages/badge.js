var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.pages.badge,
  classBindings: {
    'userFavorite': '.js-favorite-icon'
  },
  textBindings: {
    'status': '.js-status'
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
    'click .js-toggle-wishlist': 'toggleWishlist'
  },
  toggleWishlist: function (evt) {
    if (window.app.currentUser.loggedIn) {
      this.model.favorite = !this.model.favorite;
    }
    else {
      window.app.once('login', function (result) {
        if (result === 'success') this.model.favorite = true;
      }.bind(this));
      window.app.startLogin();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
