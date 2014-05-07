const express = require('express');
const http = require('http');
const config = require('./lib/config');
const _ = require('underscore');
const async = require('async');
const request = require('request');
const fakeData = require('./fake-data');

function log () {
  if (config('DEV', false)) console.log.apply(null, arguments);
}

function createApp(opts) {
  opts = opts || {};

  var app = express();

  var generator = opts.dataGenerator || fakeData;
  var appData;
  app.use(function (req, res, next) {
    if (appData) return next();
    return generator(function (err, dataStores) {
      appData = dataStores;
      return next(err);
    });
  });

  app.use(express.bodyParser());
  app.use(function (req, res, next) {
    res.type('json');
    next();
  });

  function addFavs (docs, uid, cb) {
    if (!_.isArray(docs)) docs = [docs];
    var itemIds = _.pluck(docs, '_id');
    return appData.favorites.find({userId: uid, itemId: {$in: itemIds}}, function (err, favs) {
      if (err) cb(err);
      docs.forEach(function (doc) {
        doc.favorite = !!_.findWhere(favs, {itemId: doc._id});
      });
      return cb(null, docs.length === 1 ? docs[0] : docs);
    });
  }

  app.get('/achievement', function getAchievements(req, res, next) {
    var after = parseInt(req.query.after || Date.now());
    var pageSize = parseInt(req.query.pageSize);
    var uid = req.session && req.session.user && req.session.user.id;

    appData.achievements.find({created_at: {$lt: after}}).sort({created_at: -1}).limit(pageSize).exec(function (err, docs) {
      if (err) throw err;
      if (uid) {
        return addFavs(docs, uid, function (err, docs) {
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
    var uid = req.session && req.session.user && req.session.user.id;
    appData.achievements.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      if (doc) {
        if (uid) {
          return addFavs(doc, uid, function (err, doc) {
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
    var uid = req.session && req.session.user && req.session.user.id;
    var id = req.params.id;

    if (!uid) res.send(403);

    var data = _.pick(req.body, 'favorite');
    appData.favorites.update({userId: uid, itemId: id}, {$set: data}, {upsert: true}, function (err) {
      if (err) throw err;
      return res.json({});
    });
  }

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

    appData.requirements.update({_id: rid}, {$set: req.body}, {}, function (err) {
      if (err) throw err;
      return res.json({});
    });
  });

  app.get('/user/:uid/earned', function (req, res, next) {
    return res.json([]);
  });

  app.get('/user/:uid/favorite', function (req, res, next) {
    var uid = parseInt(req.params.uid);
    var type = req.query.type;

    appData.favorites.find({userId: uid}, function (err, docs) {
      if (err) throw err;
      var ids = _.pluck(docs, 'itemId');
      var query = {_id: {$in: ids}};
      if (type) query.type = type;
      appData.achievements.find(query, function (err, docs) {
        docs = docs.map(function (doc) {
          doc.favorite = true;
          return doc;
        });
        return res.json(docs);
      });
    });
  });

  app.get('/user/:id/pledged', function (req, res, next) {
    var userId = parseInt(req.params.id);

    appData.achievements.find({userId: userId}, function (err, docs) {
      if (err) throw err;
      return res.json(docs);
    });
  });

  app.post('/user/:id/pledged', function (req, res, next) {
    var cloneId = req.body.cloneId;
    var userId = parseInt(req.params.id);

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
      res.type('png');
      return request(doc.imgSrc).pipe(res);
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
