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

    window.app = this;

    window.app.state = new AppState(config);
    window.app.state.startPersona();
    window.app.state.on('login:failure', function (reason) {
      alert('Login error - ' + reason);
    });

    this.router = new Router();
    this.history = Backbone.history;

    window.app.state.on('ready', function () {
      var layout = app.layout = new Layout({model: window.app.state});
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
