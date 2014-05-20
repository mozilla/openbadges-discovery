var HumanModel = require('human-model');

module.exports = HumanModel.define({
  idAttribute: '_id',
  urlRoot: '/api/note',
  props: {
    _id: ['string'],
    pathwayId: ['string'],
    title: ['string'],
    body: ['string'],
    x: ['number'],
    y: ['number']
  }
});
