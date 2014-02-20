var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.layout,
  events: {
    'click .login': 'login',
    'click .logout': 'logout'
  },
  render: function () {
    this.renderAndBind(this.model);
    this.registerBindings(this.model.currentUser, {
      classBindings: {
        'loggedIn': '.user-controls'
      },
      textBindings: {
        'email': '.user-email a'
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
