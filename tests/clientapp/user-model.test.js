var should = require('should');
var User = require('../../clientapp/models/user');

describe('user clientside model', function () {
  it('should init to unknown state', function () {
    var user = new User();
    should.strictEqual(user._id, undefined);
    should.strictEqual(user.email, undefined);
    should.strictEqual(user.loggedInUser, undefined);
    user.loggedIn.should.equal(false);
    should.strictEqual(user.loggedInUser, undefined);
    should.notStrictEqual(user.loggedInUser, null);
  });

  it('should init to logged out state', function () {
    var user = new User(null);
    should.strictEqual(user._id, undefined);
    should.strictEqual(user.email, null);
    should.strictEqual(user.loggedInUser, null);
    user.loggedIn.should.equal(false);
    should.strictEqual(user.loggedInUser, null);
    should.notStrictEqual(user.loggedInUser, undefined);
  });

  it('should init to logged in state', function () {
    var user = new User({email: 'hi@example.org', _id: '123'});
    user._id.should.equal('123');
    user.email.should.equal('hi@example.org');
    user.loggedInUser.should.equal('hi@example.org');
    user.loggedIn.should.equal(true);
    user.loggedInUser.should.equal('hi@example.org');
  });

  it('should log out', function () {
    var user = new User({email: 'hi@example.org', _id: '123'});
    user.setLoggedOut();
    should.strictEqual(user.email, null);
    should.strictEqual(user.loggedInUser, null);
    user.loggedIn.should.equal(false);
  });

  it('should log in', function () {
    var user = new User(null);
    user.setLoggedIn({email: 'hi@mockmyid.com', _id: '123'});
    user.email.should.equal('hi@mockmyid.com');
    user.loggedInUser.should.equal('hi@mockmyid.com');
    user.loggedIn.should.equal(true);
  });
});
