const express = require('express');
const http = require('http');
const config = require('./lib/config');
const _ = require('underscore');
const async = require('async');
const request = require('request');
const db = require('./lib/db');
const fakeData = require('./fake-data');
const ObjectID = require('mongodb').ObjectID;

function log () {
  if (config('DEV', false)) console.log.apply(null, arguments);
}

function createApp(opts) {
  opts = opts || {};
  var db = opts.db;

  var app = express();

  app.use(express.bodyParser());
  app.use(function (req, res, next) {
    res.type('json');
    next();
  });

  app.use(function (req, res, next) {
    if (req.session && req.session.user) req.userId = new ObjectID(req.session.user._id);
    var pagination = req.pagination = {};
    if (!Number.isNaN(parseInt(req.query.pageSize))) pagination.pageSize = parseInt(req.query.pageSize);
    pagination.after = parseInt(req.query.after) || Date.now();
    next();
  });

  app.use(function (req, res, next) {
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(function (key) {
        if (key.match(/^_id|.*Id$/))
          req.body[key] = new ObjectID(req.body[key]);
      });
      next();
    }
  });

  function addFavs (docs, uid, cb) {
    var single = false;
    if (!_.isArray(docs)) {
      docs = [docs];
      single = true;
    }
    var itemIds = _.pluck(docs, '_id');
    return db.favorites.find({userId: uid, itemId: {$in: itemIds}}).toArray(function (err, favs) {
      if (err) cb(err);
      favs = favs.map(function (fav) { fav.itemId = fav.itemId.toString(); return fav; });
      docs.forEach(function (doc) {
        var entry = _.findWhere(favs, {itemId: doc._id.toString()});
        doc.favorite = entry ? entry.favorite : false;
      });
      return cb(null, single ? docs[0] : docs);
    });
  }

  app.get('/achievement', function getAchievements(req, res, next) {
    var type = req.query.type;
    var tag = req.query.tag;
    var search = req.query.search;

    var query = {
      created_at: {$lt: req.pagination.after}
    };
    if (type) query.type = type;
    if (tag) query.tags = tag;
    if (search) {
      var pattern = new RegExp(search, 'i');
      query.$or = [
        {title: {$regex: pattern}},
        {description: {$regex: pattern}},
        {tags: search}
      ];
    }

    db.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).toArray(function (err, docs) {
      if (err) throw err;
      if (req.userId) {
        return addFavs(docs, req.userId, function (err, docs) {
          if (err) throw err;
          return res.json(docs);
        });
      }
      return res.json(docs);
    });
  });

  app.get('/badge/:id', getAchievement);
  app.get('/pathway/:id', getAchievement);
  app.get('/achievement/:id', getAchievement);
  function getAchievement(req, res, next) {
    var id = new ObjectID(req.params.id);
    db.achievements.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      if (doc) {
        if (req.userId) {
          return addFavs(doc, req.userId, function (err, doc) {
            if (err) throw err;
            return res.json(doc);
          });
        }
        return res.json(doc);
      }
      return res.send(404);
    });
  }

  app.patch('/badge/:id', setFavorite);
  app.patch('/pathway/:id', setFavorite);
  app.patch('/achievement/:id', setFavorite);
  function setFavorite(req, res, next) {
    var id = new ObjectID(req.params.id);

    if (!req.userId) res.send(403);

    var data = _.pick(req.body, 'favorite');
    db.favorites.update({userId: req.userId, itemId: id}, {$set: data}, {safe: true, upsert: true}, function (err) {
      if (err) throw err;
      return res.json({});
    });
  }

  app.post('/note', function (req, res, next) {
    var note = req.body;
    db.notes.insert(note, {safe:true}, function (err, docs) {
      if (err) throw err;
      var doc = docs[0];
      return res.json({_id: doc._id});
    });
  });

  app.get('/note/:id', function (req, res, next) {
    var id = new ObjectID(req.params.id);

    db.notes.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      return res.json(doc);
    });
  });

  app.put('/note/:id', function (req, res, next) {
    var id = new ObjectID(req.params.id);

    var note = req.body;
    delete note._id;
    db.notes.update({_id: id}, {$set: note}, {safe:true, upsert: true}, function (err, num, newDoc) {
      if (err) throw err;
      var changed = {};
      if (newDoc && newDoc._id !== id) changed._id = newDoc._id;
      return res.json(changed);
    });
  });

  app.delete('/note/:id', function (req, res, next) {
    var id = new ObjectID(req.params.id);

    db.notes.remove({_id: id}, function (err, num) {
      if (err) throw err;
      return res.send(200);
    });
  });

  app.get('/pathway/:id/requirement', function (req, res, next) {
    var id = new ObjectID(req.params.id);

    db.requirements.find({pathwayId: id}).toArray(function (err, requirements) {
      if (err) throw err;
      if (req.userId) {
        var ids = _.pluck(requirements, 'badgeId');
        var query = {
          userId: req.userId,
          itemId: {$in: ids}
        };
        db.earned.find(query).toArray(function (err, earned) {
          if (err) throw err;
          requirements.forEach(function (requirement) {
            var found = _.filter(earned, function(item){ return item.itemId.equals(requirement.badgeId); });
            if (found.length) {
              requirement.complete = true;
            }
          });
          return res.json(requirements);
        });
      }
      else {
        return res.json(requirements);
      }
    });
  });

  app.post('/pathway/:pid/requirement', function (req, res, next) {
    var pid = new ObjectID(req.params.pid);
    var requirement = req.body;
    requirement.pathwayId = pid;
    db.requirements.insert(requirement, function (err, docs) {
      if (err) throw err;
      var doc = docs[0];
      return res.json({_id: doc._id});
    });
  });

  app.put('/pathway/:pid/requirement/:rid', function (req, res, next) {
    var pid = new ObjectID(req.params.pid);
    var rid = new ObjectID(req.params.rid);

    var requirement = req.body;
    requirement.pathwayId = pid;
    delete requirement._id;
    if (requirement.hasOwnProperty('complete') && req.userId) {
      var entry = {userId: req.userId, itemId: requirement.badgeId};
      if (requirement.complete) db.earned.update(entry, {$set: entry}, {upsert: true, safe: false});
      else db.earned.remove(entry, {safe: false});
    }
    delete requirement.complete;
    db.requirements.update({_id: rid}, {$set: requirement}, {upsert: true}, function (err, num, newDoc) {
      if (err) throw err;
      var changed = {};
      if (newDoc && newDoc._id !== rid) changed._id = newDoc._id;
      return res.json(changed);
    });
  });

  app.delete('/pathway/:pid/requirement/:rid', function (req, res, next) {
    var rid = new ObjectID(req.params.rid);

    db.requirements.remove({_id: rid}, function (err, num) {
      if (err) throw err;
      return res.send(200);
    });
  });

  app.get('/pathway/:id/note', function (req, res, next) {
    var id = new ObjectID(req.params.id);

    db.notes.find({pathwayId: id}).toArray(function (err, docs) {
      if (err) throw err;
      return res.json(docs);
    });
  });

  app.get('/user/:uid/earned', function (req, res, next) {
    var uid = new ObjectID(req.params.uid);
    db.earned.find({userId: uid}).toArray(function (err, docs) {
      if (err) throw err;
      var ids = _.pluck(docs, 'itemId');
      var query = {
        _id: {$in: ids},
        created_at: {$lt: req.pagination.after}
      };
      db.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).toArray(function (err, docs) {
        return res.json(docs);
      });
    });
  });

  app.get('/user/:uid/favorite', function (req, res, next) {
    var uid = new ObjectID(req.params.uid);
    var type = req.query.type;

    db.favorites.find({userId: uid, favorite: true}).toArray(function (err, docs) {
      if (err) throw err;
      var ids = _.pluck(docs, 'itemId');
      var query = {
        _id: {$in: ids},
        created_at: {$lt: req.pagination.after}
      };
      if (type) query.type = type;
      db.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).toArray(function (err, docs) {
        docs = docs.map(function (doc) {
          doc.favorite = true;
          return doc;
        });
        return res.json(docs);
      });
    });
  });

  app.get('/user/:id/pledged', function (req, res, next) {
    var userId = new ObjectID(req.params.id);

    var query = {
      userId: userId,
      created_at: {
        $lt: req.pagination.after
      }
    };
    db.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).toArray(function (err, docs) {
      if (err) throw err;
      return res.json(docs);
    });
  });

  app.post('/user/:id/pledged', function (req, res, next) {
    var cloneId = new ObjectID(req.body.cloneId);
    var userId = new ObjectID(req.params.id);

    db.achievements.findOne({_id: cloneId}, function (err, base) {
      if (err) throw err;
      if (!base) res.send(404);
      delete base._id;
      base.userId = userId;
      base.created_at = Date.now();
      base.tags = _.without(base.tags, 'Featured'); // Hacky fix for https://github.com/mozilla/openbadges-discovery/issues/395
      db.achievements.insert(base, function (err, pledged) {
        if (err) throw err;
        pledged = pledged[0];
        async.parallel([
          function (cb) {
            db.requirements.find({pathwayId: cloneId}).toArray(function (err, baseReqs) {
              if (err) throw err;
              if (baseReqs.length) {
                var pledgedReqs = baseReqs.map(function(req) {
                  delete req._id;
                  req.pathwayId = pledged._id;
                  return req;
                });
                db.requirements.insert(pledgedReqs, {safe: true}, cb);
              }
              else {
                cb(null);
              }
            });
          },
          function (cb) {
            db.notes.find({pathwayId: cloneId}).toArray(function (err, baseNotes) {
              if (err) throw err;
              if (baseNotes.length) {
                var pledgedNotes = baseNotes.map(function(note) {
                  delete note._id;
                  note.pathwayId = pledged._id;
                  return note;
                });
                db.notes.insert(pledgedNotes, {safe: true}, cb);
              }
              else {
                return cb(null);
              }
            });
          }
        ], function (err) {
          if (err) throw err;
          return res.json(pledged);
        });
      });
    });
  });

  app.get('/user/:uid/pledged/:id', function (req, res, next) {
    var id = new ObjectID(req.params.id);

    db.achievements.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      return res.json(doc);
    });
  });

  app.put('/user/:uid/pledged/:id', function (req, res, next) {
    var id = new ObjectID(req.params.id);

    var pledged = req.body;
    delete pledged._id;
    db.achievements.update({_id: id}, {$set: pledged}, function (err, doc) {
      if (err) throw err;
      return res.json({});
    });
  });

  app.get('/user/:uid/stats', function (req, res, next) {
    var id = new ObjectID(req.params.uid);

    async.parallel({
      earned: db.earned.count.bind(db.earned, {userId: id}),
      favorited: db.favorites.count.bind(db.favorites, {userId: id}),
      pledged: db.achievements.count.bind(db.achievements, {userId: id})
    }, function (err, results) {
      if (err) throw err;
      return res.json(results);
    });
  });

  app.get('/image/:id', function (req, res, next) {
    var id = new ObjectID(req.params.id);
    db.achievements.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      if (!doc || !doc.imgSrc) return res.send(400);
      res.header('Cache-Control', 'public, max-age=86400');
      var old = res.setHeader;
      res.setHeader = function (header, val) {
        if (header.toLowerCase() !== 'cache-control') old.apply(res, arguments);
      };
      return request(doc.imgSrc).pipe(res);
    });
  });

  app.get('/refresh', function (req, res, next) {
    res.send(418);
  });

  app.all('*', function (req, res, next) {
    return res.send(404);
  });

  return app;
}

if (!module.parent) {
  const PORT = config('PORT', 3001);
  db.get('app', function (err, db) {
    if (err) throw err;
    var app = createApp({db: db});
    app.listen(PORT, function(err) {
      if (err) {
        throw err;
      }

      log('Listening on port ' + PORT + '.');
    });
  });
} else {
  module.exports.createServer = function(opts) {
    return http.createServer(createApp(opts));
  };
}
