const DataStore = require('nedb');

var DummyDB = module.exports = function () {
  var db = {};
  [ 
    'achievements', 
    'requirements', 
    'favorites', 
    'users', 
    'earned'
  ].forEach(function (name) {
    db[name] = new DataStore();
  });
  return db;
};

module.exports.singleton = DummyDB();
