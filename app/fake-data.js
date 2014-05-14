const _ = require('underscore');

function randomType () {
  return Math.random() < 0.5 ? 'badge' : 'pathway';
}

function fakeAchievement (opts) {
  opts = opts || {};
  var type = opts.type || randomType();
  var data = {
    created_at: opts.created_at,
    type: type.toLowerCase(),
    title: 'A Very Long ' + type + ' Title ' + opts.created_at,
    description: "Authentic meh Marfa Thundercats roof party Brooklyn, scenester locavore ennui wayfarers typewriter 3 wolf moon gastropub. Hi.",
    tags: ['service', 'barista', 'coffeelover', 'fake'],
    creator: 'A. Creator'
  };
  return data;
}

function fakeRequirement(opts) {
  return {
    pathwayId: opts.pathwayId,
    x: Math.floor(Math.random()*3),
    y: opts.row,
    name: 'Some Badge ' + opts.row,
    core: (Math.random() < 0.5)
  };
}

module.exports = function initialize(data, cb) {
  cb = cb || function() {};

  var time = Date.now();
  var achievements = _.times(100, function() {
    return fakeAchievement({
      created_at: --time
    });
  });
  data.achievements.insert(achievements, function(err, achievements) {
    if (err) return cb(err);

    var requirements = Array.prototype.concat.apply([], achievements.map(function(achievement) {
      if (achievement.type !== 'pathway') return [];
      return _.times(5, function(i) {
        return fakeRequirement({
          pathwayId: achievement._id,
          row: i
        });
      });
    }));
    data.requirements.insert(requirements, function(err, requirements) {
      if (err) return cb(err);
      cb(null, data);
    });
  });
};
