var HumanModel = require('human-model');
var _ = require('underscore');

module.exports = HumanModel.define({
  idAttribute: '_id',
  props: {
    _id: ['string'],
    x: ['number'],
    y: ['number'],
    name: ['string'],
    imgSrc: ['string'],
    core: {
      type: 'boolean',
      default: false
    }
  },
  session: {
    newFlag: {
      type: 'boolean',
      default: false
    }
  }
});

module.exports.fromAchievement = function (achievement, opts) {
  opts = opts || {};
  // for now just return the attributes because human-model's
  // monkey patch of _prepareModel isn't fully working; let
  // collections build the actual model
  return _.extend({
    name: achievement.title,
    x: undefined,
    y: undefined
  }, opts);
};
