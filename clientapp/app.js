var config = require('clientconfig');
var Backbone = require('backbone');
var Router = require('./router');
var AppState = require('./models/app-state');
var User = require('./models/user');
var Layout = require('./views/layout');

function launch () {
  console.log("Initial config:", config);

  $.ajaxPrefilter(function (options, originalOptions, xhr) {
    options.headers = options.headers || {};
    options.headers['x-csrf-token'] = config.csrf;
  });

  window.app = new AppState(config);
  window.app.startPersona();
  window.app.on('login:failure', function (reason) {
    alert('Login error - ' + reason);
  });

  window.app.router = new Router();
  window.app.history = Backbone.history;

  window.app.renderPage = renderPage;

  window.app.on('ready', function () {
    var layout = this.layout = new Layout({model: this});
    $('body').append(layout.render().el);
    $(document).foundation();
    this.history.start({pushState: true, root: '/'});
  }, window.app);
}

function renderPage (view) {
  if (window.app.currentPage)
    window.app.currentPage.remove();

  window.app.currentPage = view;
  window.app.layout.$container.append(view.render().el);
}

launch();
