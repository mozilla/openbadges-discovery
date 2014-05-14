const DataStore = require('nedb');

module.exports = function () {
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

