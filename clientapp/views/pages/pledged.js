var HumanView = require('human-view');
var templates = require('templates');
var Editor = require('../includes/editor');

module.exports = HumanView.extend({
  template: templates.pages.pledged,
  render: function () {
    this.renderAndBind({
      pathway: this.model,
      user: window.app.currentUser
    });
    this.renderSubview(new Editor({
      collection: this.collection,
      mode: 'edit'
    }), '.pathway-editor-container');
    return this;
  }
});
