/* jshint expr: true */

var should = require('should');
var AppState = require('../models/app-state');

describe('app-state', function () {
  it('should init', function () {
    var state = new AppState({
      navigator: {} 
    });
    state.should.be.ok;
    state.personaReady.should.equal(false);
    should.strictEqual(state.loggedInUser, undefined, 'loggedInUser should be undefined');
  });

  describe('.loggedInUser', function () {
    it('should init to undefined', function () {
      var state = new AppState({
        navigator: {} 
      });
      should.strictEqual(state.loggedInUser, undefined, 'loggedInUser should be undefined');
    });

    it('should init to null', function () {
      var state = new AppState({
        loggedInUser: null,
        navigator: {} 
      });
      should.strictEqual(state.loggedInUser, null, 'loggedInUser should be null');
    });
 
    it('should init to email', function () {
      var state = new AppState({
        loggedInUser: 'hi@example.org',
        navigator: {} 
      });
      state.loggedInUser.should.equal('hi@example.org');
    });
  });

  describe('.user', function () {
    it('should keep user object synchronized', function() {
      var state = new AppState({
        navigator: {} 
      });
      should.strictEqual(state.user, undefined, 'expect no user');

      state.loggedInUser = 'someone@example.org';
      state.user.should.be.ok;
      state.user.email.should.equal('someone@example.org');
      state.loggedInUser = null;
      should.strictEqual(state.user, undefined, 'expect no user');
    });
  });
});