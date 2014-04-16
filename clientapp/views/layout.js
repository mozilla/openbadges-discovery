var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.layout,
  events: {
    'click .js-login': 'login',
    'click .js-logout': 'logout',
    'click .js-view-latest': 'landing',
    'click .js-user-panel': 'dashboard'
  },
  render: function () {
    this.renderAndBind(this.model);
    this.registerBindings(this.model.currentUser, {
      classBindings: {
        'hideLoggedIn': '.js-login-item',
        'hideLoggedOut': '.js-logout-item, .js-user-panel'
      },
      textBindings: {
        'email': '.js-user-email'
      }
    });
    this.$container = $('#pages', this.$el);
    return this;
  },
  login: function (e) {
    this.model.startLogin();
    e.preventDefault();
  },
  logout: function (e) {
    this.model.logout();
    e.preventDefault();
  },
  landing: function (evt) {
    window.app.router.navigateTo('/');
    // TODO: generalize the following to all(?) dropdown buttons
    var dropdown = $(evt.currentTarget).closest('.f-dropdown');
    Foundation.libs.dropdown.close(dropdown);
  },
  dashboard: function (evt) {
      window.app.router.navigateTo('dashboard');
  }
});
