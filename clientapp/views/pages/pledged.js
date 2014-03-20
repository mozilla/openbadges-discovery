var HumanView = require('human-view');
var templates = require('templates');
var Editor = require('../includes/editor');
var AddPanel = require('../includes/add-panel');
var Requirement = require('../../models/requirement');

module.exports = HumanView.extend({
  template: templates.pages.pledged,
  initialize: function (opts) {
    opts = opts || {};
    this.addSources = opts.addSources;
  },
  render: function () {
    this.renderAndBind({
      pathway: this.model,
      user: window.app.currentUser
    });
    this.renderSubview(new Editor({
      collection: this.collection,
      mode: 'edit'
    }), '.pathway-editor-container');
    var addPanel = new AddPanel({
      sources: this.addSources
    });
    addPanel.on('add', function (models) {
      this.collection.add(models.map(function (model) {
        return Requirement.fromAchievement(model);
      }));
    }, this);
    this.renderSubview(addPanel, '.add-panel-container');
    return this;
  }
});
