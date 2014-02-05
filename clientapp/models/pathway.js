var HumanModel = require('human-model');

module.exports = HumanModel.define({
  url: '/api/pathway/dummy',
  session: {
    rows: ['array']
  },
  move: function (start, end) {
    start = start.split(',');
    end = end.split(',');
    this.rows[start[0]].cells[start[1]].badge = false;
    this.rows[end[0]].cells[end[1]].badge = true;
    this.trigger('move');
  }
});
