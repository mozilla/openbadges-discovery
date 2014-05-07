var User = require('../../app/models/user');
var db = require('../../app/lib/db');

describe.skip('User model', function () {

  afterEach(function (done) {
    db.deleteAll(done);
  });

  it('should create user', function (done) {
    User.getOrCreate({email: 'hi@example.org'}, function (err, user) {
      if (err) return done(err);
      user.should.have.properties('id', 'email');
      done();
    });
  });

  it('should get user', function (done) {
    User.getOrCreate({email: 'hi@example.org'}, function (err, user) {
      if (err) return done(err);
      User.getOrCreate({email: 'hi@example.org'}, function (err, user) {
        if (err) return done(err);
        user.should.have.properties('id', 'email');
        done();
      });
    });
  });
});
