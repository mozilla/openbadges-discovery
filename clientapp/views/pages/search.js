var HumanView = require('human-view');
var templates = require('templates');
var SearchResults = require('../includes/search-results');
var Backbone = require('backbone');

module.exports = HumanView.extend({
  template: templates.pages.search,
  render: function () {
    this.renderAndBind({});//this.model);
    this.renderSubview(new SearchResults({
      collection: this.model.badges
    }), '.content');
    return this;
  }
});
