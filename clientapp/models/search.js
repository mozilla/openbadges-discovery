var HumanModel = require('human-model');
var BadgeClasses = require('./badge-classes');

module.exports = HumanModel.define({
  type: 'search_results',
  url: '/api/search',
  props: {
    pathways: ['array'],
    badges: ['object']
  },
  parse: function (response) {
    return {
      pathways: response.pathways,
      badges: new BadgeClasses(response.badges)
    };
  }
});