(function() {
  var dec2dms, deg2rad, dms2dec, getCoordFromLoxoDist, loxodist, orthodist, rad2deg;

  orthodist = function(a, b) {
    var t;
    t = Math.sin(a.lat) * Math.sin(b.lat) + Math.cos(a.lat) * Math.cos(b.lat) * Math.cos(b.lon - a.lon);
    return 6371 / 1.852 * Math.acos(t);
  };

  loxodist = function(a, b) {
    var lati, rv;
    lati = function(lat) {
      return Math.log(Math.tan(Math.PI / 4 + lat / 2));
    };
    rv = Math.atan((b.lon - a.lon) / (lati(b.lat) - lati(a.lat)));
    return (b.lat - b.lat) / Math.cos(rv) * (6371 / 1.852);
  };

  getCoordFromLoxoDist = function(pos, cap, dist) {
    var angle, la, lati, ld, target_lat, target_lon;
    lati = function(lat) {
      return Math.log(Math.tan(Math.PI / 4 + lat / 2));
    };
    angle = deg2rad(cap);
    target_lat = pos.lat + deg2rad(Math.cos(angle) * dist / 60);
    if (Math.abs(target_lat - pos.lat) > deg2rad(0.001)) {
      ld = lati(pos.lat);
      la = lati(target_lat);
      target_lon = pos.lon + (la - ld) * Math.tan(angle);
    } else {
      target_lon = pos.lon + Math.sin(angle) * deg2rad(distance / (60.0 * Math.cos(pos.lat)));
    }
    return {
      lat: dec2dms(rad2deg(target_lat)),
      lon: dec2dms(rad2deg(target_lon))
    };
  };

  deg2rad = function(deg) {
    return Math.PI * deg / 180;
  };

  rad2deg = function(rad) {
    return rad * 180 / Math.PI;
  };

  dms2dec = function(d, m, s) {
    d = d || 0;
    m = m || 0;
    s = s || 0;
    return d + m / 60 + s / 3600;
  };

  dec2dms = function(dec) {
    var d, m, s;
    d = dec | 0;
    dec = (dec - d) * 60;
    m = dec | 0;
    dec = (dec - m) * 60;
    s = dec;
    return [d, m, s];
  };

  exports.orthodist = orthodist;

  exports.loxodist = loxodist;

  exports.getCoordFromLoxoDist = getCoordFromLoxoDist;

  exports.deg2rad = deg2rad;

  exports.rad2deg = rad2deg;

  exports.dms2dec = dms2dec;

  exports.dec2dms = dec2dms;

}).call(this);
