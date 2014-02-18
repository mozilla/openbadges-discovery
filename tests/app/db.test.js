const db = require('../../app/lib/db');
const async = require('async');
const stream = require('stream');

describe('db', function () {

  describe('callback API', function () {
    beforeEach(function (done) {
      db.deleteAll(done);
    });

    it('should query', function (done) {
      db.query('CREATE n RETURN n', {}, function (err, results) {
        if (err) return done(err);
        results.length.should.equal(1);
        done();
      });
    });

    it('should make query params optional', function (done) {
      db.query('CREATE n RETURN n', function (err, results) {
        if (err) return done(err);
        results.length.should.equal(1);
        done();
      });
    });

    it('should return results as list of row objects keyed by column name', function (done) {
      db.query('CREATE (n {params}) RETURN n', {params:[
        {name: 'a'}, {name: 'b'}
      ]}, function (err, results) {
        if (err) return done(err);
        results.length.should.equal(2);
        results[0].should.be.an.Object;
        results[0].should.have.key('n');
        results[1].should.be.an.Object;
        results[1].should.have.key('n');
        done();
      });
    });

    it('should return nodes as data objects with ids', function (done) {
      db.query('CREATE (n {params}) RETURN n', {params:[
        {name: 'a'}, {name: 'b'}
      ]}, function (err, results) {
        if (err) return done(err);
        results[0].n.should.be.an.Object;
        results[0].n.should.have.keys('id', 'name');
        results[0].n.id.should.be.a.Number;
        done();
      });
    });

    it('should key row objects by RETURN variables', function (done) {
      db.query('CREATE (n:Foo {params}) RETURN n as thing, "hi" as greeting', {params:[
        {name: 'a'}, {name: 'b'}
      ]}, function (err, results) {
        if (err) return done(err);
        results[0].should.have.keys('thing', 'greeting');
        done();
      });
    });

    it('should delete all', function (done) {
      async.series([
        function (cb) {
          db.query('CREATE (n {params}) RETURN n', {
            params: [
              {name: 'a'},
              {name: 'b'},
              {name: 'c'}
            ]
           }, function (err, results) {
            if (err) return cb(err);
            results.length.should.equal(3);
            cb();
          });
        },
        function (cb) {
          db.query('CREATE ()-[r:touches]->() RETURN r', {}, function (err, results) {
            if (err) return cb(err);
            results.length.should.equal(1);
            cb();
          });
        },

        db.deleteAll,

        function (cb) {
          db.query('MATCH n RETURN n', {}, function (err, results) {
            if (err) return cb(err);
            results.length.should.equal(0);
            cb();
          });
        }
      ], done);
    });
  });

  describe('stream API', function () {
    beforeEach(function (done) {
      db.deleteAll(done);
    });

    it('should emit rows', function (done) {
      var s = db.queryStream('CREATE (n {params}) RETURN n', {params: [
        {name: 'a'}, {name: 'b'}, {name: 'c'}
      ]});
      var count = 0;
      s.on('data', function (row) {
        row.should.have.keys('n');
        count++;
      });
      s.on('end', function () {
        count.should.equal(3);
        done();
      });
    });

    it('should emit error', function (done) {
      var s = db.queryStream('THIS IS NOT VALID CYPHER');
      s.on('error', function (err) {
        err.should.be.an.Object;
        err.should.have.properties('message', 'exception', 'fullname', 'stacktrace');
        done();
      });
    });
  });
});
