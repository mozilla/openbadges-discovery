var should = require('should');
var Requirements = require('../../clientapp/models/pathway-requirements');

describe('pathway-requirements', function () {
  it('should init', function () {
    var reqs = new Requirements();
    reqs.should.be.ok;
  });

  it('should move requirements', function (done) {
    var reqs = new Requirements([{x:0, y:0}]);
    reqs.on('move', function () {
      reqs.at(0).x.should.equal(1);
      reqs.at(0).y.should.equal(1);
      done();
    });
    reqs.move("0,0", "1,1", {sync: false});
  });

  describe('rows data projection', function () {
    /* This supports the demo for now, these will change */

    it('should expose 4x4 grid projection', function () {
      var reqs = new Requirements();
      reqs.rows().length.should.equal(4);
      reqs.rows()[0].length.should.equal(4);
    });

    it('should mark occupied cells', function () {
      (new Requirements([
        {x:2, y:3} 
      ])).rows().forEach(function (row, r) {
        row.forEach(function (cell, c) {
          if (r === 3 && c === 2) cell.should.equal(true);
          else cell.should.equal(false);
        });
      });
    });
  });
});
