var HumanModel = require('human-model');

module.exports = HumanModel.define({
  url: '/api/user',
  props: {
    id: ['number', true],
    email: ['string', true]
  }
});
