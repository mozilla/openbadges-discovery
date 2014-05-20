var HumanView = require('human-view');
var templates = require('templates');
var Editor = require('../includes/editor');
var Pledged = require('../../models/pledged');

module.exports = HumanView.extend({
  template: templates.pages.pathway,
  initialize: function (opts) {
    this.requirements = opts.requirements || this.collection;
    this.notes = opts.notes;
  },
  render: function () {
    this.renderAndBind({
      pathway: this.model,
      user: window.app.currentUser
    });
    this.renderSubview(new Editor({
      requirements: this.requirements,
      notes: this.notes,
      mode: 'view'
    }), '.pathway-editor-container');
    return this;
  },
  events: {
    'click .js-pledge-button': 'pledge'
  },
  pledge: function (evt) {
    if (window.app.currentUser.loggedIn) {
      var pledged = new Pledged({
        userId: window.app.currentUser._id,
        cloneId: this.model._id
      });
      pledged.save().done(function (model, status, xhr) {
        window.app.router.navigateTo('/pledged/' + model._id);
      });
    }
    else {
      window.app.startLogin();
    }
    evt.preventDefault();
    evt.stopPropagation();
  }
});
