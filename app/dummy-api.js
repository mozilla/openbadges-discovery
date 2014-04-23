const express = require('express');
const http = require('http');
const config = require('./lib/config');
const _ = require('underscore');
const DataStore = require('nedb');
const async = require('async');

function log () {
  if (config('DEV', false)) console.log.apply(null, arguments);
}

function createApp (fixtures, cb) {
  var app = express();

  app.use(express.bodyParser());
  app.use(function (req, res, next) {
    res.type('json');
    next();
  });

  var fakeAchievements = new DataStore();
  var fakeRequirements = new DataStore();
  var fakeFavs = new DataStore();

  app.fixtures = fixtures = fixtures || {};
  cb = cb || function () {};
  async.each(fixtures.achievements || [], function(achievement, cb) {
    fakeAchievements.insert(achievement, function (err, doc) {
      if (err) return cb(err);
      fixtures.achievements[fixtures.achievements.indexOf(achievement)] = doc;
      cb();
    });
  }, function (err) {
    if (err) throw err;

    async.each(fixtures.requirements || [], function (requirement, cb) {
      fakeRequirements.insert(requirement, cb);
    }, function (err) {
      if (err) throw err;

      async.each(fixtures.favorites || [], function (favorite, cb) {
        favorite.itemId = fixtures.achievements[favorite.achievementIdx]._id;
        delete favorite.achievementIdx;
        fakeFavs.insert(favorite, cb);
      }, function (err) {
        if (err) throw err;
        cb(fixtures);
      });
    });
  });
    
  function randomType () {
    return Math.random() < 0.5 ? 'badge' : 'pathway';
  }

  function fakeAchievement (opts) {
    opts = opts || {};
    var type = opts.type || randomType();
    var data = {
      created_at: opts.created_at,
      type: type.toLowerCase(),
      title: 'A Very Long ' + type + ' Title ' + opts.created_at,
      description: "Authentic meh Marfa Thundercats roof party Brooklyn, scenester locavore ennui wayfarers typewriter 3 wolf moon gastropub. Hi.",
      tags: ['service', 'barista', 'coffeelover', 'fake'],
      creator: 'A. Creator'
    };
    return data;
  }

  function fakeRequirement(opts) {
    return {
      pathwayId: opts.pathwayId,
      x: Math.floor(Math.random()*3),
      y: opts.row,
      name: 'Some Badge ' + opts.row,
      core: (Math.random() < 0.5)
    };
  }

  function addFavs (docs, uid, cb) {
    if (!_.isArray(docs)) docs = [docs];
    var itemIds = _.pluck(docs, '_id');
    return fakeFavs.find({userId: uid, itemId: {$in: itemIds}}, function (err, favs) {
      if (err) cb(err);
      docs.forEach(function (doc) {
        doc.favorite = !!_.findWhere(favs, {itemId: doc._id});
      });
      return cb(null, docs.length === 1 ? docs[0] : docs);
    });
  }

  app.get('/achievement', function generateData(req, res, next) {
    var after = parseInt(req.query.after || Date.now());
    var pageSize = parseInt(req.query.pageSize);

    if (!pageSize) return res.send(400);

    log('looking for created_at lt %s', after);

    fakeAchievements.find({created_at: {$lt: after}}).sort({created_at: -1}).limit(pageSize).exec(function (err, docs) {
      if (docs.length !== pageSize) {
        var fill = pageSize - docs.length;
        log('Generating %d achievements...', fill);
        docs = docs.concat(_.times(fill, function () {
          return fakeAchievement({
            created_at: --after
          });
        }));
        fakeAchievements.insert(docs, function (err, docs) {
          if (err) throw err;
          log('Inserted %d achievements...', docs.length);
          next();
        });
      }
      else next();
    });
  });

  app.get('/achievement', function getAchievements(req, res, next) {
    var after = parseInt(req.query.after || Date.now());
    var pageSize = parseInt(req.query.pageSize);
    var uid = req.session && req.session.user && req.session.user.id;

    fakeAchievements.find({created_at: {$lt: after}}).sort({created_at: -1}).limit(pageSize).exec(function (err, docs) {
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
    fakeAchievements.findOne({_id: id}, function (err, doc) {
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
    fakeFavs.update({userId: uid, itemId: id}, {$set: data}, {upsert: true}, function (err) {
      if (err) throw err;
      return res.json({});
    });
  }

  app.get('/pathway/:id/requirement', function (req, res, next) {
    var id = req.params.id;

    fakeRequirements.find({pathwayId: id}, function (err, docs) {
      if (err) throw err;
      if (!docs.length) {
        log('Generating requirements...');
        docs = _.times(5, function (i) {
          return fakeRequirement({
            pathwayId: id,
            row: i
          });
        });
        fakeRequirements.insert(docs, function (err, docs) {
          if (err) throw err;
          log('Returning...');
          return res.json(docs);
        });
      }
      else {
        log('Returning...');
        return res.json(docs);
      }
    });
  });

  app.post('/pathway/:pid/requirement', function (req, res, next) {
    var pid = req.params.pid;
    var requirement = req.body;
    requirement.pathwayId = pid;
    fakeRequirements.insert(requirement, function (err, doc) {
      if (err) throw err;
      return res.json({_id: doc._id});
    });
  });

  app.put('/pathway/:pid/requirement/:rid', function (req, res, next) {
    var pid = req.params.pid;
    var rid = req.params.rid;

    fakeRequirements.update({_id: rid}, {$set: req.body}, {}, function (err) {
      if (err) throw err;
      return res.json({});
    });
  });

  app.get('/user/:uid/earned', function (req, res, next) {
    return res.json([]);
  });

  app.get('/user/:uid/favorite', function (req, res, next) {
    var uid = parseInt(req.params.uid);

    fakeFavs.find({userId: uid}, function (err, docs) {
      if (err) throw err;
      var ids = _.pluck(docs, 'itemId');
      fakeAchievements.find({_id: {$in: ids}}, function (err, docs) {
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

    fakeAchievements.find({userId: userId}, function (err, docs) {
      if (err) throw err;
      return res.json(docs);
    });
  });

  app.post('/user/:id/pledged', function (req, res, next) {
    var cloneId = req.body.cloneId;
    var userId = parseInt(req.params.id);

    fakeAchievements.findOne({_id: cloneId}, function (err, base) {
      if (err) throw err;
      if (!base) res.send(404);
      delete base._id;
      base.userId = userId;
      base.created_at = Date.now();
      fakeAchievements.insert(base, function (err, pledged) {
        if (err) throw err;
        fakeRequirements.find({pathwayId: cloneId}, function (err, baseReqs) {
          if (err) throw err;
          var pledgedReqs = baseReqs.map(function(req) {
            delete req._id;
            req.pathwayId = pledged._id;
            return req;
          });
          fakeRequirements.insert(pledgedReqs, function (err) {
            if (err) throw err;
            return res.json(pledged);
          });
        });
      });
    });
  });

  app.get('/user/:uid/pledged/:id', function (req, res, next) {
    var id = req.params.id;

    fakeAchievements.findOne({_id: id}, function (err, doc) {
      if (err) throw err;
      return res.json(doc);
    });
  });

  app.put('/user/:uid/pledged/:id', function (req, res, next) {
    var id = req.params.id;

    fakeAchievements.update({_id: id}, {$set: req.body}, function (err, doc) {
      if (err) throw err;
      return res.json({});
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
  module.exports.createServer = function createServer (fixtures, cb) {
    var app = createApp(fixtures, cb);
    var server = http.createServer(app);
    server.fixtures = app.fixtures;
    return server;
  };
}
