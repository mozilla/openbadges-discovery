/* jshint expr: true */

var should = require('should');
var AppState = require('../../clientapp/models/app-state');

describe('app-state', function () {
  it('should init without user', function () {
    var state = new AppState({
      navigator: {} 
    });
    state.should.be.ok;
    state.personaReady.should.equal(false);
    state.loggedIn.should.equal(false);
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
    state.loggedIn.should.equal(true);
  });

  describe('.loggedInUser', function () {
    it('should be undefined when user is undefined', function () {
      var state = new AppState({
        navigator: {} 
      });
      should.strictEqual(state.loggedInUser, undefined, 'loggedInUser should be undefined');
    });

    it('should be null when user is null', function () {
      var state = new AppState({
        user: null,
        navigator: {} 
      });
      should.strictEqual(state.loggedInUser, null, 'loggedInUser should be null');
    });
 
    it('should be email when user defined', function () {
      var state = new AppState({
        user: {email: 'hi@example.org', id: 10},
        navigator: {} 
      });
      state.loggedInUser.should.equal('hi@example.org');
    });
  });
});