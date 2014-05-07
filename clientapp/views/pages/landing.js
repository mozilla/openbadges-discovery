var HumanView = require('human-view');
var templates = require('templates');
var ListingView = require('../includes/listing');

module.exports = HumanView.extend({
  template: templates.pages.landing,
  initialize: function (options) {
    this.replaceNext = !options.bareUrl;
  },
  render: function () {
    this.renderAndBind(this.model);
    this.renderSubview(new ListingView({
      collection: this.collection
    }), '.content');
    this.listenTo(this.collection, 'sync', function (collection, resp, opts) {
      window.app.router.navigate('c/' + collection.length + '/', {
        replace: this.replaceNext,
        trigger: false
      });
      this.replaceNext = true;
    });
    return this;
  }
});
