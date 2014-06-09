var HumanView = require('human-view');
var templates = require('templates');
var animate = require('animate');
var ListingView = require('../includes/listing');

module.exports = HumanView.extend({
  template: templates.pages.landing,
  initialize: function (options) {
    this.replaceNext = !options.bareUrl;
    this.args = options.args;
    this.name = options.name;
  },
  render: function () {
    this.renderAndBind({
      app: this.model,
      name: this.name
    });
    this.renderSubview(new ListingView({
      collection: this.collection
    }), '.content');
    this.listenTo(this.collection, 'sync', function (collection, resp, opts) {
      window.app.router.navigate(this.buildUrl({c: collection.length}), {
        replace: this.replaceNext,
        trigger: false
      });
      this.replaceNext = true;
    });
    animate(this.$("#animate-me")[0]);
    return this;
  },
  buildUrl: function (parts) {
    var args = _.extend({}, this.args, parts);
    var url = '';
    var ordered = ['s', 'y', 't', 'c'];
    ordered.forEach(function (key) {
      if (args[key]) url += key + '/' + args[key] + '/';
    });
    return url;
  }
});
