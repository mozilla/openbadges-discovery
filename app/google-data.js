const GoogleClientLogin = require("googleclientlogin").GoogleClientLogin;
const GoogleSpreadsheets = require("google-spreadsheets");
const config = require('./lib/config');
const async = require('async');

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
          async.concat(spreadsheet.worksheets, function (worksheet, cb) {
            log('Worksheet %s row count: %d', worksheet.title, worksheet.rowCount);
            worksheet.rows({
              start: 1,
              num: worksheet.rowCount
            }, function(err, cells) {
              log('Fetched %d cells', cells.length);
              var achievements = cells.map(function (cell) {
                var imgSrc = (typeof cell.imagefile === 'string') ? cell.imagefile : '';
                imgSrc = imgSrc.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
                return {
                  type: 'badge',
                  title: (typeof cell.badgename === 'string') ? cell.badgename : "No title in " + cell.title,
                  description: typeof cell.description === 'string' ? cell.description : "No description in " + cell.title,
                  tags: (typeof cell.tags === 'string') ? cell.tags.split(/[, ]+/) : [],
                  creator: "A. Creator",
                  imgSrc: imgSrc
                };
              });
              cb(null, achievements);
            });
          }, function (err, achievements) {
            if (err) throw err;
            achievements.sort(function (a, b) {
              if ((a.imgSrc && b.imgSrc) || (!a.imgSrc && !b.imgSrc)) return 0;
              if (a.imgSrc) return -1;
              return 1;
            });
            var time = Date.now();
            achievements.forEach(function (achievement) {
              achievement.created_at = time--;
            });
            return cb({achievements: achievements});
          });
      });
  });
  googleAuth.login();
};