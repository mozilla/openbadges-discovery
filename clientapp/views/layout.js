var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.layout,
  events: {
    'click .js-login': 'login',
    'click .js-logout': 'logout',
    'click .js-view-latest': 'landing',
    'click .js-view-pathways': 'pathways',
    'click .js-view-badges': 'badges',
    'click .js-view-tag': 'tag',
    'click .user-panel': 'dashboard',
    'keyup .search-input': 'search'
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
  pathways: function (evt) {
    window.app.router.navigateTo('y/pathway/');
  },
  badges: function (evt) {
    window.app.router.navigateTo('y/badge/');
  },
  tag: function (evt) {
    var tag = $(evt.target).text();
    if (tag[0] === '#') tag = tag.slice(1);
    window.app.router.navigateTo('t/' + tag + '/');
  },
  dashboard: function (evt) {
      window.app.router.navigateTo('dashboard');
  },
  search: function (evt) {
    if (evt.keyCode === 13) {
      var search = this.$('.search-input').val();
      if (search.trim())
        window.app.router.navigateTo('s/' + encodeURIComponent(search.trim()) + '/');
      else
        window.app.router.navigateTo('/');
    }
  }
});
