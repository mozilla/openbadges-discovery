var url = require('url');
var config = require('./config');
var request = require('request');
var _ = require('underscore');
var Neo4jStreamDeserializer = require('./neo4j-stream-deserializer');

var BASE = config('NEO4J_URL', 'http://localhost:7474');

module.exports = {
  query: function run (query, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = {};
    }

    var r = module.exports.queryStream(query, params);
    var results = [];
    r.on('error', function (err) {
      return cb(err);
    });
    r.on('data', function(row) {
      results.push(row);
    });
    r.on('end', function() {
      cb(null, results);
    });
  },

  deleteAll: function (cb) {
    return request({
      uri: url.resolve(BASE, '/db/data/transaction/commit'),
      method: 'POST',
      json: {
        statements: [
          {statement: "MATCH n-[r]->() DELETE n,r"},
          {statement: "MATCH n DELETE n"}
        ]
      },
      //qs: { includeStats: true }
    }, function (err, response, body) {
      if (err) return cb(err);
      if (body && body.errors.length) return cb(new Error('Delete statements returned errors'));
      if (response.statusCode !== 200) return cb(new Error('Status code ' + response.statusCode));
      cb();
    });
  },

  queryStream: function (query, params) {
    params = params || {};

    var r = request({
      uri: url.resolve(BASE, '/db/data/cypher'),
      headers: {
        'X-Stream': true
      },
      method: 'POST',
      json: {
        query : query,
        params: params
      }
      //qs: { includeStats: true }
    });
    var d = new Neo4jStreamDeserializer();
    r.on('response', function (response) {
      if (response.statusCode !== 200) d.error(response.statusCode);
    });
    return r.pipe(d);
  }
};
