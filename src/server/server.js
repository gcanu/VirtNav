(function() {
  var http, utils, whn, xmlStream;

  http = require('http');

  xmlStream = require('xml-stream');

  utils = require('./Utils');

  whn = require('when');

  exports.getPositionFromServer = function() {
    var defer, options;
    defer = whn.defer();
    options = {
      host: "vipproxy1.prod.extelia.fr",
      port: 8080,
      path: "http://900nq.virtualregatta.com/core/Service/ServiceCaller.php?service=GetUser&id_user=2165435&lang=FR&light=1&auto=1&checksum=e8b5db1441df29ba3042ad16a5e9539f5404980c"
    };
    http.get(options).on('response', function(response) {
      var xml;
      response.setEncoding('utf8');
      xml = new xmlStream(response);
      xml.on("updateElement: result user position", function(position) {
        defer.resolve({
          lat: utils.deg2rad(position.latitude | 0),
          lon: utils.deg2rad(position.longitude | 0)
        });
        return void 0;
      });
      return void 0;
    }).on('error', function(error) {
      defer.reject(error);
      return void 0;
    });
    return defer.promise;
  };

}).call(this);
