/* jshint expr: true */

var should = require('should');
var AppState = require('../../clientapp/models/app-state');

function FakeNavigator () {
  var self = this;

  self.id = {
    watch: function (opts) {
      this.watchOpts = opts;
    },
    request: function (opts) {
      this.requestOpts = opts;
    },
    logout: function () {}
  };

  self.simulateSuccess = function (state, user) {
    user = user || {id: 123, email:'default@example.org'};
    state._verify({
      status: 'okay',
      user: user,
      email: user.email
    });
  };

  self.simulateFailure = function (state, reason) {
    reason = reason || 'default reason';
    state._verify({
      status: 'error',
      reason: reason
    });
  };

  self.simulateCancel = function (state) {
    state._oncancel();
  };

  return self;
}

describe('app-state clientside model', function () {
  it('should init', function () {
    var state = new AppState({
      navigator: {}
    });
    state.should.be.ok;
    state.personaReady.should.equal(false);
    state.currentUser.should.be.an.Object;
    state.currentUser.loggedIn.should.equal(false);
  });

  it('should init with user data', function () {
    var state = new AppState({
      navigator: {},
      user: {
        email: 'hi@example.org',
        id: 123
      }
    });
    state.should.be.ok;
    state.personaReady.should.equal(false);
    state.currentUser.should.be.an.Object;
    state.currentUser.loggedIn.should.equal(true);
    state.currentUser.email.should.equal('hi@example.org');
  });

  it('should not allow setting of currentUser directly', function () {
    var state = new AppState({
      navigator: {}
    });
    (function () {state.currentUser = {};}).should.throw();
  });

  describe('Persona login', function () {

    var fake = new FakeNavigator();

    it('should emit login:failure', function (done) {
      var state = new AppState({
        navigator: fake
      });
      state.on('login:failure', function (reason) {
        reason.should.equal('Error because reasons');
        done();
      });
      fake.simulateFailure(state, 'Error because reasons');
    });

    it('should emit login:cancelled', function (done) {
      var state = new AppState({
        navigator: fake
      });
      state.on('login:cancelled', function () {
        done();
      });
      fake.simulateCancel(state);
    });

    it('should emit login:success', function (done) {
      var state = new AppState({
        navigator: fake
      });
      state.on('login:success', function (email) {
        email.should.equal('hi@example.org');
        done();
      });
      fake.simulateSuccess(state, {id: 1, email: 'hi@example.org'});
    });

    it('should emit login on success', function (done) {
      var state = new AppState({
        navigator: fake
      });
      state.on('login', function (result, email) {
        result.should.equal('success');
        email.should.equal('hi@example.org');
        done();
      });
      fake.simulateSuccess(state, {id: 1, email: 'hi@example.org'});
    });

    it('should emit login on failure', function (done) {
      var state = new AppState({
        navigator: fake
      });
      state.on('login', function (result, reason) {
        result.should.equal('failure');
        reason.should.equal('just because');
        done();
      });
      fake.simulateFailure(state, 'just because');
    });

    it('should emit login on cancellation', function (done) {
      var state = new AppState({
        navigator: fake
      });
      state.on('login', function (result) {
        result.should.equal('cancelled');
        done();
      });
      fake.simulateCancel(state);
    });
  });
});