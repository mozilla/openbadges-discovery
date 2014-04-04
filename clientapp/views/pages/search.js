var HumanView = require('human-view');
var templates = require('templates');
var SearchResult = require('../includes/search-result');
var Backbone = require('backbone');

module.exports = HumanView.extend({
  template: templates.pages.search,
  render: function () {
    this.renderAndBind({});//this.model);
    this.renderSubview(new SearchResult({
      collection: new Backbone.Collection(this.model.badges)
    }), '.content');
    return this;
  }
});
