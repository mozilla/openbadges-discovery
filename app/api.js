/* TODO: consider writing this as a sub-app mounted at /api instead of
         slapping routes on an existing app
 */

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
  app.get('/api/pathway', function (req, res, next) {
    return res.json(pathway);
  });
  return app;
};
