var HumanView = require('human-view');
var templates = require('templates');
var AddPanel = require('../includes/add-panel');
var DashTitle = require('../includes/dash-title');
var DashPanel = require('../includes/dash-panel');
var Requirement = require('../../models/requirement');
var Achievement = require('../../models/achievement');


console.log('or do they come in here?');
module.exports = HumanView.extend({
  template: templates.pages.dashboard,
  initialize: function (opts) {
    opts = opts || {};
    this.addSources = opts.addSources;
  },
  render: function () {
    this.renderAndBind({
      pathway: this.model,
      user: window.app.currentUser
    });
    console.log('where is the appendChild?');

    var dashTitle = new DashTitle({
      sources: this.addSources
    });
    this.renderSubview(dashTitle, '.dash-title');

    var dashPanel = new DashPanel({
      sources: this.addSources
    });
    this.renderSubview(dashPanel, '.dash-panel-container');

    return this;

  }
});
