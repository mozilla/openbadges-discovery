var HumanModel = require('human-model');
var User = require('./user');

module.exports = HumanModel.define({
  initialize: function (opts) {
    this.navigator = opts.navigator || window.navigator;
    this.currentUser = new User(opts.user);
  },
  session: {
    csrf: {
      type: 'string'
    },
    personaReady: {
      type: 'boolean',
      default: false
    },
    currentUser: {
      type: 'object',
      setOnce: true
    }
  },
  startPersona: function () {
    var self = this;
    this.navigator.id.watch({
      loggedInUser: self.currentUser.loggedInUser,
      onlogin: function (assertion) {
        $.ajax({
          url: "/persona/verify",
          type: "POST",
          data: {
            assertion: assertion
          },
          dataType: "json"
        }).done(function (data, status, xhr) {
          if (data && data.status === "okay") {
            self.currentUser.login(data.user);
            self.trigger('login:success', data.email);
          }
          else {
            self.trigger('login:failure', data.reason);
          }
        });
      },
      onlogout: function () {
        $.ajax({
          url: "/persona/logout",
          type: "POST"
        }).done(function (data, status, xhr) {
          self.currentUser.logout();
          self.trigger('logout');
        });
      },
      onready: function () {
        self.personaReady = true;
        self.trigger('ready');
      }
    });
  }
});
