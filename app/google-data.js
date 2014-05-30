const GoogleClientLogin = require("googleclientlogin").GoogleClientLogin;
const GoogleSpreadsheets = require("google-spreadsheets");
const config = require('./lib/config');
const async = require('async');
const _ = require('underscore');
const db = require('./lib/db');
const ObjectID = require('mongodb').ObjectID;

function log () { if (!config('QUIET', false)) console.log.apply(null, arguments); }

function load (dbName, cb) {
  var l = new Loader(dbName);
  l.load(cb);
}

function Loader (name) {
  var self = this;

  self.name = name;

  self.load = function (cb) {
    db.get(self.name, function (err, db) {
      if (err) throw err;
      self.dataStore = db;

      async.each(['achievements', 'notes', 'requirements'], function (name, cb) {
        self.dataStore[name].remove(cb);
      }, function (err) {
        if (err) throw err;

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
      });
    });
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
          self.dataStore.achievements.insert(results, function (err, docs) {
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
      self.dataStore.db.close();
      cb();
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
        creator: cell.creator || "A. Creator",
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
    self.dataStore.achievements.insert(pathway, function (err, docs) {
      if (err) throw err;
      var doc = docs[0];
      var id = new ObjectID(doc._id);
      log('Created pathway %s', id);
      async.map(cells, function (cell, cb) {
        cell.x = parseInt(cell.x);
        cell.y = parseInt(cell.y);
        var rowY = parseInt(cell.title.match(/\d+/)[0] - 3);
        if (cell.notetitle) {
          var note = {
            title: cell.notetitle,
            body: cell.notebody,
            x: _.isNaN(cell.x) ? 1 : cell.x,
            y: _.isNaN(cell.y) ? rowY : cell.y,
            pathwayId: id
          };
          return self.dataStore.notes.insert(note, function (err) {
            if (err) throw err;
            log('Created note', cell.notetitle);
            cb(null);
          });
        }
        else {
          self.dataStore.achievements.findOne({title: cell.badgename}, function (err, badge) {
            if (err) throw err;
            if (!badge) {
              log('Could not find badge', cell.badgename);
              return cb(null);
            }
            var requirement = {
              pathwayId: id,
              x: _.isNaN(cell.x) ? 1 : cell.x,
              y: _.isNaN(cell.y) ? rowY : cell.y,
              name: cell.badgename,
              core: !!cell.core,
              badgeId: new ObjectID(badge._id)
            };
            if (badge && badge.imgSrc) requirement.imgSrc = '/api/image/' + badge._id;
            cb(null, requirement);
          });
        }
      }, function (err, results){
        results = results.filter(function (result) { return !!result; });
        self.dataStore.requirements.insert(results, function (err, docs) {
          if (err) throw err;
          log('Created %d requirements on pathway %s', docs.length, id);
          cb();
        });
      });
    });
  }

  return self;
}

if (!module.parent) {
  load('app', function () {
    log('Done.'); 
  });
}
else {
  module.exports = load;
}
