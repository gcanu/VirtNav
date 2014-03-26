(function() {
  var pos, remote, utils;

  utils = require('./Utils');

  remote = require('./server');

  pos = remote.getPositionFromServer().then(function(position) {
    getNextRoute(position);
    utils.speed;
    return true;
  });

}).call(this);
