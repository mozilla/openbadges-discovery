const api = require('../../app/api');
const should = require('should');
const request = require('supertest');
const _ = require('underscore');
const express = require('express');
const db = require('../../app/lib/db');
const ObjectID = require('mongodb').ObjectID;

console.warn = function () {};

function flatten(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function setUser(user) {
  return function (req, res, next) {
    req.session = {
      user: user
    };
    next();
  };
}
      
describe('Dummy API', function () {
  before(function (done) {
    var context = this;
    db.get('test', function (err, db) {
      if (err) return done(err);
      context.db = db; 
      db.removeAll(done);
    });
  });

  describe('GET /achievements', function () {
    before(function (done) {
      var context = this;
      var userId = this.userId = '0123456789abcdef01234567';
      var db = this.db;
      db.achievements.insert({
        hello: 'achievement',
        created_at: 0
      }, {safe: true}, function (err, docs) {
        if (err) return done(err);
        context.fixture = flatten(docs);
        db.favorites.insert({
          userId: new ObjectID(userId),
          itemId: docs[0]._id,
          favorite: true
        }, {safe: true}, done);
      });
    });

    it('should return achievements', function (done) {
      var fixture = this.fixture;
      var server = api.createServer({db: this.db});
      request(server)
        .get('/achievement')
        .query({pageSize: 8})
        .expect(200)
        .expect(function (req) {
          var achievements = req.body;
          achievements.should.eql(fixture);
        })
        .end(done);
    });

    it('should decorate with favorites when logged in', function (done) {
      var server = api.createServer({db: this.db});
      var app = express();
      app.use(setUser({_id: this.userId}));
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
        var context = this;
        var db = this.db;
        this.server = api.createServer({db: db});
        db.achievements.insert({
          hello: 'achievement',
          created_at: 0
        }, {safe: true}, function (err, docs) {
          context.fixture = flatten(docs[0]);
          done();
        });
      });

      it('should return achievement', function (done) {
        var fixture = this.fixture;
        request(this.server)
          .get('/' + name + '/' + fixture._id)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            res.body.should.eql(fixture);
          })
          .end(done);
      });

      it('should 404', function (done) {
        request(this.server)
          .get('/' + name + '/deadbeefdeadbeefdeadbeef')
          .expect(404)
          .end(done);
      });
    });

    describe('PATCH /' + name + '/:id', function () {
      before(function (done) {
        var context = this;
        var userId = this.userId = '0123456789abcdef01234567';
        var db = this.db;
        this.server = api.createServer({db: db});
        db.removeAll(function (err) {
          if (err) return done(err);
          db.achievements.insert({
            hello: 'achievement',
            created_at: 0
          }, {safe: true}, function (err, docs) {
            context.fixture = flatten(docs[0]);
            db.favorites.insert({
              userId: new ObjectID(userId),
              itemId: docs[0]._id,
              favorite: true
            }, {safe: true}, function (err, docs) {
              done();
            });
          });
        });
      });

      it('should set favorite', function (done) {
        var fixture = this.fixture;
        var db = this.db;
        var app = express();
        app.use(setUser({_id: this.userId}));
        app.use(this.server);
        request(app)
          .patch('/' + name + '/' + fixture._id)
          .send({favorite: false})
          .expect(200)
          .expect({})
          .expect(function () {
            db.favorites.find().toArray(function(err, docs) {
              docs[0].favorite.should.equal(false);
            });
          })
          .end(done);
      });
    });
  });

  describe('GET /pathway/:id/requirement', function () {
    it('should get pathway requirements', function (done) {
      var db = this.db;
      db.achievements.insert([
        {title: 'pathway a'}, {title: 'pathway b'}, {title: 'badge a'}, {title: 'badge b'}
      ], {safe: true}, function (err, achievements) {
        db.requirements.insert([
          {name: 'a', pathwayId: achievements[0]._id, badgeId: achievements[2]._id},
          {name: 'b', pathwayId: achievements[1]._id, badgeId: achievements[3]._id}
        ], {safe: true}, function (err, requirements) {
          request(api.createServer({db: db}))
            .get('/pathway/' + achievements[0]._id + '/requirement')
            .expect(200)
            .expect(function (res) {
              var result = res.body;
              result.length.should.equal(1);
              result.should.eql(flatten(requirements.slice(0, 1)));
            })
            .end(done);
        });
      });
    });
  });

  describe('GET /pathway/:id/note', function () {
    it('should get pathway notes', function (done) {
      var db = this.db;
      db.achievements.insert([
        {title: 'pathway a'}, {title: 'pathway b'}
      ], {safe: true}, function (err, achievements) {
        db.notes.insert([
          {title: 'note a', pathwayId: achievements[0]._id},
          {title: 'note b', pathwayId: achievements[1]._id}
        ], {safe: true}, function (err, notes) {
          request(api.createServer({db: db}))
            .get('/pathway/' + achievements[0]._id + '/note')
            .expect(200)
            .expect(function (res) {
              var result = res.body;
              result.length.should.equal(1);
              result.should.eql(flatten(notes.slice(0, 1)));
            })
            .end(done);
        });
      });
    });
  });

  describe('POST /pathway/:id/requirement', function () {
    before(function(done) {
      var server = this.server = api.createServer({db: this.db});
      var context = this;
      this.db.achievements.insert({
        hi: 'there'
      }, {safe: true}, function (err, docs) {
        if (err) return done(err);
        context.fixture = flatten(docs[0]); 
        done();
      });
    });
   
    it('should create a new requirement', function (done) {
      var id = this.fixture._id;
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
              res.body.should.containEql(newReq);
            })
            .end(done);
        });
    });
  });

  describe('PUT /pathway/:id/requirement/:rid', function () {
    before(function (done) {
      var server = this.server = api.createServer({db: this.db});
      var context = this;
      this.db.achievements.insert({
        hi: 'there'
      }, {safe: true}, function (err, docs) {
        if (err) return done(err);
        context.fixture = flatten(docs[0]); 
        done();
      });
    });

    it('should update requirement', function (done) {
      var id = this.fixture._id;
      var server = this.server;
      var original = {x: 0, y: 6, name: 'New req', core: false, pathwayId: id};
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
                  res.body.should.containEql(_.extend(original, changes));
                })
                .end(done);
            });
        });
    });

    it('should earn achievement on completed requirement', function (done) {
      var db = this.db;
      var server = this.server;
      var userId = new ObjectID('0123456789abcdef01234567');
      db.achievements.insert([{
        title: 'pathway'
      },{
        title: 'badge'
      }], {safe: true}, function (err, achievements) {
        var pathway = achievements[0];
        var badge = achievements[1];
        db.requirements.insert({
          name: 'requirement',
          pathwayId: pathway._id,
          badgeId: badge._id
        }, {safe: true}, function (err, requirements) {
          var app = express();
          app.use(setUser({_id: userId}));
          app.use(server);
          request(app)
            .put('/pathway/' + pathway._id + '/requirement/' + requirements[0]._id)
            .send(_.extend(requirements[0], {complete: true}))
            .expect(200)
            .expect(function () {
              db.earned.find({userId: userId, itemId: badge._id}).toArray(function (err, docs) {
                if (err) return done(err);
                docs.length.should.equal(1);
              });
            })
            .end(done);
        });
      });
    });
  
    it('should unearn achievement on uncompleted requirement', function (done) {
      var db = this.db;
      var server = this.server;
      var userId = new ObjectID('0123456789abcdef01234567');
      db.achievements.insert([{
        title: 'pathway'
      },{
        title: 'badge'
      }], {safe: true}, function (err, achievements) {
        var pathway = achievements[0];
        var badge = achievements[1];
        db.requirements.insert({
          name: 'requirement',
          pathwayId: pathway._id,
          badgeId: badge._id
        }, {safe: true}, function (err, requirements) {
          db.earned.insert({
            userId: userId,
            itemId: badge._id
          }, {safe: true}, function (err, earned) {
            var app = express();
            app.use(setUser({_id: userId}));
            app.use(server);
            request(app)
              .put('/pathway/' + pathway._id + '/requirement/' + requirements[0]._id)
              .send(_.extend(requirements[0], {complete: false}))
              .expect(200)
              .expect(function () {
                db.earned.find({userId: userId, itemId: badge._id}).toArray(function (err, docs) {
                  if (err) return done(err);
                  docs.length.should.equal(0);
                });
              })
              .end(done);
          });
        });
      });
    });
  });

  describe('DELETE /pathway/:id/requirement/:id', function () {
    it('should delete requirement', function (done) {
      var db = this.db;
      db.removeAll(function (err) {
        if (err) return done(err);
        db.requirements.insert({
          name: 'requirment'
        }, {safe: true}, function (err, requirements) {
          request(api.createServer({db: db}))
            .del('/pathway/whatever/requirement/' + requirements[0]._id.toString())
            .expect(200)
            .expect(function () {
              db.requirements.find().toArray(function (err, requirements) {
                if (err) return done(err);
                requirements.length.should.equal(0);
                done();
              });
            })
            .end(function (err) {
              if (err) return done(err);
            });
        });
      });
    });
  });

  describe('GET /user/:id/earned', function () {
    it('should return earned achievements', function (done) {
      var userId = new ObjectID('0123456789abcdef01234567');
      var db = this.db;
      db.achievements.insert({
        title: "achievement",
        created_at: 0
      }, {safe: true}, function (err, achievements) {
        if (err) return done(err);
        db.earned.insert({
          userId: userId,
          itemId: achievements[0]._id
        }, {safe: true}, function (err, earned) {
          if (err) return done(err);
          var app = express();
          app.use(setUser({_id: userId}));
          app.use(api.createServer({db: db}));
          request(app)
            .get('/user/' + userId + '/earned')
            .query({pageSize: 4})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
              res.body.should.eql(flatten(achievements)); 
            })
            .end(done);
        });
      });
    });
  });

  describe('GET /user/:id/favorite', function () {
    it('should return favorited achievements', function (done) {
      var db = this.db;
      var userId = this.userId = '0123456789abcdef01234567';
      db.achievements.insert({
        title: 'My achievement',
        created_at: 0
      }, {safe: true}, function (err, docs) {
        if (err) return done(err);
        db.favorites.insert({
          userId: new ObjectID(userId),
          itemId: docs[0]._id,
          favorite: true
        }, {safe: true}, function (err, docs) {
          var server = api.createServer({db: db});
          var app = express();
          app.use(setUser({_id: userId}));
          app.use(server);
          request(app)
            .get('/user/' + userId + '/favorite')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
              res.body.length.should.equal(1); 
              res.body[0].title.should.equal("My achievement");
            })
            .end(done);
        });
      });
    });
  });

  describe('GET /user/:id/pledged', function () {
    it('should return pledged pathways', function (done) {
      var userId1 = new ObjectID('0123456789abcdef01234567');
      var userId2 = new ObjectID('deadbeefdeadbeefdeadbeef');
      var db = this.db;
      this.db.achievements.insert([{
        title: "My pledged",
        userId: userId1,
        created_at: 0
      },{
        title: "Not mine",
        userId: userId2,
        created_at: 0
      }], {safe: true}, function(err, docs){
        var server = api.createServer({db: db});
        var app = express();
        app.use(setUser({_id: userId1}));
        app.use(server);
        request(app)
          .get('/user/' + userId1 + '/pledged')
          .query({pageSize: 4})
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            res.body.length.should.equal(1); 
            res.body[0].title.should.equal("My pledged");
          })
          .end(done);
      });
    });
  });

  describe('POST /user/:id/pledged', function () {
    it('should pledge a clone of a pathway', function (done) {
      var userId = new ObjectID('0123456789abcdef01234567');
      var db = this.db;
      this.db.achievements.insert({
        title: "A pathway",
        userId: userId
      }, {safe: true}, function (err, achievements) {
        db.requirements.insert([{
          name: "a",
          pathwayId: achievements[0]._id
        },{
          name: "b",
          pathwayId: achievements[0]._id
        }], {safe: true}, function (err, requirements) {
          var server = api.createServer({db: db});
          var app = express();
          app.use(setUser({_id: userId}));
          app.use(server);
          request(app)
            .post('/user/' + userId + '/pledged')
            .send({cloneId: achievements[0]._id})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
              res.body.should.be.an.Object;
              var pathway = res.body;
              pathway.title.should.equal("A pathway");
              pathway.userId.should.equal(userId.toString());
              pathway._id.should.not.equal(achievements[0]._id.toString());
            })
            .end(done);
        });
      });
    });

    it('should make clone the newest achievement', function (done) {
      var server = api.createServer({db: this.db});
      var userId = new ObjectID('0123456789abcdef01234567');
      var app = express();
      app.use(setUser({_id: userId}));
      app.use(server);
      request(app)
        .get('/achievement')
        .query({pageSize: 8})
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);    
          var latest = res.body[0];
          request(app)
            .post('/user/' + userId.toString() + '/pledged')
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
      var userId = this.userId = '0123456789abcdef01234567';
      var db = this.db;
      db.achievements.insert({
        title: "A pathway",
        userId: userId
      }, {safe: true}, function (err, achievements) {
        var server = api.createServer({db: db});
        var app = express();
        app.use(setUser({_id: userId}));
        app.use(server);
        request(app)
          .get('/user/' + userId.toString() + '/pledged/' + achievements[0]._id)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            res.body.should.be.an.Object;
            res.body.title.should.equal("A pathway");
            res.body.userId.should.equal(userId.toString());
          })
          .end(done);
      });
    });
  });

  describe('PUT /user/:id/pledged/:pid', function () {
    it('should edit pledged pathway', function (done) {
      var db = this.db;
      var userId = this.userId = '0123456789abcdef01234567';
      db.achievements.insert({
        title: "Original",
        userId: userId
      }, {safe: true}, function (err, achievements) {
        var server = api.createServer({db: db});
        var app = express();
        app.use(setUser({_id: userId}));
        app.use(server);
        request(app)
          .put('/user/' + userId.toString() + '/pledged/' + achievements[0]._id)
          .send({title: "New", description: "Desc"})
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({})
          .end(function (err) {
            if (err) return done(err);
            request(server)
              .get('/user/' + userId.toString() + '/pledged/' + achievements[0]._id)
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

  describe('POST /note', function () {
    it('should create note', function (done) {
      var db = this.db;
      db.removeAll(function (err) {
        if (err) return done(err);
        request(api.createServer({db: db}))
          .post('/note')
          .send({title: 'new', body: 'note'})
          .expect(200)
          .expect(function (res) {
            res.body.should.have.property('_id');
            db.notes.find().toArray(function (err, notes) {
              if (err) return done(err);
              notes.length.should.equal(1);
              notes[0].title.should.equal('new');
            });
          })
          .end(done);
      });
    });
  });

  describe('GET /note/:id', function () {
    it('should retreive note', function (done) {
      var db = this.db;
      db.notes.insert({
        title: 'note', body: 'hi'
      }, {safe: true}, function (err, notes) {
        request(api.createServer({db: db}))
          .get('/note/' + notes[0]._id.toString())
          .expect(200)
          .expect(flatten(notes[0]))
          .end(done);
      });
    });
  });

  describe('PUT /note/:id', function () {
    it('should update note', function (done) {
      var db = this.db;
      db.removeAll(function (err) {
        if (err) return done(err);
        db.notes.insert({
          title: 'note', body: 'hi', x: 1, y: 1
        }, {safe: true}, function (err, notes) {
          var note = _.clone(notes[0]);
          delete note._id;
          request(api.createServer({db: db}))
            .put('/note/' + notes[0]._id.toString())
            .send(_.extend(note, {x: 2, y: 2}))
            .expect(200)
            .expect({})
            .expect(function () {
              db.notes.find().toArray(function (err, results) {
                if (err) return done(err);
                results.length.should.equal(1);
                results[0].should.eql(_.extend(notes[0], {x: 2, y: 2}));
              });
            })
            .end(done);
        });
      });
    });
  });

  describe('DELETE /note/:id', function () {
    it('should delete note', function (done) {
      var db = this.db;
      db.removeAll(function (err) {
        if (err) return done(err);
        db.notes.insert({
          title: 'note', body: 'note'
        }, {safe: true}, function (err, notes) {
          request(api.createServer({db: db}))
            .del('/note/' + notes[0]._id.toString())
            .expect(200)
            .expect(function () {
              db.notes.find().toArray(function (err, notes) {
                if (err) return done(err);
                notes.length.should.equal(0);
              });
            })
            .end(done);
        });
      });
    });
  });
});