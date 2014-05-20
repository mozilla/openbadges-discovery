var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
  template: templates.includes.notePanel,
  render: function () {
    this.renderAndBind();
    return this;
  },
  events: {
    'click .js-cancel-note': 'cancel',
    'click .js-save-note': 'save'
  },
  cancel: function (evt) {
    this.trigger('cancel');
    this.clear();
    evt.preventDefault();
  },
  save: function (evt) {
    var title = this.$('#note-title').val();
    var body = this.$('#note-body').val();
    var note = {
      title: title,
      body: body
    };
    this.trigger('save', note);
    this.clear();
    evt.preventDefault();
  },
  clear: function () {
    this.$('#note-title').val('');
    this.$('#note-body').val('');
  }
});
