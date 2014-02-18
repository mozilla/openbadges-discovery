var HumanModel = require('human-model');

module.exports = HumanModel.define({
  url: '/api/user',
  props: {
    id: ['number'],
    email: ['string', false]
  },
  derived: {
    loggedIn: {
      deps: ['email'],
      fn: function () {
        return !!this.email;
      }
    }
  }
});
