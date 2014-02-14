var HumanView = require('human-view');
var templates = require('templates');
var AchievementView = require('./achievement');

module.exports = HumanView.extend({
  template: templates.listing,
  render: function () {
    this.renderAndBind({});
    this.renderCollection(this.collection, AchievementView, this.$('.items')[0]);
    return this;
  }
});
