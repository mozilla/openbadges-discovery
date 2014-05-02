var HumanView = require('human-view');
var templates = require('templates');
var DashTitle = require('../includes/dash-title');
var DashPanel = require('../includes/dash-panel');

module.exports = HumanView.extend({
  template: templates.pages.dashboard,
  initialize: function (opts) {
    opts = opts || {};
    this.sources = opts.sources;
  },
  render: function () {
    this.renderAndBind({
      pathway: this.model,
      user: window.app.currentUser
    });

    var dashTitle = new DashTitle({
      sources: this.sources
    });
    this.renderSubview(dashTitle, '.dash-title');

    var dashPanel = new DashPanel({
      sources: this.sources
    });
    this.renderSubview(dashPanel, '.dash-panel-container');

    return this;

  }
});