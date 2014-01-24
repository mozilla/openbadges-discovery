var Backbone = require('backbone');
var Pathway = require('./models/pathway');
var PathwayView = require('./views/pathway');
var WelcomeView = require('./views/welcome');

module.exports = Backbone.Router.extend({
  initialize: function (opts) {
    opts.me.on('change:loggedIn', function () {
      app.history.loadUrl();
    });
  },
  routes: {
    '': 'index',
    'welcome': 'welcome',
    'pathway': 'pathway'
  },
  index: function () {
    if (me.loggedIn) app.history.navigate('pathway', {trigger: true, replace: true});
    else app.history.navigate('welcome', {trigger: true, replace: true});
  },
  welcome: function () {
    app.renderPage(new WelcomeView({model: me}));
  },
  pathway: function () {
    if (!me.loggedIn) return app.history.navigate('welcome', {trigger: true});

    var pathway = new Pathway();
    pathway.fetch({
      success: function (model, xhr, opts) {
        app.renderPage(new PathwayView({
          model: model
        }));
      },
      error: function (model, xhr, opts) {
        alert('Error fetching pathway');
        console.log('Error details', arguments);
      }
    });
  }
});