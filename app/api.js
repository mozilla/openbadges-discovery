const express = require('express');
const http = require('http');
const db = require('./lib/db');
const f = require('util').format;
const through = require('through');

var app = express();

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
  var t = through(function write (data) {
    if (!this.start) {
      this.emit('data', '[');
      this.start = true;
    }
    else {
      this.emit('data', ',');
    }
    this.emit('data', JSON.stringify(data.n));
  }, function end () {
    if (!this.start) {
      this.emit('data', '[');
    }
    this.emit('data', ']');
    this.emit('end');
  });
  res.type('json');
  return db.queryStream("MATCH (n:Pathway) RETURN n").pipe(t).pipe(res);
});

app.get('/pathway/:id', function (req, res, next) {
  var id = req.params.id;
  var t = through(function write (data) {
    this.emit('data', JSON.stringify(data.n));
  });
  res.type('json');
  return db.queryStream(f("START n=node(%s) RETURN n", id)).pipe(t).pipe(res);
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
