const GoogleClientLogin = require("googleclientlogin").GoogleClientLogin;
const GoogleSpreadsheets = require("google-spreadsheets");
const config = require('./lib/config');

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
          var rowCount = spreadsheet.worksheets[0].rowCount;
          log('Worksheet row count: %d', rowCount);
          spreadsheet.worksheets[0].rows({
            start: 1,
            num: rowCount
          }, function(err, cells) {
            log('Fetched %d cells', cells.length);
            var time = Date.now();
            var achievements = cells.map(function (cell) {
              return {
                created_at: time--,
                type: 'badge',
                title: typeof cell.badgename === 'string' ? cell.badgename : "No title in " + cell.title,
                description: typeof cell.description === 'string' ? cell.description : "No description in " + cell.title,
                tags: typeof cell.tags === 'string' ? cell.tags.split(/[, ]+/) : [],
                creator: "A. Creator"
              };
            });
            cb({achievements: achievements});
          });
      });
  });
  googleAuth.login();
};