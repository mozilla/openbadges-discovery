var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.includes.userSummary,
  textBindings: {
    email: '.user-email'
  },
  classBindings: {
    loggedIn: ''
  },
  render: function () {
    this.renderAndBind(this.model);  
    return this;
  }
});
