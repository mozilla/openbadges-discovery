var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.includes.pathwayTitle,
  initialize: function (opts) {
    this.pathway = opts.model;
    this.listenTo(this.pathway, 'change', this.render);
  },
  render: function() {
    this.renderAndBind({
      pathway: this.pathway
    });
    return this;
  },
});