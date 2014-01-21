/* jshint browser: true */

var Pathway = require('./models/pathway');
var PathwayView = require('./views/pathway');

module.exports = {
  launch: function () {

    var pathway = new Pathway({});

    $(function () {
      var view = new PathwayView({
        model: pathway,
        el: $(document.body)
      });
      view.render();
    });
  }
};

module.exports.launch();
