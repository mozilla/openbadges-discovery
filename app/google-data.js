const GoogleClientLogin = require("googleclientlogin").GoogleClientLogin;
const GoogleSpreadsheets = require("google-spreadsheets");
const config = require('./lib/config');
const async = require('async');
const _ = require('underscore');
const Fixture = require('./fixture-data');

var dataStore;

function log () { if (config('DEV', false)) console.log.apply(null, arguments); }

module.exports = function load (data, cb) {
  dataStore = data;

  var googleAuth = new GoogleClientLogin({
    email: config('GOOGLE_EMAIL'),
    password: config('GOOGLE_PASSWORD'),
    service: 'spreadsheets',
    accountType: GoogleClientLogin.accountTypes.google
  });

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
  var badgeSheets = [];
  var pathwaySheets = [];
  spreadsheet.worksheets.forEach(function(sheet) {
    if (sheet.title.match(/pathway/i)) pathwaySheets.push(sheet);
    else badgeSheets.push(sheet);
  });
  async.series([
    function (cb) {
      async.map(badgeSheets, function (worksheet, cb) {
        log('Processing badge worksheet %s', worksheet.title);
        worksheet.rows({
          start: 1,
          num: worksheet.rowCount
        }, function(err, cells) {
          if (err) throw err;
          processBadges(cells, cb);
        });
      }, function (err, results) {
        results = Array.prototype.concat.apply([], results);
        var time = Date.now();
        results.sort(function (a, b) {
          if ((a.imgSrc && b.imgSrc) || (!a.imgSrc && !b.imgSrc)) return 0;
          if (a.imgSrc) return -1;
          return 1;
        }).forEach(function (achievement) {
          achievement.created_at = time--;
        });
        dataStore.achievements.insert(results, function (err, docs) {
          if (err) throw err;
          log('Created %d badges', docs.length);
          cb();
        });
      });
    },
    function (cb) {
      async.map(pathwaySheets, function (worksheet, cb) {
        log('Processing pathway worksheet %s', worksheet.title);
        worksheet.rows({
          start: 1,
          num: worksheet.rowCount
        }, function (err, cells) {
          if (err) throw err;
          processPathway(cells, cb);
        });
      }, cb);
    }
  ], function (err, results) {
    if (err) throw err;

    cb(null, dataStore);
  });
}

function value(val, def) {
  if (val && typeof val === 'string') {
    if (_.isArray(def)) val = val.split(/, */);
    return val;
  }
  return def;
}

function processBadges(cells, cb) {
  log('Fetched %d cells', cells.length);
  var result = cells.filter(function (cell) {
    return cell.keeping;
  }).map(function (cell) {
    var badge = {
      type: 'badge',
      title: value(cell.badgename, "No title in " + cell.title),
      description: value(cell.description, "No description in " + cell.title),
      tags: value(cell.tags, []),
      creator: "A. Creator",
      imgSrc: value(cell.imagefile, ''),
      criteria: cell.criteria
    };
    badge.imgSrc = badge.imgSrc.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    return badge;
  });
  cb(null, result);
}

function processPathway(cells, cb) {
  log('Fetched %d cells', cells.length);
  var cell = cells.shift();
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
  dataStore.achievements.insert(pathway, function (err, doc) {
    if (err) throw err;
    var id = doc._id;
    log('Created pathway %s', id);
    async.map(cells, function (cell, cb) {
      dataStore.achievements.findOne({title: cell.badgename}, function (err, badge) {
        if (err) throw err;
        cell.x = parseInt(cell.x);
        cell.y = parseInt(cell.y);
        var rowY = parseInt(cell.title.match(/\d+/)[0] - 3);
        var requirement = {
          pathwayId: id,
          x: _.isNaN(cell.x) ? 1 : cell.x,
          y: _.isNaN(cell.y) ? rowY : cell.y,
          name: cell.badgename,
          core: !!cell.core,
          badgeId: badge._id
        };
        if (badge && badge.imgSrc) requirement.imgSrc = '/api/image/' + badge._id;
        cb(null, requirement);
      });
    }, function (err, results){
      dataStore.requirements.insert(results, function (err, docs) {
        if (err) throw err;
        log('Created %d requirements on pathway %s', docs.length, id);
        cb();
      });
    });
  });
}
