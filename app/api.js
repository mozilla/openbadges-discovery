const express = require('express');
const http = require('http');
const db = require('./lib/db');
const f = require('util').format;
const through = require('through');

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

app.put('/pathway/dummy/requirement/:rid', function (req, res, next) {
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
  ['x', 'y'].forEach(function (key) {
    if (data[key])
      q += f(" SET n.%s = {%s}", key, key);
  });
  q += " RETURN n";
  return db.queryStream(q, data)
    .pipe(stringify('n'))
    .pipe(res);
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
