var HumanModel = require('human-model');

var BADGE = 'badge';
var PATHWAY = 'pathway';

var DEFAULT_IMG = {
  'badge': '/static/badge.png',
  'pathway': '/static/pathway.png'
};

module.exports = HumanModel.define({
  urlRoot: function () {
    return '/api/' + this.type;
  },
  idAttribute: '_id',
  props: {
    _id: {
      type: 'string'
    },
    type: {
      values: [BADGE, PATHWAY],
      required: true
    },
    created_at: {
      type: 'number'
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
    creator: {
      type: 'string',
      required: true
    },
    favorite: {
      type: 'boolean',
      required: true,
      default: false
    },
    earned: {
      type: 'boolean',
      required: true,
      default: false
    },
    imgSrc: {
      type: 'string'
    }
  },
  derived: {
    status: {
      deps: ['favorite', 'earned'],
      fn: function () {
        if (this.earned) return 'owned';
        else if (this.favorite) return 'wishlisted';
        else return undefined;
      }
    },
    userFavorite: {
      cache: false,
      deps: ['favorite'],
      fn: function () {
        return window.app.currentUser.loggedIn ? this.favorite : false; 
      }
    },
    image: {
      deps: ['imgSrc', 'type'],
      fn: function () {
        return this.imgSrc ? this.imgSrc : DEFAULT_IMG[this.type];
      }
    }
  }
});

module.exports.BADGE = BADGE;
module.exports.PATHWAY = PATHWAY;
