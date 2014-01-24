const express = require('express');
const http = require('http');

var pathway = {
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
};

var app = express();

app.get('/pathway', function (req, res, next) {
  return res.json(pathway);
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
