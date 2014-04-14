var stream = require('stream');
var DisplayerAPI = require('displayer-api-client');

module.exports = function Backpack (url) {
  var self = this;
  var api = new DisplayerAPI(url);

  self.getBadgeStream = function (email) {
    var allBadgeStream = new stream.PassThrough({objectMode: true});

    var user = api.user(email);
    user.id(function success (id) {
      var openBadgeStreams = {};
      var moreGroups = true;
      var seen = [];

      function checkAllDone () {
        if (!moreGroups && Object.keys(openBadgeStreams).length === 0) {
          allBadgeStream.push(null);
        }
      }

      var groupStream = user.getGroupStream();
      groupStream.on('data', function (group) {
        var gId = group.groupId;
        var badgeStream = user.getBadgeStream(gId);
        openBadgeStreams[gId] = badgeStream;
        badgeStream.on('data', function (badge) {
          if (badge.assertion && badge.assertion.badge && badge.assertion.badge._location) {
            var badgeClass = badge.assertion.badge._location;
            if (seen.indexOf(badgeClass) === -1) {
              allBadgeStream.push(badge);
              seen.push(badgeClass);
            }
          }
        });
        badgeStream.on('end', function () {
          delete openBadgeStreams[gId];
          checkAllDone();
        });
        badgeStream.on('error', function (err) {
          allBadgeStream.emit('error', err);
        });
      });
      groupStream.on('end', function () {
        moreGroups = false;
        checkAllDone();
      });
      groupStream.on('error', function (err) {
        allBadgeStream.emit('error', err);
      });
    }, function error (err) {
      allBadgeStream.emit('error', err);
    });

    return allBadgeStream;
  };

  return self;
};
