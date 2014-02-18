var Backbone = require('backbone');
var Requirements = require('./models/pathway-requirements');
var Achievements = require('./models/achievements');
var PathwayView = require('./views/pages/pathway');
var LandingView = require('./views/pages/landing');

module.exports = Backbone.Router.extend({

  initialize: function (opts) {
    opts.me.on('change:loggedIn', function () {
      app.history.loadUrl();
    });
    this.listing = new Achievements({
      pageSize: 8 
    });
    this.listing.fetch({reset: true});
  },

  routes: {
    '': 'landing',
    'pathway': 'pathway'
  },

  landing: function () {
    app.renderPage(new LandingView({
      model: me,
      collection: this.listing
    }));
  },

  pathway: function () {
    if (!me.loggedIn) return app.history.navigate('welcome', {trigger: true});

    var requirements = new Requirements();
    requirements.fetch({
      success: function (collection, xhr, opts) {
        app.renderPage(new PathwayView({
          collection: collection
        }));
      },
      error: function () {
        alert('Error fetching pathway');
        console.log('Error details', arguments);
      }
    });
  },
});