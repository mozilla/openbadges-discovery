var config = require('clientconfig');
var AppState = require('./models/app-state');
var Pathway = require('./models/pathway');
var Layout = require('./views/layout');
var PathwayView = require('./views/pathway');

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
      loggedInUser: config.loggedInUser
    });
    me.startPersona();
    me.on('login:failure', function (reason) {
      alert('Persona error - ' + reason);
    });

    var pathway = new Pathway();
    pathway.fetch();

    me.on('ready', function () {
      var layout = new Layout({
        model: me
      });
      layout.render();
      var view = new PathwayView({
        model: pathway,
        el: $('#pages', layout.$el)
      });
      view.render();
      $('body').append(layout.el);
      $(document).foundation();
    });
  }
};

module.exports.launch();
