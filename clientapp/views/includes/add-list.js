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
  getSelected: function (opts) {
    var ids = [];
    this.$('input[type="checkbox"]:checked').each(function (i, el) {
      ids.push($(el).data('id'));
    });
    var collection = this.collection;

    if (opts && opts.deselect) this.deselectAll();

    return ids.map(function (id) {
      // return collection.get(id); <-- doesn't work with idAttribute?
      return collection.findWhere({_id: id});
    });
  },
  deselectAll: function () {
    this.$('input[type="checkbox"]:checked').attr('checked', false);
  }
});
