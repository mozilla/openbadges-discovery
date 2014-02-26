var HumanModel = require('human-model');

module.exports = HumanModel.define({
  props: {
    id: ['number'],
    x: ['number'],
    y: ['number'],
    name: ['string']
  }
});
