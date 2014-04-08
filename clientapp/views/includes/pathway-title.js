var HumanView = require('human-view');
var templates = require('templates');

module.exports = HumanView.extend({
	template: templates.includes.pathwayTitle,
	initialize: function (opts) {
		this.pathway = opts.model;
	},
	render: function() {
		this.renderAndBind({
			pathway: this.pathway
		});
		return this;
	},
	edit: function (evt) {
		alert("edit");
		this.trigger('edit', pathway);
		evt.preventDefault();
	},
	events: {
		'click .js-edit-pathway-title': 'edit'
	}
});