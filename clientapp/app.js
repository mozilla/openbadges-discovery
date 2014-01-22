/* jshint browser: true */

var Pathway = require('./models/pathway');
var PathwayView = require('./views/pathway');

module.exports = {
  launch: function () {

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
