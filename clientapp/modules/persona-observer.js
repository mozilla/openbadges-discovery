module.exports = function (opts) {
  opts.onloginSuccess = opts.onloginSuccess || function () {};
  opts.onlogout = opts.onlogout || function () {};

  navigator.id.watch({
    loggedInUser: undefined,    // for now we'll always let persona tell us
    onlogin: function (assertion) {
      $.ajax({
        url: "/persona/verify",
        type: "POST",
        data: {
          assertion: assertion
        },
        dataType: "json"
      }).done(function (data, status, xhr) {
        if (data && data.status === "okay") {
          opts.onloginSuccess.call(this, data.email);
        }
        else {
          alert('Persona error: ' + data.reason);
        }
      });
    },
    onlogout: function () {
      $.ajax({
        url: "/persona/logout",
        type: "POST"
      }).done(function (data, status, xhr) {
        opts.onlogout.call(this);
      });
    }
  });
};