var should = require('should');
var Backbone = require('backbone');
var _ = require('underscore');
var Achievements = require('../../clientapp/models/achievements');
var Achievement = require('../../clientapp/models/achievement');

describe('Achievements', function () {
  it('should accept options as first or second parameter', function () {
    (new Achievements([], {source: 'foo'})).source.should.equal('foo');
    (new Achievements({source: 'bar'})).source.should.equal('bar');
  });

  it('should have default pageSize', function (done) {
    Backbone.sync = function (method, model, options) {
      options.data.should.have.property('pageSize');
      done(); 
    };
    (new Achievements([])).fetch(); 
  });

  it('should pass parameters through on fetches', function (done) {
    var params = {
      pageSize: 16,
      type: Achievement.BADGE
    };
    Backbone.sync = function (method, model, options) {
      options.data.should.have.properties('pageSize', 'type');
      options.data.should.eql(params);
      done();
    };
    (new Achievements([], params)).fetch();
  });

  it('should override collection parameters with fetch options without clobbering', function (done) {
    Backbone.sync = function (method, model, options) {
      if (options.data.override) {
        options.data.pageSize.should.equal(16);
        c.fetch();
      }
      else {
        options.data.pageSize.should.equal(8);
        done();
      }
    };
    var c = new Achievements([], {pageSize: 8});
    c.fetch({data: {
      pageSize: 16,
      override: true
    }});
  });

  it('should add pages chronologically', function (done) {
    Backbone.sync = function (method, model, options) {
      options.data.should.have.property('after');
      options.data.after.should.equal(5);
      done();
    };
    var c = new Achievements([{created_at: 5}]);
    c.addPage();
  });

  it('should hit achievement endpoint when logged out', function () {
    window = {
      app: {
        currentUser: {
          loggedIn: false
        }
      }
    };
    var c = new Achievements([]);
    c.url().should.equal('/api/achievement');
  });

  it('should hit user source endpoints when logged in', function () {
    window = {
      app: {
        currentUser: {
          loggedIn: true,
          _id: 'a1'
        }
      }
    };
    var c = new Achievements([], {source: Achievements.BACKPACK});
    c.url().should.equal('/api/user/a1/earned');
  });
});
