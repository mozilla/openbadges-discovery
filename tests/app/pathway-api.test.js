const api = require('../../app/api');
const db = require('../../app/lib/db');
const should = require('should');
const request = require('supertest');
const async = require('async');

describe('Pathway API', function () {

  beforeEach(function (done) {
    db.deleteAll(done);
  });

  describe('GET /pathway', function () {
    it('should return empty list without data', function (done) {
      request(api)
        .get('/pathway')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.an.Array;
          res.body.length.should.equal(0);
          done();
        });
    });

    it('should return pathways', function (done) {
      db.query("CREATE (n:Pathway {params})", {params:[
        {name: "Pathway A"}, {name: "Pathway B"}
      ]}, function (err) {
        if (err) return done(err);
        request(api)
          .get('/pathway')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.should.be.an.Array;
            res.body.length.should.equal(2);
            done();
          });
      });
    });
  });

  describe('GET /pathway/id', function () {
    it('should return pathway', function (done) {
      db.query("CREATE (n:Pathway {params}) RETURN n", {params:[
        {name: "Pathway A"}, {name: "Pathway B"}
      ]}, function (err, results) {
        if (err) return done(err);
        var p = results[0].n;
        request(api)
          .get('/pathway/' + p.id)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.should.be.an.Object;
            res.body.name.should.equal(p.name);
            done();
          });
      });
    });
  });

});

/*
    create → POST   /collection
    read → GET   /collection[/id]
    update → PUT   /collection/id
    delete → DELETE   /collection/id
*/
