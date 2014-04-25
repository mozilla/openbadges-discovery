const GoogleClientLogin = require("googleclientlogin").GoogleClientLogin;
const GoogleSpreadsheets = require("google-spreadsheets");
const config = require('./lib/config');
const async = require('async');
const _ = require('underscore');

function log () { if (config('DEV', false)) console.log.apply(null, arguments); }

var googleAuth = new GoogleClientLogin({
  email: config('GOOGLE_EMAIL'),
  password: config('GOOGLE_PASSWORD'),
  service: 'spreadsheets',
  accountType: GoogleClientLogin.accountTypes.google
});

module.exports = function load (cb) {
  googleAuth.on(GoogleClientLogin.events.login, function(){
    GoogleSpreadsheets({
      key: config('GOOGLE_KEY'),
      auth: googleAuth.getAuthId()
    }, function(err, spreadsheet) {
      if (err) throw err;
      processSpreadsheet(spreadsheet, cb);
    });
  });
  googleAuth.login();
};

function processSpreadsheet(spreadsheet, cb) {
  async.series([
    function (cb) {
      var worksheet = _.findWhere(spreadsheet.worksheets, {title: 'Pathways'});
      log('Worksheet %s row count: %d', worksheet.title, worksheet.rowCount);
      worksheet.rows({
        start: 1,
        num: worksheet.rowCount
      }, function (err, cells) {
        if (err) throw err;
        cb(null, processPathways(cells));
      });
    },
    function (cb) {
      async.map(spreadsheet.worksheets, function (worksheet, cb) {
        if (worksheet.title === 'Pathways') return cb(null, []);
        log('Worksheet %s row count: %d', worksheet.title, worksheet.rowCount);
        worksheet.rows({
          start: 1,
          num: worksheet.rowCount
        }, function(err, cells) {
          if (err) throw err;
          cb(null, processBadges(cells));
        });
      }, cb);
    }
  ], function (err, results) {
    if (err) throw err;
    var pathways = results[0];
    var badges = Array.prototype.concat.apply([], results[1]);
    badges.sort(function (a, b) {
      if ((a.imgSrc && b.imgSrc) || (!a.imgSrc && !b.imgSrc)) return 0;
      if (a.imgSrc) return -1;
      return 1;
    });
    var achievements = pathways.concat(badges);
    var requirements = badges.reduce(function (prev, curr, idx) {
      if (curr.pathwayName) {
        var pathway = _.findWhere(pathways, {title: curr.pathwayName});
        if (pathway) {
          prev.push({
            pathwayIdx: _.indexOf(pathways, pathway),
            badgeIdx: achievements.indexOf(curr)
          });
        }
      }
      return prev;
    }, []);
    var time = Date.now();
    achievements.forEach(function (achievement) {
      achievement.created_at = time--;
    });
    return cb({
      achievements: achievements,
      requirements: requirements
    });
  });
}

function value(val, def) {
  if (val && typeof val === 'string') {
    if (_.isArray(def)) val = val.split(/[, ]+/);
    return val;
  }
  return def;
}

function processBadges(cells) {
  log('Fetched %d cells', cells.length);
  var result = cells.map(function (cell) {
    var badge = {
      type: 'badge',
      title: value(cell.badgename, "No title in " + cell.title),
      description: value(cell.description, "No description in " + cell.title),
      tags: value(cell.tags, []),
      creator: "A. Creator",
      imgSrc: value(cell.imagefile, ''),
      pathwayName: value(cell.pathwayname, '')
    };
    badge.imgSrc = badge.imgSrc.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    return badge;
  });
  return result;
}

function processPathways(cells) {
  log('Fetched %d cells', cells.length);
  var result = cells.map(function (cell) {
    var pathway = {
      type: 'pathway',
      title: value(cell.name, "No title in " + cell.title),
      description: value(cell.description, ''),
      tags: value(cell.tags, []),
      creator: value(cell.creator, 'A. Creator'),
      imgSrc: value(cell.imagefile, ''),
      created_at: Date.now()
    };
    pathway.imgSrc = pathway.imgSrc.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    return pathway;
  });
  return result;
}