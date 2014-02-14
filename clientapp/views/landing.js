var HumanView = require('human-view');
var ListingView = require('./listing');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.landing,
  events: {
    'click a': 'handleLink'
  },
  render: function () {
    this.renderAndBind(this.model);
    this.renderSubview(new ListingView({
      collection: this.collection
    }), '.content');
    return this;
  },
  handleLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    //app.history.navigate(url, {trigger:true});
    console.log('Links disabled');
    e.preventDefault();
  }
});
