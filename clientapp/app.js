var config = require('clientconfig');
var persona = require('persona-observer');
var Pathway = require('./models/pathway');
var PathwayView = require('./views/pathway');

module.exports = {
  launch: function () {

    $.ajaxPrefilter(function (options, originalOptions, xhr) {
      options.headers = options.headers || {};
      options.headers['x-csrf-token'] = config.csrf;
    });

    persona({
      onloginSuccess: function () {
        console.log('onloginSuccess');
      },
      onlogout: function () {
        console.log('onlogout');
      }
    });

    var pathway = new Pathway({
      rows: [
        {
          cells: [
            {badge: false},
            {badge: true},
            {badge: true},
            {badge: false}
          ]
        },
        {
          cells: [
            {badge: true},
            {badge: false},
            {badge: false},
            {badge: false}
          ]
        },
        {
          cells: [
            {badge: false},
            {badge: false},
            {badge: true},
            {badge: false}
          ]
        },
        {
          cells: [
            {badge: false},
            {badge: false},
            {badge: false},
            {badge: false}
          ]
        }
      ]
    });

    $(function () {
      var view = new PathwayView({
        model: pathway
      });
      $('body').append(view.render().el);
    });
  }
};

module.exports.launch();
