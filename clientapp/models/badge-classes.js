var BadgeClass = require('./badge-class'),
    Backbone   = require('backbone');

module.exports = Backbone.Collection.extend({
  model: BadgeClass
});