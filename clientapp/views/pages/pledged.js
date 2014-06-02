var HumanView = require('human-view');
var templates = require('templates');
var Editor = require('../includes/editor');
var AddPanel = require('../includes/add-panel');
var NotePanel = require('../includes/note-panel');
var Requirement = require('../../models/requirement');
var PathwayTitleView = require('../includes/pathway-title');
var PathwayEditView = require('../includes/pathway-edit');


module.exports = HumanView.extend({
  template: templates.pages.pledged,
  initialize: function (opts) {
    opts = opts || {};
    this.addSources = opts.addSources;
    this.listenTo(this.model, 'change', function (model) {
      model.save();
    });
    this.listenTo(this.model.requirements, 'change', function (model) {
      if (!model.isNew()) model.save();
    });
    this.listenTo(this.model.requirements, 'positioned', function (model) {
      model.save();
    });
    this.listenTo(this.model.requirements, 'remove', function (model) {
      model.destroy();
    });
    this.listenTo(this.model.requirements, 'add', function (model) {
      model.save();
    });

    this.listenTo(this.model.notes, 'change', function (model) {
      if (!model.isNew()) model.save();
    });
    this.listenTo(this.model.notes, 'positioned', function (model) {
      model.save();
    });
    this.listenTo(this.model.notes, 'remove', function (model) {
      model.destroy();
    });
    this.listenTo(this.model.notes, 'add', function (model) {
      model.save();
    });
  },
  render: function () {
    this.renderAndBind({
      pathway: this.model,
      user: window.app.currentUser
    });

    this.editor = new Editor({
      requirements: this.model.requirements,
      notes: this.model.notes,
      mode: 'edit'
    });
    this.renderSubview(this.editor, '.pathway-editor-container');

    var addPanel = new AddPanel({
      sources: this.addSources
    });
    addPanel.on('add', function (models) {
      this.model.requirements.add(models.map(function (model) {
        return Requirement.fromAchievement(model, {newFlag: true});
      }));
      this.moveToTop('#editorPanel');
    }, this);
    addPanel.on('cancel', function () {
      this.moveToTop('#editorPanel');
    }, this);
    this.renderSubview(addPanel, '.add-panel-container');

    var notePanel = new NotePanel();
    notePanel.on('cancel', function () {
      this.moveToTop('#editorPanel');
    }, this);
    notePanel.on('save', function (note) {
      note.pathwayId = this.model._id;
      this.model.notes.add(note);
      this.moveToTop('#editorPanel');
    }, this);
    this.renderSubview(notePanel, '.note-panel-container');

    var pathwayTitleView = new PathwayTitleView({
      model: this.model
    });
    this.renderSubview(pathwayTitleView, '.pathway-title');

    var pathwayEditView = new PathwayEditView({
      model: this.model
    });
    pathwayEditView.on('saved', function () {
      this.moveToTop('#pathwayTitle');
    }, this);
    pathwayEditView.on('cancel', function () {
      pathwayEditView.reset();
      this.moveToTop('#pathwayTitle');
    }, this);
    this.renderSubview(pathwayEditView, '.pathway-edit');

    this.$('.js-stack').each(function () {
      $(this).children().slice(1).addClass('bottom');
    });

    return this;
  },
  events: {
    'click [data-stack]': 'handleStackButton',
  },
  classBindings: {
    'complete': '.banner'
  },
  handleStackButton: function (evt) {
    this.moveToTop('#' + $(evt.currentTarget).data('stack'));
    evt.preventDefault();
  },
  moveToTop: function (sel) {
    $(sel).removeClass('bottom');
    $(sel).siblings().addClass('bottom');
  }
});
