var HumanModel = require('human-model');

module.exports = HumanModel.define({
  urlRoot: function () {
    return '/api/user/' + this.userId + '/stats';
  },
  props: {
    userId: {
      type: 'string',
      required: true
    },
    earned: {
      type: 'number'
    },
    favorited: {
      type: 'number'
    },
    pledged: {
      type: 'number'
    }
  }
});
