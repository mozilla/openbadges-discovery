require('should');
var path = require('path');
var jsdom = require('jsdom');

describe('layout view', function () {

  before(function () {
    this.app = require('../../clientapp/')(undefined, {
      developmentMode: true,
      main: path.join(__dirname, 'main.js'),
      quiet: true
    });
  });

  beforeEach(function (done) {
    var self = this;
    this.app.sourceCode(function (err, src) {
      if (err) return done(err);
      jsdom.env({
        html: '<html><head></head><body></body></html>',
        src: [src],
        done: function (err, window) {
          if (err) return done(new Error(err.message));
          self.window = window;
          done();
        }
      });
    });
  });

  it('should maintain .loggedIn class on .js-user-controls based on user state', function () {
    var state = new this.window.models.appState({});
    var layout = new this.window.views.layout({
      model: state
    });
    layout.render();
    layout.$('.js-user-controls').length.should.equal(1);
    layout.$('.js-user-controls.loggedIn').length.should.equal(0);
    state.currentUser.login({email: 'meh', id: 123});
    layout.$('.js-user-controls.loggedIn').length.should.equal(1);
  });

  it('should maintain email as text of .js-user-email', function () {
    var state = new this.window.models.appState({});
    var layout = new this.window.views.layout({
      model: state
    });
    layout.render();
    layout.$('.js-user-email').text().should.equal('');
    state.currentUser.login({email: 'meh', id: 123});
    layout.$('.js-user-email').text().should.equal('meh');
    state.currentUser.login({email: 'buh', id: 123});
    layout.$('.js-user-email').text().should.equal('buh');
  });
});
