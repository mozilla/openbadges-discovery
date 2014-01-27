/* jshint expr: true */

var should = require('should');
var AppState = require('../../clientapp/models/app-state');

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
 
    it('should init to object', function () {
      var state = new AppState({
        loggedInUser: {email: 'hi@example.org'},
        navigator: {} 
      });
      state.loggedInUser.email.should.equal('hi@example.org');
    });
  });
});