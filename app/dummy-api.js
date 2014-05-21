const express = require('express');
const http = require('http');
const config = require('./lib/config');
const _ = require('underscore');
const async = require('async');
const request = require('request');
const db = require('./dummy-db').singleton;
const fakeData = require('./fake-data');

function log () {
  if (config('DEV', false)) console.log.apply(null, arguments);
}

function createApp(opts) {
  opts = opts || {};

  var app = express();

  var generator = opts.dataGenerator || fakeData;
  var appData;
  var loading = false;
  function lazyLoad (req, res, next) {
    if (appData) return next();
    function wait() {
      if (!appData) return setTimeout(wait, 250);
      next();
    }
    if (loading) return wait();
    loading = true;
    return generator(db, function (err, dataStores) {
      appData = dataStores;
      loading = false;
      return next(err);
    });
  }
  app.use(lazyLoad);

  app.use(express.bodyParser());
  app.use(function (req, res, next) {
    res.type('json');
    next();
  });

  app.use(function (req, res, next) {
    if (req.session && req.session.user) req.userId = req.session.user._id;
    var pagination = req.pagination = {};
    if (!Number.isNaN(parseInt(req.query.pageSize))) pagination.pageSize = parseInt(req.query.pageSize);
    pagination.after = parseInt(req.query.after) || Date.now();
    next();
  });

  function addFavs (docs, uid, cb) {
    if (!_.isArray(docs)) docs = [docs];
    var itemIds = _.pluck(docs, '_id');
    return appData.favorites.find({userId: uid, itemId: {$in: itemIds}}, function (err, favs) {
      if (err) cb(err);
      docs.forEach(function (doc) {
        var entry = _.findWhere(favs, {itemId: doc._id});
        doc.favorite = entry ? entry.favorite : false;
      });
      return cb(null, docs.length === 1 ? docs[0] : docs);
    });
  }

  app.get('/achievement', function getAchievements(req, res, next) {
    var type = req.query.type;
    var tag = req.query.tag;

    var query = {
      created_at: {$lt: req.pagination.after}
    };
    if (type) query.type = type;
    if (tag) query.tags = tag;
    appData.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).exec(function (err, docs) {
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
    var id = req.params.id;
    appData.achievements.findOne({_id: id}, function (err, doc) {
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
    var id = req.params.id;

    if (!req.userId) res.send(403);

    var data = _.pick(req.body, 'favorite');
    appData.favorites.update({userId: req.userId, itemId: id}, {$set: data}, {upsert: true}, function (err) {
      if (err) throw err;
      return res.json({});
    });
  }

  app.post('/note', function (req, res, next) {
    var note = req.body;
    appData.notes.insert(note, function (err, doc) {
      if (err) throw err;
      return res.json({_id: doc._id});
    });
  });

  app.get('/note/:id', function (req, res, next) {
    var id = req.params.id;

    appData.notes.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      return res.json(doc);
    });
  });

  app.put('/note/:id', function (req, res, next) {
    var id = req.params.id;
    
    var note = req.body;
    appData.notes.update({_id: id}, {$set: note}, {upsert: true}, function (err, num, newDoc) {
      if (err) throw err;
      var changed = {};
      if (newDoc && newDoc._id !== id) changed._id = newDoc._id;
      return res.json(changed);
    });
  });

  app.delete('/note/:id', function (req, res, next) {
    var id = req.params.id;

    appData.notes.remove({_id: id}, function (err, num) {
      if (err) throw err;
      return res.send(200);
    });
  });

  app.get('/pathway/:id/requirement', function (req, res, next) {
    var id = req.params.id;

    appData.requirements.find({pathwayId: id}, function (err, docs) {
      if (err) throw err;
      return res.json(docs);
    });
  });

  app.post('/pathway/:pid/requirement', function (req, res, next) {
    var pid = req.params.pid;
    var requirement = req.body;
    requirement.pathwayId = pid;
    appData.requirements.insert(requirement, function (err, doc) {
      if (err) throw err;
      return res.json({_id: doc._id});
    });
  });

  app.put('/pathway/:pid/requirement/:rid', function (req, res, next) {
    var pid = req.params.pid;
    var rid = req.params.rid;

    var requirement = req.body;
    requirement.pathwayId = pid;
    if (requirement.hasOwnProperty('complete') && req.userId) {
      var entry = {userId: req.userId, itemId: requirement.badgeId};
      if (requirement.complete) appData.earned.update(entry, {$set: entry}, {upsert: true});
      else appData.earned.remove(entry);
    }
    appData.requirements.update({_id: rid}, {$set: req.body}, {upsert: true}, function (err, num, newDoc) {
      if (err) throw err;
      var changed = {};
      if (newDoc && newDoc._id !== rid) changed._id = newDoc._id;
      return res.json(changed);
    });
  });

  app.delete('/pathway/:pid/requirement/:rid', function (req, res, next) {
    var pid = req.params.pid;
    var rid = req.params.rid;

    appData.requirements.remove({_id: rid}, function (err, num) {
      if (err) throw err;
      return res.send(200);
    });
  });

  app.get('/pathway/:id/note', function (req, res, next) {
    var id = req.params.id;

    appData.notes.find({pathwayId: id}, function (err, docs) {
      if (err) throw err;
      return res.json(docs);
    });
  });

  app.get('/user/:uid/earned', function (req, res, next) {
    var uid = req.params.uid;
    appData.earned.find({userId: uid}, function (err, docs) {
      if (err) throw err;
      var ids = _.pluck(docs, 'itemId');
      var query = {
        _id: {$in: ids},
        created_at: {$lt: req.pagination.after}
      };
      appData.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).exec(function (err, docs) {
        return res.json(docs);
      });
    });
  });

  app.get('/user/:uid/favorite', function (req, res, next) {
    var uid = req.params.uid;
    var type = req.query.type;

    appData.favorites.find({userId: uid, favorite: true}, function (err, docs) {
      if (err) throw err;
      var ids = _.pluck(docs, 'itemId');
      var query = {
        _id: {$in: ids},
        created_at: {$lt: req.pagination.after}
      };
      if (type) query.type = type;
      appData.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).exec(function (err, docs) {
        docs = docs.map(function (doc) {
          doc.favorite = true;
          return doc;
        });
        return res.json(docs);
      });
    });
  });

  app.get('/user/:id/pledged', function (req, res, next) {
    var userId = req.params.id;

    var query = {
      userId: userId, 
      created_at: {
        $lt: req.pagination.after
      }
    };
    appData.achievements.find(query).sort({created_at: -1}).limit(req.pagination.pageSize).exec(function (err, docs) {
      if (err) throw err;
      return res.json(docs);
    });
  });

  app.post('/user/:id/pledged', function (req, res, next) {
    var cloneId = req.body.cloneId;
    var userId = req.params.id;

    appData.achievements.findOne({_id: cloneId}, function (err, base) {
      if (err) throw err;
      if (!base) res.send(404);
      delete base._id;
      base.userId = userId;
      base.created_at = Date.now();
      appData.achievements.insert(base, function (err, pledged) {
        if (err) throw err;
        appData.requirements.find({pathwayId: cloneId}, function (err, baseReqs) {
          if (err) throw err;
          var pledgedReqs = baseReqs.map(function(req) {
            delete req._id;
            req.pathwayId = pledged._id;
            return req;
          });
          appData.requirements.insert(pledgedReqs, function (err) {
            if (err) throw err;
            return res.json(pledged);
          });
        });
      });
    });
  });

  app.get('/user/:uid/pledged/:id', function (req, res, next) {
    var id = req.params.id;

    appData.achievements.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      return res.json(doc);
    });
  });

  app.put('/user/:uid/pledged/:id', function (req, res, next) {
    var id = req.params.id;

    appData.achievements.update({_id: id}, {$set: req.body}, function (err, doc) {
      if (err) throw err;
      return res.json({});
    });
  });

  app.get('/image/:id', function (req, res, next) {
    var id = req.params.id;
    appData.achievements.findOne({_id: id}, function (err, doc) {
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
    appData = undefined;
    lazyLoad(req, res, function (err) {
      if (err) return next(err); 
      res.redirect('/');
    });
  });

  app.all('*', function (req, res, next) {
    return res.send(404);
  });

  return app;
}

if (!module.parent) {
  const PORT = config('PORT', 3001);
  var app = createApp();
  app.listen(PORT, function(err) {
    if (err) {
      throw err;
    }

    log('Listening on port ' + PORT + '.');
  });
} else {
  module.exports.createServer = function(opts) {
    return http.createServer(createApp(opts));
  };
}
