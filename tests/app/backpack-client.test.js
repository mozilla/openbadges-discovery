var should = require('should');
var nock = require('nock');
var Backpack = require('../../app/lib/backpack');

function MockDisplayerAPI(url) {
  var self = this;

  self.nock = nock(url);

  self.convert = function convert(email, id) {
    self.nock.post('/displayer/convert/email', {
      email: email
    }).reply(200, {
      status: "okay",
      email: email,
      userId: id
    });
    return self;
  };

  self.missing = function missing(email) {
    self.nock.post('/displayer/convert/email', {
      email: email
    }).reply(404, {
      status: "missing",
      error: "Could not find a user by the email address `" + email + "`"
    });
  };

  self.groupError = function groupError (id, errCode) {
    self.nock.get('/displayer/' + id + '/groups.json').reply(errCode);
  };

  self.groups = function groups (id, specs) {
    var gs = specs.map(function (group) {
      return {
        groupId: group.groupId,
        name: group.name,
        badges: group.badges.length
      };
    });
    self.nock.get('/displayer/' + id + '/groups.json').reply(200, {
      userId: id,
      groups: gs
    });
    specs.forEach(function (spec) {
      self.nock.get('/displayer/' + id + '/group/' + spec.groupId + '.json').reply(200, {
        userId: id,
        groupId: spec.groupId,
        badges: spec.badges
      });
    });
    return self;
  };

  return self;
}

describe('Backpack Displayer API client', function () {

  before(function () {
    this.backpack = new Backpack("http://example.org/backpack");
    this.mockApi = new MockDisplayerAPI("http://example.org/backpack");
  });

  it('should end with no groups', function (done) {
    this.mockApi.convert("someone@example.org", 1).groups(1, []);

    var b = this.backpack.getBadgeStream("someone@example.org");
    b.on('data', function () {
      throw new Error('expected no data');
    });
    b.on('end', function () {
      done();
    });
  });

  it('should stream badges from all groups', function (done) {
    this.mockApi.convert("someone@example.org", 1).groups(1, [
      {
        groupId: 10,
        name: 'group name',
        badges: [{assertion: {badge: {_location: "http://example.org/some/badgeclass.json"}}}]
      },
      {
        groupId: 11,
        name: 'group name',
        badges: [
          {assertion: {badge: {_location: "http://example.org/some/other/badgeclass.json"}}},
          {assertion: {badge: {_location: "http://example.org/yet/another/badgeclass.json"}}}
        ]
      }
    ]);

    var b = this.backpack.getBadgeStream("someone@example.org");
    var classes = [];
    b.on('data', function (badge) {
      classes.push(badge.assertion.badge._location);
    });
    b.on('end', function () {
      classes.should.eql([
        "http://example.org/some/badgeclass.json",
        "http://example.org/some/other/badgeclass.json",
        "http://example.org/yet/another/badgeclass.json"
      ]);
      done();
    });
  });

  it('should stream duplicate badges only once', function (done) {
    this.mockApi.convert("someone@example.org", 1).groups(1, [
      {
        groupId: 10,
        name: 'group name',
        badges: [{
          assertion: {badge: {_location: "http://example.org/some/badgeclass.json"}}
        }]
      },
      {
        groupId: 11,
        name: 'group name',
        badges: [{
          assertion: {badge: {_location: "http://example.org/some/badgeclass.json"}}
        }]
      }
    ]);

    var b = this.backpack.getBadgeStream("someone@example.org");
    var count = 0;
    b.on('data', function (badge) {
      count++;
    });
    b.on('end', function () {
      count.should.equal(1);
      done();
    });
  });

  it('should emit errors from client on id lookup', function (done) {
    this.mockApi.missing("nope@example.org");

    var b = this.backpack.getBadgeStream("nope@example.org");
    b.on('error', function (err) {
      should(err).be.ok;
      err.should.have.properties('status', 'message');
      err.status.should.equal('missing');
      err.message.should.include('Could not find a user');
      done();
    });
  });

  it('should emit errors from group lookup', function (done) {
    this.mockApi.convert("someone@example.org", 1).groupError(1, 404);

    var b = this.backpack.getBadgeStream("someone@example.org");
    b.on('error', function (err) {
      should(err).be.ok;
      err.message.should.include('Non-200 response: 404');
      done();
    });
  });
});