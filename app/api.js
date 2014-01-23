var pathway = {
  rows: [
    {
      cells: [
        {badge: false},
        {badge: true},
        {badge: true},
        {badge: false}
      ]
    },
    {
      cells: [
        {badge: true},
        {badge: false},
        {badge: false},
        {badge: false}
      ]
    },
    {
      cells: [
        {badge: false},
        {badge: false},
        {badge: true},
        {badge: false}
      ]
    },
    {
      cells: [
        {badge: false},
        {badge: false},
        {badge: false},
        {badge: false}
      ]
    }
  ]
};

module.exports = function (app) {
  app.get('/pathway', function (req, res, next) {
    res.json(pathway);
  });
  return app;
};
