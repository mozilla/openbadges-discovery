var HumanModel = require('human-model');

module.exports = HumanModel.define({
  url: '/api/user',
  props: {
    id: ['number'],
    email: ['string', true]
  }
});
