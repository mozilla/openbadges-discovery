var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.layout,
  events: {
    'click .js-login': 'login',
    'click .js-logout': 'logout'
  },
  render: function () {
    this.renderAndBind(this.model);
    this.registerBindings(this.model.currentUser, {
      classBindings: {
        'loggedIn': '.js-user-controls'
      },
      textBindings: {
        'email': '.js-user-email'
      }
    });
    this.$container = $('#pages', this.$el);
    return this;
  },
  login: function (e) {
    navigator.id.request();
    e.preventDefault();
  },
  logout: function (e) {
    navigator.id.logout();
    e.preventDefault();
  }
});
