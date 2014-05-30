var async = require('async');
var MongoClient = require('mongodb').MongoClient;

if (!global.hasOwnProperty('db')) {
  global.db = {};
}

function Database(db) {
  var self = this;
  self.db = db;

  var collections = [ 
    'achievements', 
    'requirements', 
    'favorites', 
    'users', 
    'earned',
    'notes'
  ];
  collections.forEach(function (name) {
    self[name] = db.collection(name); 
  });

  self.removeAll = function (cb) {
    async.each(collections, function (name, cb) {
      self[name].remove(cb);
    }, cb);
  };

  return self;
}

function get(name, cb) {
  if (!global.db[name]) {
    global.db[name] = 'connecting';
    MongoClient.connect('mongodb://127.0.0.1:27017/' + name, function (err, db) {
      if (err) global.db[name] = undefined;
      else global.db[name] = new Database(db);
      cb(err, global.db[name]);
    });
  }
  else if (global.db[name] === 'connecting') {
    setTimeout(getDb.bind(null, name, cb), 0);
  }
  else {
    cb(null, global.db[name]);
  }
}

function closeAll() {
  Object.keys(global.db).forEach(function (key) {
    global.db[key].db.close();
    global.db[key] = undefined;
  });
}

module.exports = {
  get: get,
  closeAll: closeAll
};
