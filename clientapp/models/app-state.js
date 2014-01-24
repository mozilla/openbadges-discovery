var HumanModel = require('human-model');

module.exports = HumanModel.define({
  session: {
    csrf: ['string'],
    personaReady: ['boolean', true, false],
    loggedInUser: ['string', false, undefined]
  },
  derived: {
    username: {
      deps: ['loggedInUser'],
      fn: function () {
        return this.loggedInUser || 'stranger!';
      }
    },
    loggedIn: {
      deps: ['loggedInUser'],
      fn: function () {
        return !!this.loggedInUser;
      }
    }
  },
  startPersona: function () {
    var self = this;
    navigator.id.watch({
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
            self.loggedInUser = data.email;
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
