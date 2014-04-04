var HumanView = require('human-view');
var templates = require('templates');
var AchievementView = require('./achievement');

module.exports = HumanView.extend({
  template: templates.includes.searchResult,
  render: function () {
    this.renderAndBind({});
    if (this.collection.length) {
      this.renderCollection(this.collection, AchievementView, this.$('.js-items')[0]);
    }
    this.collection.on('sync', this.render.bind(this));
    return this;
  }
});
