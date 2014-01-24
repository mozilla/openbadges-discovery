const express = require('express');
const clientApp = require('../clientapp');
const api = require('./api');
const config = require('./lib/config');
const nunjucks = require('nunjucks');
const persona = require('express-persona');
const path = require('path');
const http = require('http');
const middleware = require('./middleware');

const DEV_MODE = config('DEV', false);
const PORT = config('PORT', 3000);
const PERSONA_AUDIENCE = config('URL', 'http://localhost:' + PORT);

var app = express();

require('express-monkey-patch')(app);

var staticDir = path.join(__dirname, '/static');
var staticRoot = '/static';

app.use(function (req, res, next) {
  res.locals.static = function static (staticPath) {
    return path.join(app.mountPoint, staticRoot, staticPath);
  };
  next();
});

app.use(express.compress());
app.use(express.bodyParser());
app.use(middleware.session());
app.use(middleware.csrf({ whitelist: [] }));

app.use(staticRoot, express.static(staticDir, {maxAge: DEV_MODE ? 0 : 86400000}));

app.use('/api', api);

persona(app, {
  audience: PERSONA_AUDIENCE
});

var cApp = clientApp(app, {
  developmentMode: config('DEV', false)
});
var clientConfig = middleware.clientConfig(function (req, res) {
  return {
    csrf: req.session._csrf,
    loggedInUser: req.session.email
  };
});
app.get('*', clientConfig, cApp.html());

if (!module.parent) {
  app.listen(PORT, function(err) {
    if (err) {
      throw err;
    }

    console.log('Persona audience is ' + PERSONA_AUDIENCE + '.');
    console.log('Listening on port ' + PORT + '.');
  });
} else {
  module.exports = http.createServer(app);
}
