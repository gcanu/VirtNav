(function() {
  window.VMG = (function() {
    return function() {
      var bestAngle, dec2dms, deg2rad, dms2dec, getCoordFromLoxoDist, init, loxo, loxoAngle, loxodist, ortho, orthoAngle, orthodist, pos, rad2deg, speed;
      init = function() {
        bestAngle(pos.wind.speed, pos.wind.angle);
        return null;
      };
      orthodist = function(boat, target) {
        var t;
        t = Math.sin(boat.lat) * Math.sin(target.lat) + Math.cos(boat.lat) * Math.cos(target.lat) * Math.cos(target.lon - boat.lon);
        return 6371 / 1.852 * Math.acos(t);
      };
      loxodist = function() {
        var lati, rv;
        lati = function(lat) {
          return Math.log(Math.tan(Math.PI / 4 + lat / 2));
        };
        rv = Math.atan((pos.target.lon - pos.boat.lon) / (lati(pos.target.lat) - lati(pos.boat.lat)));
        return (pos.target.lat - pos.boat.lat) / Math.cos(rv) * (6371 / 1.852);
      };
      ortho = function(cap, vit) {
        var dist, ga, la, lm;
        dist = vit / 6;
        cap = deg2rad(cap);
        la = pos.boat.lat + deg2rad(dist * Math.cos(cap) / 60);
        lm = (pos.boat.lat + la) / 2;
        ga = pos.boat.lon + deg2rad(dist * Math.sin(cap) / Math.cos(lm) / 60);
        return {
          lat: la,
          lon: ga
        };
      };
      loxo = function(cap, vit) {
        var dist, la;
        dist = vit / 6;
        cap = deg2rad(cap);
        return la = {
          lat: la,
          lon: ga
        };
      };
      orthoAngle = function() {
        var co, ct, signe;
        ct = Math.acos(Math.cos(pos.boat.lat) * Math.cos(pos.target.lat) * Math.cos(pos.target.lon - pos.boat.lon) + Math.sin(pos.boat.lat) * Math.sin(pos.target.lat));
        signe = pos.boat.lon - pos.target.lon < 0 ? -1 : 1;
        co = Math.acos((Math.sin(pos.target.lat) - Math.cos(ct) * Math.sin(pos.boat.lat)) / (Math.cos(pos.boat.lat) * Math.sin(ct))) * signe;
        return co + Math.PI * 2 * ((1 - signe) / 2);
      };
      loxoAngle = function() {
        var tan_rv;
        tan_rv = (pos.target.lon - pos.boat.lon) / (pos.target.lat - pos.boat.lat) * Math.cos((pos.target.lat + pos.boat.lat) / 2);
        return Math.atan(tan_rv);
      };
      getCoordFromLoxoDist = function(lat, lon, cap, dist) {
        var angle, la, ld, target_lat, target_lon;
        lat = lat;
        lon = lon;
        angle = deg2rad(cap);
        target_lat = lat + deg2rad(Math.cos(angle) * dist / 60);
        if (Math.abs(target_lat - lat) > deg2rad(0.001)) {
          ld = Math.log(Math.tan(Math.PI / 4 + (lat / 2)));
          la = Math.log(Math.tan(Math.PI / 4 + (target_lat / 2)));
          target_lon = lon - (la - ld) * Math.tan(angle);
        } else {
          target_lon = lon - Math.sin(angle) * deg2rad(distance / (60.0 * Math.cos(lat)));
        }
        return console.log(dec2dms(rad2deg(target_lat)), dec2dms(rad2deg(target_lon)));
      };
      bestAngle = function(ws, wa, side) {
        var angle, best_angle, best_vit, c_angle, i, vit, vit_cible, wa_r, _i;
        angle = Math.round(rad2deg(orthoAngle()));
        best_vit = 0;
        best_angle = 0;
        for (i = _i = -90; _i <= 90; i = ++_i) {
          c_angle = angle + i;
          if (c_angle < 0) {
            wa_r = c_angle + 360 - wa;
          } else {
            wa_r = c_angle - wa;
          }
          vit = speed(Math.abs(wa_r), ws);
          vit_cible = vit * Math.cos(deg2rad(angle - c_angle));
          if (best_vit < vit_cible) {
            best_vit = vit_cible;
            best_angle = c_angle;
          }
          if (i === 0) {
            console.log(best_angle, best_vit);
          }
          if (i === 90) {
            console.log(best_angle, best_vit);
          }
        }
        return console.log(ortho(best_angle, best_vit));
      };
      null;
      speed = function(a, s) {
        var angle, bs, data, interpolate, t_a, t_s, vit;
        bs = 0;
        interpolate = function(_data) {
          var i_a, i_a2, i_s, step_a, step_a2, step_s;
          step_a = (_data.vit[1].vit - _data.vit[0].vit) / (_data.ord[1] - _data.ord[0]);
          i_a = _data.vit[1].vit - (_data.ord[1] - a) * step_a;
          step_a2 = (_data.vit[3].vit - _data.vit[2].vit) / (_data.ord[1] - _data.ord[0]);
          i_a2 = _data.vit[3].vit - (_data.ord[1] - a) * step_a2;
          step_s = (i_a2 - i_a) / (_data.abs[1] - _data.abs[0]);
          i_s = i_a2 - (_data.abs[1] - s) * step_s;
          return i_s;
        };
        t_a = 0;
        t_s = 0;
        for (angle in _polars) {
          if (t_a <= a && a <= angle) {
            for (vit in _polars[t_a]) {
              if (t_s <= s && s <= vit) {
                data = {
                  abs: [t_s, vit],
                  ord: [t_a, angle],
                  vit: [_polars[t_a][t_s], _polars[angle][t_s], _polars[t_a][vit], _polars[angle][vit]]
                };
                return interpolate(data);
                break;
              } else {
                t_s = vit;
              }
            }
            break;
          } else {
            t_a = angle;
          }
        }
        return null;
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
      pos = {
        boat: {
          lat: deg2rad(dms2dec(41, 27, 28)),
          lon: deg2rad(dms2dec(-12, -22, -41))
        },
        target: {
          lat: deg2rad(dms2dec(43)),
          lon: deg2rad(dms2dec(-9, -27))
        },
        wind: {
          angle: 288,
          speed: 3.1
        }
      };
      init();
      getCoordFromLoxoDist(pos.boat.lat, pos.boat.lon, 259, 2.2 / 6);
      return null;
    };
  })();

}).call(this);
