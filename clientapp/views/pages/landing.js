var HumanView = require('human-view');
var templates = require('templates');
var ListingView = require('../includes/listing');

module.exports = HumanView.extend({
  template: templates.pages.landing,
  render: function () {
    this.renderAndBind(this.model);
    this.renderSubview(new ListingView({
      collection: this.collection
    }), '.content');
    this.listenTo(this.collection, 'sync', function (collection, resp, opts) {
      window.app.router.navigate('/' + collection.length, {replace: true, trigger: false});
    });
    return this;
  }
});
