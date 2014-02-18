var config = require('clientconfig');
var Backbone = require('backbone');
var Router = require('./router');
var AppState = require('./models/app-state');
var User = require('./models/user');
var Layout = require('./views/layout');

module.exports = {
  launch: function () {

    console.log("Initial config:", config);

    $.ajaxPrefilter(function (options, originalOptions, xhr) {
      options.headers = options.headers || {};
      options.headers['x-csrf-token'] = config.csrf;
    });

    var self = window.app = this;

    var me = window.me = new AppState({
      csrf: config.csrf,
      loggedInUser: config.user && new User(config.user)
    });
    me.startPersona();
    me.on('login:failure', function (reason) {
      alert('Login error - ' + reason);
    });

    this.router = new Router({me: me});
    this.history = Backbone.history;

    me.on('ready', function () {
      var layout = app.layout = new Layout({
        model: me
      });
      $('body').append(layout.render().el);
      $(document).foundation();
      this.history.start({pushState: true, root: '/'});
    }, this);
  },

  renderPage: function (view) {
    if (app.currentPage)
      app.currentPage.remove();

    app.currentPage = view;
    app.layout.$container.append(view.render().el);
  }
};

module.exports.launch();
