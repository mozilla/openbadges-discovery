var HumanView = require('human-view');
var templates = require('templates');
var RequirementView = require('./requirement');

module.exports = HumanView.extend({
  template: templates.includes.grid,
  render: function () {
    this.renderAndBind({
      width: 3,
      height: 5
    });
    if (this.collection.length) {
      var self = this;
      this.collection.models.forEach(function (model) {
        var view = new RequirementView({model: model});
        view.render({containerEl: self.$el});
      });
    }
    this.collection.on('sync', this.render.bind(this));
    return this;
  }
});
