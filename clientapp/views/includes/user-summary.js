var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.includes.userSummary,
  textBindings: {
    email: '.user-email'
  },
  render: function () {
    this.renderAndBind(this.model);  
    return this;
  }
});
