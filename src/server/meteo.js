(function() {
  var Meteo, expat, fs, getMeteo, getMeteoFromFile, getMeteoFromServer, http, meteo, url, whn, zlib;

  fs = require('fs');

  http = require('http');

  whn = require('when');

  url = require('url');

  zlib = require('zlib');

  expat = require('node-expat');

  meteo = ['http://datacenter.manyplayers.com/winds/dated_1x1/50/meteo_20140327075947_0_50.xml'];

  Meteo = {
    winds: []
  };

  getMeteo = function() {
    var addr, matches, path, _i, _len;
    for (_i = 0, _len = meteo.length; _i < _len; _i++) {
      addr = meteo[_i];
      matches = addr.match(/meteo_(\d+)_\d+_\d+.?(\d+)?.xml/);
      if (matches) {
        path = './meteo/' + matches[0];
        if (fs.existsSync(path)) {
          console.log("fichier " + path + " présent");
          getMeteoFromFile(path);
        } else {
          console.log("chargement de " + path);
          getMeteoFromServer(addr, path).then((function(p) {
            console.log(p + ' enregistré avec succès');
            return getMeteoFromFile(p);
          }), (function(code) {
            return console.log("erreur " + code);
          }));
        }
      }
    }
    return Meteo.winds;
  };

  getMeteoFromServer = function(addr, path) {
    var defer, options, req;
    options = {
      host: "vipproxy1.prod.extelia.fr",
      port: 8080,
      path: addr
    };
    defer = whn.defer();
    req = http.get(options);
    req.on('response', function(res) {
      var out, type;
      type = res.headers['content-encoding'] || res.headers['content-type'];
      res.on('end', function() {
        return defer.resolve(path);
      });
      if (res.statusCode !== 404) {
        if (type === 'gzip' || type === 'text/xml') {
          out = fs.createWriteStream(path);
          if (type === 'gzip') {
            return res.pipe(zlib.createUnzip()).pipe(out);
          } else {
            return res.pipe(out);
          }
        } else {
          return defer.resolve();
        }
      } else {
        return defer.reject(res.statusCode);
      }
    });
    return defer.promise;
  };

  getMeteoFromFile = function(path) {
    var Pt, datas, xml;
    Pt = {
      x: 0,
      y: 0
    };
    datas = fs.readFileSync(path);
    xml = new expat.Parser("UTF-8");
    xml.on('startElement', function(el, attr) {
      if (el === 'PREVISIONS') {
        Meteo.cols = attr.COLS | 0;
        Meteo.rows = attr.ROWS | 0;
        Meteo.lat = attr.LATITUDESTART | 0;
        Meteo.lon = attr.LONGITUDESTART | 0;
        Meteo.dx = attr.DX | 0;
        Meteo.dy = attr.DY | 0;
      }
      if (el === 'M') {
        Meteo.winds.push({
          lat: Meteo.lat - Pt.x++,
          lon: Meteo.lon + Pt.y,
          speed: (attr.V | 0) / 1.852,
          angle: attr.D
        });
        if (Pt.x === Meteo.rows) {
          Pt.x = 0;
          return Pt.y++;
        }
      }
    });
    xml.write(datas);
    return void 0;
  };

  exports.getMeteo = getMeteo;

}).call(this);
