const db = require('../lib/db');

module.exports = {
  getOrCreate: function (params, cb) {
    var cypher = "MERGE (n:User {email: {email}}) RETURN n";
    return db.query(cypher, params, function (err, results) {
      if (err) return cb(err);
      cb(null, results[0].n);
    });
  }
};