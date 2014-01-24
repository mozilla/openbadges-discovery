var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.welcome,
  events: {
    'click a': 'handleLink'
  },
  render: function () {
    this.renderAndBind({me: this.model});
    return this;
  },
  handleLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    app.history.navigate(url, {trigger:true});
    e.preventDefault();
  }
});
