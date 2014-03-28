(function() {
  var getInterpolationInfos, getInterpolationMeteo, meteo, pos, remote, utils, winds;

  utils = require('./Utils');

  remote = require('./server');

  meteo = require('./meteo');

  winds = meteo.getMeteo();

  pos = remote.getPositionFromServer().then(function(position) {
    var infos;
    position = {
      lat: utils.deg2rad(43.5),
      lon: utils.deg2rad(6.5)
    };
    console.log(position);
    infos = getInterpolationInfos(position);
    console.log(infos);
    getInterpolationMeteo(infos, position);
    return true;
  });

  getInterpolationInfos = function(pos) {
    var lat, lon, res, wind, _i, _len;
    lat = utils.rad2deg(pos.lat);
    lon = utils.rad2deg(pos.lon);
    if (!winds) {
      return false;
    }
    res = [];
    for (_i = 0, _len = winds.length; _i < _len; _i++) {
      wind = winds[_i];
      if (Math.floor(lat) === wind.lat && Math.floor(lon) === wind.lon) {
        res.push(wind);
      }
      if (Math.ceil(lat) === wind.lat && Math.floor(lon) === wind.lon) {
        res.push(wind);
      }
      if (Math.floor(lat) === wind.lat && Math.ceil(lon) === wind.lon) {
        res.push(wind);
      }
      if (Math.ceil(lat) === wind.lat && Math.ceil(lon) === wind.lon) {
        res.push(wind);
      }
    }
    if (res.length === !4) {
      return false;
    }
    return res;
  };

  getInterpolationMeteo = function(square, pos) {
    var delta, f1, getIntermediate, i1, i2, lat, lon;
    lat = utils.rad2deg(pos.lat);
    lon = utils.rad2deg(pos.lon);
    getIntermediate = function(x1, x2, y1, y2, d) {
      return (y2 - y1) / (x2 - x1) * d + y1;
    };
    delta = lat - square[0].lat;
    i1 = getIntermediate(square[0].lat, square[1].lat, square[0].speed, square[1].speed, delta);
    if (Math.abs(i1 === Infinity || i1 === NaN)) {
      return false;
    }
    i2 = getIntermediate(square[2].lat, square[3].lat, square[2].speed, square[3].speed, delta);
    if (Math.abs(i2 === Infinity || i1 === NaN)) {
      return false;
    }
    f1 = getIntermediate(square[0].lon, square[2].lon, i1, i2, lon - square[0].lon);
    if (Math.abs(f1 === Infinity || f1 === NaN)) {
      return false;
    }
    return f1;
  };

}).call(this);
