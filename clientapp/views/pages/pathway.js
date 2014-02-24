var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.pages.pathway,
  render: function () {
    this.renderAndBind(this.model);
    return this;
  },
  events: {
    'click .js-pledge-button': 'pledge'
  },
  pledge: function (evt) {
    if (me.currentUser.loggedIn) {
      console.log('Not yet implemented.'); 
    }
    else {
      navigator.id.request();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
