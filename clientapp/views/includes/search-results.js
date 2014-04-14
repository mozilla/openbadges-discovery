var HumanView = require('human-view');
var templates = require('templates');
var ResultView = require('./search-result');

module.exports = HumanView.extend({
  template: templates.includes.searchResults,
  render: function () {
    this.renderAndBind({});
    if (this.collection.length) {
      this.renderCollection(this.collection, ResultView, this.$('.js-items')[0]);
    }
    this.collection.on('sync', this.render.bind(this));
    return this;
  }
});
