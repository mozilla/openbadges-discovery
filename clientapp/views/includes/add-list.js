var HumanView = require('human-view');
var templates = require('templates');
var ItemView = require('./add-item');

module.exports = HumanView.extend({
  template: templates.includes.addList,
  render: function () {
    this.renderAndBind();
    if (this.collection.length) {
      this.renderCollection(this.collection, ItemView, this.$('.js-items')[0]);
    }
    return this;
  },
  events: {
    'click .js-view-more': 'viewMore'
  },
  viewMore: function (evt) {
    this.collection.addPage();
    evt.preventDefault();
    evt.stopPropagation();
  },
  getSelected: function () {
    var ids = [];
    this.$('input[type="checkbox"]:checked').each(function (i, el) {
      ids.push($(el).data('id'));
    });
    var collection = this.collection;
    return ids.map(function (id) {
      return collection.get(id);
    });
  }
});
