var HumanView = require('human-view');
var templates = require('templates');
var Editor = require('../includes/editor');

module.exports = HumanView.extend({
  template: templates.pages.pathway,
  render: function () {
    this.renderAndBind({
      pathway: this.model,
      user: window.app.currentUser
    });
    this.renderSubview(new Editor({
      collection: this.collection,
      mode: 'view'
    }), '.pathway-editor-container');
    return this;
  },
  events: {
    'click .js-pledge-button': 'pledge'
  },
  pledge: function (evt) {
    if (window.app.currentUser.loggedIn) {
      window.app.router.navigateTo('/pledged/' + this.model.id, {
        pathway: this.model,
        requirements: this.collection
      });
    }
    else {
      window.app.startLogin();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
