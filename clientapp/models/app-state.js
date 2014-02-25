var HumanModel = require('human-model');
var User = require('./user');

module.exports = HumanModel.define({
  initialize: function (opts) {
    this.navigator = opts.navigator || window.navigator;
    this.currentUser = new User(opts.user);
  },
  session: {
    csrf: {
      type: 'string'
    },
    personaReady: {
      type: 'boolean',
      default: false
    },
    currentUser: {
      type: 'object',
      setOnce: true
    }
  },
  _verify: function (data, status, xhr) {
    if (data && data.status === "okay") {
      this.currentUser.setLoggedIn(data.user);
      this.trigger('login:success', data.email);
      this.trigger('login', 'success', data.email);
    }
    else {
      this.trigger('login:failure', data.reason);
      this.trigger('login', 'failure', data.reason);
    }
  },
  _oncancel: function () {
    this.trigger('login:cancelled');
    this.trigger('login', 'cancelled');
  },
  _onlogin: function (assertion) {
    $.ajax({
      url: "/persona/verify",
      type: "POST",
      data: {
        assertion: assertion
      },
      dataType: "json"
    }).done(this._verify.bind(this));
  },
  _onlogout: function () {
    var self = this;
    $.ajax({
      url: "/persona/logout",
      type: "POST"
    }).done(function (data, status, xhr) {
      self.currentUser.setLoggedOut();
      self.trigger('logout');
    });
  },
  _onready: function () {
    this.personaReady = true;
    this.trigger('ready');
  },
  startPersona: function () {
    this.navigator.id.watch({
      loggedInUser: this.currentUser.loggedInUser,
      onlogin: this._onlogin.bind(this),
      onlogout: this._onlogout.bind(this),
      onready: this._onready.bind(this)
    });
  },
  startLogin: function () {
    this.navigator.id.request({
      oncancel: this._oncancel.bind(this)
    });
  },
  logout: function () {
    this.navigator.id.logout();
  }
});
