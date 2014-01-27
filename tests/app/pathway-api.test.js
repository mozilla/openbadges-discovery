const api = require('../../app/api');
const db = require('../../app/lib/db');
const should = require('should');
const request = require('supertest');
const async = require('async');

describe('Pathway API', function () {

  beforeEach(function (done) {
    async.series([
      db.query.bind(db, "MATCH (n)-[r]->() DELETE n,r", {}),
      db.query.bind(db, "MATCH (n) DELETE n", {})
    ], done);
  });

  /*
  beforeEach(function (done) {
    db.query("CREATE (p:Pathway {
  });
  */

  it('should', function (done) {
    request(api)
      .get('/pathway')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
