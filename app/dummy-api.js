const express = require('express');
const http = require('http');
const _ = require('underscore');

var app = express();

app.use(express.bodyParser());
app.use(function (req, res, next) {
  res.type('json');
  next();
});

const DataStore = require('nedb');
var fakeAchievements = new DataStore();
var fakeRequirements = new DataStore();
var fakeFavs = new DataStore();

var ORDER = Date.now();

function randomType () {
  //return Math.random() < 0.5 ? Achievement.BADGE : Achievement.PATHWAY;
  return Math.random() < 0.5 ? 'badge' : 'pathway';
}

function fakeAchievement (opts) {
  opts = opts || {};
  var type = opts.type || randomType();
  var data = {
    order: opts.order,
    type: type.toLowerCase(),
    title: 'A Very Long ' + type + ' Title ' + opts.order,
    description: "Authentic meh Marfa Thundercats roof party Brooklyn, scenester locavore ennui wayfarers typewriter 3 wolf moon gastropub. Hi.",
    tags: ['service', 'barista', 'coffeelover', 'fake'],
    creator: 'Starbucks'
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

app.get('/achievement', function generateData(req, res, next) {
  var after = parseInt(req.query.after || Date.now());
  var pageSize = parseInt(req.query.pageSize);

  console.log('looking for order lt %s', after);

  fakeAchievements.find({order: {$lt: after}}).sort({order: -1}).limit(pageSize).exec(function (err, docs) {
    if (docs.length !== pageSize) {
      var fill = pageSize - docs.length;
      console.log('Generating %d achievements...', fill);
      docs = docs.concat(_.times(fill, function () {
        return fakeAchievement({
          order: ORDER--
        });
      }));
      fakeAchievements.insert(docs, function (err, docs) {
        if (err) throw err;
        console.log('Inserted %d achievements...', docs.length);
        next();
      });
    }
    else next();
  });
});

function addFavs (docs, uid, cb) {
  if (!_.isArray(docs)) docs = [docs];
  var itemIds = _.pluck(docs, '_id');
  return fakeFavs.find({userId: uid, itemId: {$in: itemIds}}, function (err, favs) {
    if (err) cb(err);
    favs.forEach(function (fav) {
      var doc = _.findWhere(docs, {_id: fav.itemId}).favorite = fav.favorite;
    });
    return cb(null, docs.length === 1 ? docs[0] : docs);
  });
}

app.get('/achievement', function handle(req, res, next) {
  var after = parseInt(req.query.after || Date.now());
  var pageSize = parseInt(req.query.pageSize);
  var uid = req.session.user && req.session.user.id;

  fakeAchievements.find({order: {$lt: after}}).sort({order: -1}).limit(pageSize).exec(function (err, docs) {
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

app.get('/badge/:id', function (req, res, next) {
  var id = req.params.id;
  var uid = req.session.user && req.session.user.id;
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
});

app.patch('/badge/:id', function (req, res, next) {
  var uid = req.session.user && req.session.user.id;
  var id = req.params.id;

  fakeFavs.update({userId: uid, itemId: id}, {$set: req.body}, {upsert: true}, function (err) {
    if (err) throw err;
    return res.json({});
  });
});

app.get('/pathway/:id', function (req, res, next) {
  var id = req.params.id;
  var uid = req.session.user && req.session.user.id;
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
});

app.patch('/pathway/:id', function (req, res, next) {
  var uid = req.session.user && req.session.user.id;
  var id = req.params.id;

  fakeFavs.update({userId: uid, itemId: id}, {$set: req.body}, {upsert: true}, function (err, num, up) {
    if (err) throw err;
    return res.json({});
  });
});

app.get('/pathway/:id/requirement', function (req, res, next) {
  var id = req.params.id;

  fakeRequirements.find({pathwayId: id}, function (err, docs) {
    if (err) throw err;
    if (!docs.length) {
      console.log('Generating requirements...');
      docs = _.times(5, function (i) {
        return fakeRequirement({
          pathwayId: id,
          row: i
        });
      });
      fakeRequirements.insert(docs);
    }
    console.log('Returning...');
    return res.json(docs);
  });
});

app.post('/pathway/:pid/requirement', function (req, res, next) {
  var pid = req.params.pid;
  var requirement = req.body;
  requirement.pathwayId = pid;
  fakeRequirements.insert(req.body, function (err, doc) {
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
    delete base._id;
    base.userId = userId;
    base.order = Date.now();
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

if (!module.parent) {
  const config = require('./lib/config');
  const PORT = config('PORT', 3001);
  app.listen(PORT, function(err) {
    if (err) {
      throw err;
    }

    console.log('Listening on port ' + PORT + '.');
  });
} else {
  module.exports = http.createServer(app);
}
