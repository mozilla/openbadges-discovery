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
    return this;
  }
});
