var HumanView = require('human-view');
var ListingView = require('./listing');
var Achievements = require('../models/achievements');
var templates = require('templates');

function fakeAchievement () {
  var type = Math.random() < 0.5 ? 'Badge' : 'Pathway';
  var data = {
    type: type.toLowerCase(),
    title: 'A Very Long ' + type + ' Title',
    tags: ['service', 'barista', 'coffeelover', 'fake'],
    creator: 'Starbucks'
  };
  if (me.loggedIn)
    data.favorite = Math.random() < 0.2 ? true : false;
  return data;
}

module.exports = HumanView.extend({
  template: templates.landing,
  events: {
    'click a': 'handleLink'
  },
  render: function () {
    this.renderAndBind({me: this.model});
    this.renderSubview(new ListingView({
      collection: new Achievements([1, 2, 3, 4, 5, 6, 7, 8].map(fakeAchievement))
    }), '.content');
    return this;
  },
  handleLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    //app.history.navigate(url, {trigger:true});
    console.log('Links disabled');
    e.preventDefault();
  }
});
