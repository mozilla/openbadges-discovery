var HumanModel = require('human-model');
var User = require('./user');

module.exports = HumanModel.define({
  initialize: function (opts) {
    this.navigator = opts.navigator || window.navigator;
  },
  session: {
    csrf: ['string'],
    personaReady: ['boolean', true, false],
    user: ['object', false]
  },
  derived: {
    loggedIn: {
      deps: ['user'],
      fn: function () {
        return !!this.user;
      }
    },
    loggedInUser: {
      deps: ['user'],
      fn: function () {
        if (!this.user) return this.user;
        return this.user.email;
      }
    }
  },
  startPersona: function () {
    var self = this;
    this.navigator.id.watch({
      loggedInUser: self.loggedInUser,
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
            self.user = data.user;
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
          console.log('CHANGE');
          self.user = null;
          self.trigger('logout');
        });
      },
      onready: function () {
        self.personaReady = true;
        self.trigger('ready');
      }
    });
  },
  getUserModel: function () {
    var model = new User(this.user);
    return model;
  }
});
