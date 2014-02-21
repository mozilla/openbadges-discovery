var HumanView = require('human-view');
var templates = require('templates');
var AchievementView = require('./achievement');

module.exports = HumanView.extend({
  template: templates.includes.listing,
  render: function () {
    this.renderAndBind({});
    if (this.collection.length) {
      this.renderCollection(this.collection, AchievementView, this.$('.items')[0]);
    }
    var that = this;
    this.collection.on('sync', this.render.bind(this));
    return this;
  },
  events: {
    'click .view-more': 'viewMore'
  },
  viewMore: function (evt) {
    this.collection.addPage();
    evt.preventDefault();
    evt.stopPropagation();
  }
});
