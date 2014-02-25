var HumanView = require('human-view');
var templates = require('templates');
var Grid = require('../includes/grid');

module.exports = HumanView.extend({
  template: templates.pages.pathway,
  render: function () {
    this.renderAndBind(this.model);
    this.renderSubview(new Grid({
      collection: this.collection
    }), '.pathway-grid-container');
    return this;
  },
  events: {
    'click .js-pledge-button': 'pledge'
  },
  pledge: function (evt) {
    if (window.app.currentUser.loggedIn) {
      console.log('Not yet implemented.');
    }
    else {
      window.app.startLogin();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
