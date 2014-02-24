var HumanModel = require('human-model');

module.exports = HumanModel.define({
  initialize: function (opts) {
    if (opts === null) this.setLoggedOut();
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
  setLoggedIn: function (data) {
    this.clear();
    this.set(data);
  },
  setLoggedOut: function () {
    this.clear();
    this.email = null;
  }
});
