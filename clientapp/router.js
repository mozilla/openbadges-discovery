var Backbone = require('backbone');
var Requirements = require('./models/pathway-requirements');
var Achievement = require('./models/achievement');
var Achievements = require('./models/achievements');
var PathwayView = require('./views/pages/pathway');
var LandingView = require('./views/pages/landing');
var BadgePage = require('./views/pages/badge');
var query = require('query-param-getter');

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
    'badges/:id': 'showBadge',
    'pathway': 'pathway',
    '*url': 'nope'
  },

  landing: function () {
    app.renderPage(new LandingView({
      model: me,
      collection: this.listing
    }));
  },

  showBadge: function (id) {
    var badge = new Achievement({
      type: 'badge',
      title: 'A Very Long Badge Title ' + id,
      creator: 'None',
      favorite: !!query('fav'),
      earned: !!query('earned')
    });
    app.renderPage(new BadgePage({model: badge}));
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

  nope: function () {
    alert('404! Try again.');
  }
});