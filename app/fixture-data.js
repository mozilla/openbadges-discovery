const async = require('async');
const DummyDB = require('./dummy-db');

module.exports = function Fixture(fixtures) {
  return function (data, cb) {
    if (typeof data === 'function') {
      cb = data;
    }
    data = new DummyDB();

    async.each(fixtures.achievements || [], function(achievement, cb) {
      data.achievements.insert(achievement, function (err, doc) {
        if (err) return cb(err);
        fixtures.achievements[fixtures.achievements.indexOf(achievement)] = doc;
        cb();
      });
    }, function (err) {
      if (err) throw err;

      async.each(fixtures.requirements || [], function (requirement, cb) {
        requirement.pathwayId = fixtures.achievements[requirement.pathwayIdx]._id;
        delete requirement.pathwayIdx;
        if (requirement.hasOwnProperty('badgeIdx')) {
          requirement.name = fixtures.achievements[requirement.badgeIdx].title;
          requirement.imgSrc = '/api/image/' + fixtures.achievements[requirement.badgeIdx]._id;
          requirement.badgeId = fixtures.achievements[requirement.badgeIdx]._id;
          delete requirement.badgeIdx;
        }
        data.requirements.insert(requirement, cb);
      }, function (err) {
        if (err) throw err;

        async.each(fixtures.favorites || [], function (favorite, cb) {
          favorite.itemId = fixtures.achievements[favorite.achievementIdx]._id;
          delete favorite.achievementIdx;
          data.favorites.insert(favorite, cb);
        }, function (err) {
          if (err) throw err;
          cb(null, data, fixtures);
        });
      });
    });
  };
};
