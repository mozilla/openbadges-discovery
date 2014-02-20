var HumanModel = require('human-model');

module.exports = HumanModel.define({
  initialize: function (opts) {
    if (opts === null) this.logout();
  },
  url: '/api/user',
  props: {
    id: ['number'],
    email: ['string']
  },
  derived: {
    loggedIn: {
      deps: ['email'],
      fn: function () {
        return !!this.email;
      }
    },
    loggedInUser: {
      // Persona concept: undefined -> unknown, null -> no user, string -> user
      deps: ['email'],
      fn: function () {
        return this.email;
      }
    }
  },
  login: function (data) {
    this.clear();
    this.set(data);
  },
  logout: function () {
    this.clear();
    this.email = null;
  }
});
