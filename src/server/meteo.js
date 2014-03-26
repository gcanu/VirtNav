(function() {
  var Meteo, expat, fs, getMeteoFromFile, getMeteoFromServer, http, loadMeteo, meteo, url, whn, zlib;

  fs = require('fs');

  http = require('http');

  whn = require('when');

  url = require('url');

  zlib = require('zlib');

  expat = require('node-expat');

  meteo = {
    url: {
      '0': 'http://datacenter.manyplayers.com/winds/dated_1x1/50/meteo_20140326195805_0_50.xml'
    }
  };

  Meteo = {
    winds: []
  };

  loadMeteo = function() {
    var addr, matches, path, time, _ref, _results;
    _ref = meteo.url;
    _results = [];
    for (time in _ref) {
      addr = _ref[time];
      matches = addr.match(/meteo_(\d+)_\d+_\d+.?(\d+)?.xml/);
      if (matches) {
        path = './meteo/' + matches[0];
        if (fs.existsSync(path)) {
          console.log("fichier " + path + " présent");
          _results.push(getMeteoFromFile(path));
        } else {
          console.log("chargement de " + path);
          _results.push(getMeteoFromServer(addr, path).then((function(p) {
            console.log(p + ' enregistré avec succès');
            return getMeteoFromFile(p);
          }), (function(code) {
            return console.log("erreur " + code);
          })));
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  getMeteoFromServer = function(addr, path) {
    var defer, req;
    req = http.get(addr);
    defer = whn.defer();
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
        if (Pt.x === 8 && Pt.y === 9) {
          console.log(Meteo.winds[Meteo.winds.length - 1]);
        }
        if (Pt.x === Meteo.rows) {
          Pt.x = 0;
          return Pt.y++;
        }
      }
    });
    xml.write(datas);
    return Meteo;
  };

  loadMeteo();

}).call(this);
