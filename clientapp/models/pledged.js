var HumanModel = require('human-model');

module.exports = HumanModel.define({
  props: {
    _id: {
      type: 'string'
    },
    userId: {
      type: 'number'
    },
    cloneId: {
      type: 'string'
    },
    title: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: false
    },
    tags: {
      type: 'array',
      required: false
    }
  },
  idAttribute: '_id',
  urlRoot: function () {
    return '/api/user/' + this.userId + '/pledged/';
  },
});
