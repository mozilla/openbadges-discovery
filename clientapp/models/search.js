var HumanModel = require('human-model');

module.exports = HumanModel.define({
  type: 'search_results',
  url: '/api/search',
  props: {
    pathways: ['array'],
    badges: ['array']
  }
});