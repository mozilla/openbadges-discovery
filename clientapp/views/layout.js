var HumanView = require('human-view');
var templates = require('templates');
var UserSummary = require('./includes/user-summary');

module.exports = HumanView.extend({
  template: templates.layout,
  events: {
    'click .login': 'login',
    'click .logout': 'logout'
  },
  render: function () {
    this.renderAndBind(this.model);
    if (this.model.loggedIn)
      this.userInfo = this.renderSubview(new UserSummary({
        model: this.model.getUserModel()
      }), '.user-info-container');

    this.model.on('change:user', function (model, newUser) {
      if (!newUser)
        this.userInfo.remove();
      else
        this.userInfo = this.renderSubview(new UserSummary({
          model: this.model.getUserModel()
        }), '.user-info-container');
    }, this);

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
