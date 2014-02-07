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

app.use(function (req, res, next) {
  res.type('json');
  next();
});

app.get('/pathway/dummy', function (req, res, next) {
  return res.json({
    rows: [
      {
        cells: [
          {badge: false},
          {badge: true},
          {badge: true},
          {badge: false}
        ]
      },
      {
        cells: [
          {badge: true},
          {badge: false},
          {badge: false},
          {badge: false}
        ]
      },
      {
        cells: [
          {badge: false},
          {badge: false},
          {badge: true},
          {badge: false}
        ]
      },
      {
        cells: [
          {badge: false},
          {badge: false},
          {badge: false},
          {badge: false}
        ]
      }
    ]
  });
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
