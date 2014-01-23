var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.layout,
  textBindings: {
    username: '.username'
  },
  events: {
    'click .login': 'login',
    'click .logout': 'logout'
  },
  render: function () {
    this.renderAndBind();
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
