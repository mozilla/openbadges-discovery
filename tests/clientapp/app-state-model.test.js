/* jshint expr: true */

var should = require('should');
var AppState = require('../../clientapp/models/app-state');

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
});