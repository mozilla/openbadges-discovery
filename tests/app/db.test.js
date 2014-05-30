var should = require('should');
var async = require('async');
var db = require('../../app/lib/db');

describe('DB', function () {
  after(function () {
    db.closeAll();
  });

  it('should reuse database connection', function (done) {
    db.get('test', function (err, db1) {
      if (err) return done(err);
      db.get('test', function (err, db2) {
        if (err) return done(err);
        db1.should.equal(db2);
        done();
      });
    });
  });

  it('should be able to connect to multiple dbs', function (done) {
    db.get('test1', function (err, db1) {
      if (err) return done(err);
      db.get('test2', function (err, db2) {
        if (err) return done(err);
        db1.should.not.equal(db2);
        done();
      });
    });
  });

  it('should remove all docs in all collections', function (done) {
    db.get('test', function (err, db) {
      if (err) return done(err);
      async.series([
        function (cb) {
          db.achievements.insert({hello: 'world'}, {safe: true}, cb);
        },
        function (cb) {
          db.notes.insert({hello: 'note'}, {safe: true}, cb);
        },
        function (cb) {
          db.removeAll(cb);
        },
        function (cb) {
          db.achievements.count(function (err, count) {
            if (err) return cb(err);
            count.should.equal(0);
            cb();
          });
        },
        function (cb) {
          db.notes.count(function (err, count) {
            if (err) return cb(err);
            count.should.equal(0);
            cb();
          });
        }
      ], done);
    });
  });
});
