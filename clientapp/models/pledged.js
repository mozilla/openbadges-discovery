var HumanModel = require('human-model');
var Requirements = require('./requirements');

module.exports = HumanModel.define({
  initialize: function () {
    this.requirements.on('add', this.checkComplete, this);
    this.requirements.on('remove', this.checkComplete, this);
    this.requirements.on('change:complete', this.checkComplete, this);
  },
  checkComplete: function () {
    this.complete = !this.requirements.findWhere({complete: false});
  },
  props: {
    _id: {
      type: 'string'
    },
    userId: {
      type: 'string'
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
    },
    imgSrc: {
      type: 'string'
    }
  },
  collections: {
    requirements: Requirements
  },
  session: {
    complete: {
      type: 'boolean',
      default: false
    }
  },
  idAttribute: '_id',
  urlRoot: function () {
    return '/api/user/' + this.userId + '/pledged/';
  },
});
