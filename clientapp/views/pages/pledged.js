var HumanView = require('human-view');
var templates = require('templates');
var Editor = require('../includes/editor');
var AddPanel = require('../includes/add-panel');
var Requirement = require('../../models/requirement');
var PathwayEditView = require('../includes/pathway-edit');

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

    this.editor = new Editor({
      collection: this.collection,
      mode: 'edit'
    });
    this.renderSubview(this.editor, '.pathway-editor-container');

    var addPanel = new AddPanel({
      sources: this.addSources
    });
    addPanel.on('add', function (models) {
      this.collection.add(models.map(function (model) {
        return Requirement.fromAchievement(model, {newFlag: true});
      }));
      this.moveToTop('#editorPanel');
    }, this);
    addPanel.on('cancel', function () {
      this.moveToTop('#editorPanel');
    }, this);
    this.renderSubview(addPanel, '.add-panel-container');

    this.$('.js-stack').each(function () {
      $(this).children().slice(1).addClass('bottom');
    });

    var pathwayEditView = new PathwayEditView({
      model: this.model
    });

    pathwayEditView.on('edit', function(pathway) {

    });

    this.renderSubview(pathwayEditView, '.pathway-title');

    // var pathwayTitleView = new PathwayTitleView({
    //   model: this.model,
    //   attribute: 'title'
    // });

    // this.renderSubview(pathwayTitleView, '.pathway-title');

    // var pathwayDescView = new PathwayDescView({
    //   model: this.model,
    //   attribute: 'description'
    // });

    // this.renderSubview(pathwayDescView, '.pathway-title');


    return this;
  },
  events: {
    'click [data-stack]': 'handleStackButton',
  },
  handleStackButton: function (evt) {
    this.moveToTop('#' + $(evt.target).data('stack'));
    evt.preventDefault();
  },
  moveToTop: function (sel) {
    $(sel).removeClass('bottom');
    $(sel).siblings().addClass('bottom');
  }
});
