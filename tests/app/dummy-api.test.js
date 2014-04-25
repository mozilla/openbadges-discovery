const api = require('../../app/dummy-api');
const should = require('should');
const request = require('supertest');
const _ = require('underscore');
const express = require('express');

console.warn = function () {};


function setUser(user) {
  return function (req, res, next) {
    req.session = {
      user: user
    };
    next();
  };
}

function findPathway(server, after, context, done) {
  request(server)
    .get('/achievement')
    .query({pageSize: 8, after: after})
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      context.pathway = _.findWhere(res.body, {type: 'pathway'});
      if (!context.pathway) findPathway(server, after - 8, context, done);
      else done();
    });
}
      
describe('Dummy API', function () {

  describe('Fixtures', function () {
    it('should return server immediately', function () {
      api.createServer().should.be.an.Object;
      api.createServer({}).should.be.an.Object;
      api.createServer({}, function () {}).should.be.an.Object;
    });

    it('should expose fixtures on object', function () {
      var app = api.createServer({foo: 'bar'});
      app.should.have.property('fixtures');
      app.fixtures.should.eql({foo: 'bar'});
    });

    it('should invoke callback with initialized fixtures', function (done) {
      var app = api.createServer({foo: 'bar'}, function (fixtures) {
        fixtures.should.eql({foo: 'bar'});
        done();
      });
    });

    it('should add _ids to achievements', function (done) {
      var app = api.createServer({achievements: [{foo: 'bar'}]}, function (fixtures) {
        fixtures.achievements[0].should.have.property('_id');
        done();
      });
    });

    it('should connect favorites to achievements through achievementIdx', function (done) {
      var app = api.createServer({
        achievements: [{foo: 'bar'}, {foo: 'baz'}],
        favorites: [{userId: 1, achievementIdx: 1, favorite: true}]
      }, function (fixtures) {
        fixtures.favorites[0].should.have.property('itemId');
        fixtures.favorites[0].should.not.have.property('achievementIdx');
        fixtures.favorites[0].itemId.should.equal(fixtures.achievements[1]._id);
        done();
      });
    });

    it('should connect requirements to pathways through pathwayIdx', function (done) {
      var app = api.createServer({
        achievements: [{foo: 'bar'}, {foo: 'baz'}],
        requirements: [{pathwayIdx: 1}]
      }, function (fixtures) {
        fixtures.requirements[0].should.have.property('pathwayId');
        fixtures.requirements[0].should.not.have.property('pathwayIdx');
        fixtures.requirements[0].pathwayId.should.equal(fixtures.achievements[1]._id);
        done();
      });
    });

    it('should optionally fetch requirement name from badge through badgeIdx', function (done) {
      var app = api.createServer({
        achievements: [{title: 'The title'}, {foo: 'baz'}],
        requirements: [{pathwayIdx: 1, badgeIdx: 0}]
      }, function (fixtures) {
        fixtures.requirements[0].should.have.property('name');
        fixtures.requirements[0].should.not.have.property('badgeIdx');
        fixtures.requirements[0].name.should.equal(fixtures.achievements[0].title);
        done();
      });
    });
  });

  describe('GET /achievements', function () {
    it('should generate achievements on demand', function (done) {
      var server = api.createServer();
      request(server)
        .get('/achievement')
        .query({pageSize: 8})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          var achievements = res.body;
          achievements.length.should.equal(8);
          var last = achievements[7].created_at;
          request(server)
            .get('/achievement')
            .query({pageSize: 8, after: last})
            .expect(200)
            .expect(function (res2) {
              var achievements2 = res2.body;
              achievements2.length.should.equal(8);
              achievements2[0].created_at.should.be.lessThan(last);
            })
            .end(done);
        })
        .end(function (err, res) {
          if (err) done(err);
        });
    });

    it('should persist generated data', function (done) {
      var server = api.createServer();
      request(server)
        .get('/achievement')
        .query({pageSize: 8})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          var achievements = res.body;
          achievements.length.should.equal(8);
          /* types are randomized so seeing the same type-pattern means regeneration of
             the data is extremely unlikely */
          var types = _.pluck(achievements, 'type'); 
          request(server)
            .get('/achievement')
            .query({pageSize: 8})
            .expect(200)
            .expect(function (res2) {
              var achievements2 = res2.body;
              var types2 = _.pluck(achievements2, 'type'); 
              types.should.eql(types2);
            })
            .end(done);
        })
        .end(function (err, res) {
          if (err) done(err);
        });
    });

    it('should decorate with favorites when logged in', function (done) {
      var server = api.createServer();
      var app = express();
      app.use(setUser({id: 1}));
      app.use(server);
      request(app)
        .get('/achievement')
        .query({pageSize: 8})
        .expect(200)
        .expect(function (req) {
          var achievements = req.body;
          achievements[0].should.have.property('favorite');
        })
        .end(done);
    });
  });

  ['achievement', 'badge', 'pathway'].forEach(function (name) {
    describe('GET /' + name + '/:id', function () {
      before(function (done) {
        var server = this.server = api.createServer();
        var that = this;
        request(server)
          .get('/achievement')
          .query({pageSize: 1})
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            res.body.length.should.equal(1);
            res.body[0].should.have.property('_id');
            that.achievement = res.body[0];
            that.id = res.body[0]._id;
            done();
          });
      });

      it('should return achievement', function (done) {
        var that = this;
        request(this.server)
          .get('/' + name + '/' + this.id)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            res.body.should.eql(that.achievement); 
          })
          .end(done);
      });

      it('should 404', function (done) {
        request(this.server)
          .get('/' + name + '/nope')
          .expect(404)
          .end(done);
      });
    });

    describe('PATCH /' + name + '/:id', function () {
      before(function (done) {
        var server = this.server = api.createServer();
        var that = this;
        request(server)
          .get('/achievement')
          .query({pageSize: 1})
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            res.body.length.should.equal(1);
            res.body[0].should.have.property('_id');
            that.achievement = res.body[0];
            that.id = res.body[0]._id;
            done();
          });
      });
      
      it('should set favorite', function (done) {
        var id = this.id;
        var fav = this.achievement.favorite;
        var app = express();
        app.use(setUser({id: 1}));
        app.use(this.server);
        request(app)
          .patch('/' + name + '/' + id)
          .send({favorite: !fav})
          .expect(200)
          .expect(function (res) {
            request(app)
              .get('/' + name + '/' + id)
              .expect(200)
              .expect(function (res) {
                res.body.should.have.property('favorite');
                res.body.favorite.should.equal(!fav);
              })
              .end(done);
          })
          .end(function (err) {
            if (err) done(err);
          });
      });
    });
  });

  describe('GET /pathway/:id/requirement', function () {
    before(function(done) {
      var server = this.server = api.createServer();
      findPathway(server, Date.now(), this, done);
    });

    it('should generate pre-positioned requirements', function (done) {
      var context = this;
      request(this.server)
        .get('/pathway/' + this.pathway._id + '/requirement')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          var requirements = context.requirements = res.body;
          requirements.length.should.equal(5); 
          requirements[0].should.have.properties('x', 'y');
        })
        .end(done);
    });

    it('should persist generated data', function (done) {
      var context = this;
      request(this.server)
        .get('/pathway/' + this.pathway._id + '/requirement')
        .expect(200)
        .expect(function (res) {
          var requirements = res.body;
          requirements.length.should.equal(context.requirements.length);
          requirements.forEach(function (requirement) {
            context.requirements.should.containEql(requirement);
          });
        })
        .end(done);
    });
  });

  describe('POST /pathway/:id/requirement', function () {
    before(function(done) {
      var server = this.server = api.createServer();
      findPathway(server, Date.now(), this, done);
    });
   
    it('should create a new requirement', function (done) {
      var id = this.pathway._id;
      var server = this.server;
      var newReq = {x: 0, y: 6, name: 'New req', core: false};
      request(server)
        .post('/pathway/' + id + '/requirement')
        .send(newReq)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.should.be.an.Object;
          res.body.should.have.property('_id');
          newReq._id = res.body._id;
          newReq.pathwayId = id;
        })
        .end(function (err) {
          if (err) return done(err);
          request(server)
            .get('/pathway/' + id + '/requirement')
            .expect(200)
            .expect(function (res) {
              res.body.length.should.equal(1);
              res.body[0].should.eql(newReq);
            })
            .end(done);
        });
    });
  });

  describe('PUT /pathway/:id/requirement/:rid', function () {
    before(function (done) {
      var server = this.server = api.createServer();
      findPathway(server, Date.now(), this, done);
    });

    it('should update requirement', function (done) {
      var id = this.pathway._id;
      var server = this.server;
      var original = {x: 0, y: 6, name: 'New req', core: false};
      var changes = {x:2, y:1};
      request(server)
        .post('/pathway/' + id + '/requirement')
        .send(original)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          res.body.should.be.an.Object;
          original._id = res.body._id;
          request(server)
            .put('/pathway/' + id + '/requirement/' + original._id)
            .send(changes)
            .expect(200)
            .end(function (err) {
              if (err) return done(err);
              request(server)
                .get('/pathway/' + id + '/requirement')
                .expect(200)
                .expect(function (res) {
                  res.body.length.should.equal(1);
                  res.body[0].should.have.properties(changes);
                })
                .end(done);
            });
        });
    });
  });

  describe('GET /user/:id/earned', function () {
    it('should return an empty list for now', function (done) {
      var app = express();
      app.use(setUser({id: 1}));
      app.use(api.createServer());
      request(app)
        .get('/user/1/earned')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect([])
        .end(done);
    });
  });

  describe('GET /user/:id/favorite', function () {
    it('should return favorited achievements', function (done) {
      var server = api.createServer({
        favorites: [
          {userId: 1, achievementIdx: 0, favorite: true}
        ],
        achievements: [
          {title: "My achievement"}
        ]
      });
      var app = express();
      app.use(setUser({id: 1}));
      app.use(server);
      request(app)
        .get('/user/1/favorite')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length.should.equal(1); 
          res.body[0].title.should.equal("My achievement");
        })
        .end(done);
    });
  });

  describe('GET /user/:id/pledged', function () {
    it('should return pledged pathways', function (done) {
      var server = api.createServer({
        achievements: [
          {title: "My pledged", userId: 1},
          {title: "Someone else's pledged", userId: 2}
        ]
      });
      var app = express();
      app.use(setUser({id: 1}));
      app.use(server);
      request(app)
        .get('/user/1/pledged')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length.should.equal(1); 
          res.body[0].title.should.equal("My pledged");
        })
        .end(done);
    });
  });

  describe('POST /user/:id/pledged', function () {
    it('should pledge a clone of a pathway', function (done) {
      var server = api.createServer({
        achievements: [
          {title: "A pathway", userId: 2}
        ]
      }, function (fixtures) {
        var app = express();
        app.use(setUser({id: 1}));
        app.use(server);
        request(app)
          .post('/user/1/pledged')
          .send({cloneId: fixtures.achievements[0]._id})
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            res.body.should.be.an.Object;
            res.body.title.should.equal("A pathway");
            res.body.userId.should.equal(1);
            res.body._id.should.not.equal(fixtures.achievements[0]._id);
          })
          .end(done);
      });
    });

    it('should make clone the newest achievement', function (done) {
      var server = api.createServer();
      var app = express();
      app.use(setUser({id: 1}));
      app.use(server);
      request(app)
        .get('/achievement')
        .query({pageSize: 8})
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);    
          var latest = res.body[0];
          request(app)
            .post('/user/1/pledged')
            .send({cloneId: latest._id})
            .expect(200)
            .expect(function (res) {
              res.body.created_at.should.be.greaterThan(latest.created_at);
            })
            .end(function (err, res) {
              if (err) return done(err);
              var pledgedId = res.body._id;
              request(app)
                .get('/achievement')
                .query({pageSize: 8})
                .expect(200)
                .expect(function (res) {
                  res.body[0]._id.should.equal(pledgedId);
                })
                .end(done);
            });
        });
    });
  });

  describe('GET /user/:id/pledged/:pid', function () {
    it('should return pledged pathway', function (done) {
      var server = api.createServer({
        achievements: [{title: "A pathway", userId: 1}]
      }, function (fixtures) {
        var app = express();
        app.use(setUser({id: 1}));
        app.use(server);
        request(app)
          .get('/user/1/pledged/' + fixtures.achievements[0]._id)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            res.body.should.be.an.Object;
            res.body.title.should.equal("A pathway");
            res.body.userId.should.equal(1);
          })
          .end(done);
      });
    });
  });

  describe('PUT /user/:id/pledged/:pid', function () {
    it('should edit pledged pathway', function (done) {
      var server = api.createServer({
        achievements: [{title: "Original", userId: 1}]
      }, function (fixtures) {
        var app = express();
        app.use(setUser({id: 1}));
        app.use(server);
        request(app)
          .put('/user/1/pledged/' + fixtures.achievements[0]._id)
          .send({title: "New", description: "Desc"})
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({})
          .end(function (err) {
            if (err) return done(err);
            request(server)
              .get('/user/1/pledged/' + fixtures.achievements[0]._id)
              .expect(200)
              .expect(function (res) {
                res.body.should.be.an.Object;
                res.body.should.have.properties({title: "New", description: "Desc"});
              })
              .end(done);
          });
      });
    });
  });
});