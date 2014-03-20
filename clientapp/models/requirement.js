var HumanModel = require('human-model');

module.exports = HumanModel.define({
  props: {
    id: ['number'],
    x: ['number'],
    y: ['number'],
    name: ['string'],
    core: {
      type: 'boolean',
      default: false
    }
  }
});

module.exports.fromAchievement = function (achievement) {
  // for now just return the attributes because human-model's
  // monkey patch of _prepareModel isn't fully working; let
  // collections build the actual model
  return {
    name: achievement.title,
    x: undefined,
    y: undefined
  };
};
