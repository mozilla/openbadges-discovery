var Backbone = require('backbone');
var Achievement = require('./models/achievement');
var Achievements = require('./models/achievements');
var LandingView = require('./views/pages/landing');
var BadgePage = require('./views/pages/badge');
var PathwayPage = require('./views/pages/pathway');
var query = require('query-param-getter');

var cache;

module.exports = Backbone.Router.extend({

  initialize: function (opts) {
    window.app.currentUser.on('change:loggedIn', function () {
      app.history.loadUrl();
    });
    this.listing = new Achievements({
      pageSize: 8 
    });
    this.listing.fetch({reset: true});
  },

  routes: {
    '': 'landing',
    'badge/:id': 'showBadge',
    'pathway/:id': 'showPathway',
    '*url': 'nope'
  },

  landing: function () {
    app.renderPage(new LandingView({
      model: window.app,
      collection: this.listing
    }));
  },

  showBadge: function (id) {
    var badge = cache || new Achievement({
      type: 'badge',
      title: 'A Very Long Badge Title ' + id,
      creator: 'None',
      favorite: !!query('fav'),
      earned: !!query('earned')
    });
    app.renderPage(new BadgePage({model: badge}));
  },

  showPathway: function (id) {
    var pathway = cache || new Achievement({
      type: 'pathway',
      title: 'A Very Long Pathway Title ' + id,
      creator: 'None',
      favorite: !!query('fav')
    });
    app.renderPage(new PathwayPage({model: pathway}));
  },

  nope: function () {
    if (app.currentPage) app.currentPage.remove();
    alert('404! Try again.');
  },

  navigateTo: function (url, data) {
    cache = data || undefined;
    this.navigate(url, {trigger: true});
  }
});