/* Taken from https://github.com/brian-gates/neo4j-stream-deserializer */
var util = require('util');
var JSONStream = require('JSONStream');
var Transform = require('stream').Transform;

util.inherits(Neo4jStreamDeserializer, Transform);

function simplify (node) {
  var data = node.data;
  var m = node.self && node.self.match(/\/([^\/]+)$/);
  if (m)
    data.id = parseInt(m[1]);
  return data;
}

function Neo4jStreamDeserializer () {
  Transform.call(this, {
    objectMode: true
  });
  var columns = [];
  var column_parse = JSONStream.parse("columns");
  var data_parse = JSONStream.parse("data.*");

  column_parse.on('data', function (c){
    this.emit('columns', c);
    columns = c;
  });
  data_parse.on('data', function (data){
    var result = {};
    columns.forEach(function (column, i) {
      if (typeof data[i] === 'object' && data[i].length)
        result[column] = Array.prototype.map.call(data[i], simplify);
      else
        result[column] = simplify(data[i]);
    });
    this.push(result);
  }.bind(this));

  this._transform = function(data, format, done){
    column_parse.write(data, format);
    data_parse.write(data, format);
    done();
  };
}

Neo4jStreamDeserializer.prototype.error = function (statusCode) {
  this._transform = function(data, format, done) {
    var obj = JSON.parse(data.toString());
    var err = new Error();
    Object.keys(obj).forEach(function (key) {
      err[key] = obj[key];
    });
    done(err);
  };
};

module.exports = Neo4jStreamDeserializer;