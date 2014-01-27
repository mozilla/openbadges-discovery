var HumanModel = require('human-model');
var User = require('./user');

module.exports = HumanModel.define({
  initialize: function (opts) {
    this.navigator = opts.navigator || window.navigator;
  },
  session: {
    csrf: ['string'],
    personaReady: ['boolean', true, false],
    loggedInUser: ['object', false, undefined]
  },
  derived: {
    loggedIn: {
      deps: ['loggedInUser'],
      fn: function () {
        return !!this.loggedInUser;
      }
    }
  },
  startPersona: function () {
    var self = this;
    this.navigator.id.watch({
      loggedInUser: self.loggedInUser && self.loggedInUser.email,
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
            self.loggedInUser = new User(data.user);
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
          self.loggedInUser = null;
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
