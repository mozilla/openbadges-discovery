var HumanModel = require('human-model');

module.exports = HumanModel.define({
  props: {
    id: {
      type: 'number'
    },
    type: {
      values: ['badge', 'pathway'],
      required: true
    },
    title: {
      type: 'string',
      required: true
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
        return me.currentUser.loggedIn ? this.favorite : false; 
      }
    }
  }
});
