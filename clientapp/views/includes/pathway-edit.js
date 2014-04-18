var HumanView = require('human-view');
var templates = require('templates');
var PathwayTitleView = require('../includes/pathway-title');

module.exports = HumanView.extend({
  template: templates.includes.pathwayEdit,
  initialize: function (opts) {
    this.pathway = opts.model;
  },
  render: function() {
    this.renderAndBind({
      pathway: this.pathway
    });
    return this;
  },
  events: {
    'click .js-title-cancel': 'cancel',
    'click .js-title-save': 'save'
  },
  cancel: function (evt) {
    this.trigger('cancel');
    evt.preventDefault();
  },
  save: function (evt) {
    this.pathway.set({
      title: $('#pathway-form-title').val(),
      description: $('#pathway-form-description').val()
    });
    this.trigger('saved');
    evt.preventDefault();
  },
  reset: function (evt) {
    this.render();
  }

});