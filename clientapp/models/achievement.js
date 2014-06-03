var HumanModel = require('human-model');

var BADGE = 'badge';
var PATHWAY = 'pathway';

var DEFAULT_IMG = {
  'badge': '/static/default_badge.svg',
  'pathway': '/static/default_pathway.svg'
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
    criteria: {
      type: 'string'
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
    },
    userId: {
      type: 'string'
    }
  },
  derived: {
    status: {
      deps: ['favorite', 'earned'],
      fn: function () {
        if (this.earned) return 'owned';
        else if (this.favorite) return 'favorited';
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
    },
    creatorDisplay: {
      deps: ['creator'],
      fn: function () {
        var user = window.app.currentUser;
        return (user.loggedIn && user._id === this.userId) ? "You" : this.creator;
      }
    }
  }
});

module.exports.BADGE = BADGE;
module.exports.PATHWAY = PATHWAY;
