const express = require('express');
const http = require('http');
const db = require('./lib/db');
const f = require('util').format;
const through = require('through');
const _ = require('underscore');

function stringify (key) {
  return through(function write (data) {
    this.emit('data', JSON.stringify(key ? data[key] : data));
  });
}

function arrayify () {
  return through(
    function write (data) {
      if (!this.start) {
        this.emit('data', '[');
        this.start = true;
      }
      else {
        this.emit('data', ',');
      }
      this.emit('data', data);
    }, 
    function end () {
      if (!this.start) {
        this.emit('data', '[');
      }
      this.emit('data', ']');
      this.emit('end');
    }
  );
}

var app = express();

app.use(express.bodyParser());
app.use(function (req, res, next) {
  res.type('json');
  next();
});

/*
app.get('/pathway/dummy/requirement', function (req, res, next) {
  var q = "MATCH (p:Pathway)-[:contains]->(r:Requirement)-[:references]->(b:BadgeClass)" +
    " WHERE p.name = 'Demo Pathway'" + // name isn't unique, so this won't really work long term
    " RETURN r, b";
  var t = through(function write (data) {
    var obj = data.r;
    obj.name = data.b.name;
    this.emit('data', obj);
  });
  return db.queryStream(q)
    .pipe(t)
    .pipe(stringify())
    .pipe(arrayify())
    .pipe(res);
});

app.get('/pathway', function (req, res, next) {
  return db.queryStream("MATCH (n:Pathway) RETURN n")
    .pipe(stringify('n'))
    .pipe(arrayify())
    .pipe(res);
});

app.get('/pathway/:id', function (req, res, next) {
  var id = req.params.id;
  return db.queryStream(f("START n=node(%s) RETURN n", id))
    .pipe(stringify('n'))
    .pipe(res);
});

app.get('/pathway/:id/requirement', function (req, res, next) {
  var id = req.params.id;
  var q = "START n=node(%s)" +
    " MATCH n-[:contains]->(r:Requirement)-[:references]->(b:BadgeClass)" +
    " RETURN r, b";
  var t = through(function write (data) {
    var obj = data.r;
    obj.name = data.b.name;
    this.emit('data', obj);
  });
  return db.queryStream(f(q, id))
    .pipe(t)
    .pipe(stringify())
    .pipe(arrayify())
    .pipe(res);
});

app.put('/pathway/:id/requirement/:rid', function (req, res, next) {
  var rid = req.params.rid;
  var data = req.body;
  var q = f("START n=node(%s)", rid);
  (['x', 'y']).forEach(function (key) {
    if (data.hasOwnProperty(key))
      q += f(" SET n.%s = {%s}", key, key);
  });
  q += " RETURN n";
  return db.queryStream(q, data)
    .pipe(stringify('n'))
    .pipe(res);
});
*/

const DataStore = require('nedb');
var fakeAchievements = new DataStore();
var fakeRequirements = new DataStore();

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

app.get('/achievement', function (req, res, next) {
  var after = parseInt(req.query.after || Date.now());
  var pageSize = parseInt(req.query.pageSize);

  console.log('looking for order lt %s', after);

  fakeAchievements.find({order: {$lt: after}}).sort({order: -1}).limit(pageSize).exec(function (err, docs) {
    if (err) throw err;
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
        console.log('Returning achievements...');
        return res.json(docs);
      });
    }
    else {
      console.log('Returning achievements...');
      return res.json(docs);
    }
  });
});

app.get('/badge/:id', function (req, res, next) {
  var id = req.params.id;
  fakeAchievements.findOne({_id: id}, function (err, doc) {
    if (err) throw err;
    if (doc) return res.json(doc);
    return res.send(404);
  });
});

app.get('/pathway/:id', function (req, res, next) {
  var id = req.params.id;
  fakeAchievements.findOne({_id: id}, function (err, doc) {
    if (err) throw err;
    if (doc) return res.json(doc);
    return res.send(404);
  });
});

app.get('/pathway/:pid/requirement', function (req, res, next) {
  var pid = req.params.pid;

  fakeRequirements.find({pathwayId: pid}, function (err, docs) {
    if (err) throw err;
    if (!docs.length) {
      console.log('Generating requirements...');
      docs = _.times(5, function (i) {
        return fakeRequirement({
          pathwayId: pid,
          row: i
        });
      });
      fakeRequirements.insert(docs);
    }
    console.log('Returning...');
    return res.json(docs);
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

app.get('/user/:uid/pledged/:pid', function (req, res, next) {
  var pid = req.params.pid;

  fakeAchievements.findOne({_id: pid}, function (err, doc) {
    if (err) throw err;
    return res.json(doc);
  });
});

app.put('/user/:uid/pledged/:pid', function (req, res, next) {
  var pid = req.params.pid;

  fakeAchievements.update({_id: pid}, {$set: req.body}, function (err, doc) {
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
