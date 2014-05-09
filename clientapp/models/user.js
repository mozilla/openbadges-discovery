var HumanModel = require('human-model');

module.exports = HumanModel.define({
  initialize: function (opts) {
    if (opts === null) this.setLoggedOut();
  },
  idAttribute: '_id',
  url: '/api/user',
  props: {
    _id: {
      type: 'string'
    },
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
    },
    hideLoggedIn: {
      deps: ['loggedIn'],
      fn: function () {
        return this.loggedIn ? 'hide' : '';
      }
    },
    hideLoggedOut: {
      deps: ['loggedIn'],
      fn: function () {
        return !this.loggedIn ? 'hide' : '';
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
