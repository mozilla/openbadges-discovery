var HumanView = require('human-view');
var templates = require('templates');

var EditInPlaceForm = Backbone.View.extend({
    tagName: "form",

    events: {
        "submit": "save",
        "click" : "save"
    },

    initialize: function (options) {
        _.extend(this, options);
    },

    render: function () {
        this.$el.html($("<input>", {
            value: this.model.get(this.attribute)
        }));
        return this;
    },

    save: function () {
        this.model.set(this.attribute, this.$el.find("input").val());
        return false;
    }
});

module.exports = Backbone.View.extend({

    attribute: "text",

    initialize: function (options) {
        _.extend(this, options);
        this.model.on("change", this.render, this);
    },

    events: {
        "dblclick": "edit"
    },

    render: function () {
        this.$el.html(this.model.get(this.attribute));
        return this;
    },

    edit: function () {
        this.$el.html(new EditInPlaceForm({
            model: this.model,
            attribute: this.attribute
        }).render().el);
        this.$el.find("input").select();
    }

});