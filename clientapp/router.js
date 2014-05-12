var Backbone = require('backbone');
var Pledged = require('./models/pledged');
var Achievement = require('./models/achievement');
var Achievements = require('./models/achievements');
var Requirements = require('./models/requirements');
var LandingView = require('./views/pages/landing');
var BadgePage = require('./views/pages/badge');
var PathwayPage = require('./views/pages/pathway');
var PledgedPage = require('./views/pages/pledged');
var DashboardPage = require('./views/pages/dashboard');
var query = require('query-param-getter');

var cache;

module.exports = Backbone.Router.extend({

  initialize: function (opts) {
    window.app.currentUser.on('change:loggedIn', function () {
      app.history.loadUrl();
    });
  },

  routes: {
    '(y/:type/)(t/:tag/)(c/:count/)': 'landing',
    'badge/:id': 'showBadge',
    'pathway/:id': 'showPathway',
    'pledged/:id': 'showEditor',
    'dashboard': 'showDashboard',
    '*url': 'nope'
  },

  landing: function (type, tag, count) {
    var initialCount = parseInt(count || 16);
    var listing = new Achievements([], {
      pageSize: 8,
      type: type,
      tag: tag
    });
    var args = {
      y: type,
      t: tag,
      c: count
    };
    var name;
    if (type) {
      if (type === Achievement.BADGE) name = "Badges";
      else name = "Pathways";
    }
    else if (tag) {
      name = "#" + tag;
    }
    else {
      name = "Latest";
    }
    listing.fetch({data: {pageSize: initialCount}}).then(function () {
      app.renderPage(new LandingView({
        model: window.app,
        collection: listing,
        bareUrl: Array.prototype.filter.call(arguments, function(arg){ return !!arg; }),
        args: args,
        name: name
      }));
    });
  },

  showBadge: function (id) {
    var badge = new Achievement({
      _id: id,
      type: Achievement.BADGE
    });
    badge.fetch();
    badge.once('sync', function () {
      app.renderPage(new BadgePage({model: badge}));
    });
  },

  showPathway: function (id) {
    var pathway = new Achievement({
      _id: id,
      type: Achievement.PATHWAY
    });
    var requirements = new Requirements({
      parentId: pathway._id
    });
    $.when(pathway.fetch(), requirements.fetch()).done(function () {
      app.renderPage(new PathwayPage({model: pathway, collection: requirements}));
    });
  },

  showEditor: function (id) {
    var pledged = new Pledged({
      _id: id,
      userId: window.app.currentUser._id
    });
    var requirements = new Requirements({
      parentId: pledged._id
    });
    var backpack = new Achievements({
      pageSize: 4,
      source: Achievements.BACKPACK
    });
    var wishlist = new Achievements({
      pageSize: 4,
      source: Achievements.WISHLIST,
      type: Achievement.BADGE
    });
    backpack.fetch();
    wishlist.fetch();
    $.when(pledged.fetch(), requirements.fetch()).done(function () {
      app.renderPage(new PledgedPage({
        model: pledged,
        collection: requirements,
        addSources: {
          backpack: backpack,
          wishlist: wishlist
        }
      }));
    });
  },

  showDashboard: function () {
    var backpack = new Achievements([], {
      pageSize: 4,
      source: Achievements.BACKPACK
    });
    var wishlist = new Achievements([], {
      pageSize: 4,
      source: Achievements.WISHLIST,
      type: Achievement.BADGE
    });
    var pathways = new Achievements([], {
      pageSize: 4,
      source: Achievements.PLEDGED
    });
    $.when(backpack.fetch(), wishlist.fetch(), pathways.fetch()).done(function () {
      app.renderPage(new DashboardPage({
        model: window.app,
        sources: {
          backpack: backpack,
          wishlist: wishlist,
          pathways: pathways
        }
      }));
    });
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