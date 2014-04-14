var HumanModel = require('human-model');

module.exports = HumanModel.define({
  type: 'badge_class',
  props: {
    location: ['string'],
    name: ['string'],
    description: ['string'],
    image: ['string'],
    criteria: ['string'],
    issuer: ['string'],
    tags: ['array'],
    _indexed_at: ['number']
  }
});