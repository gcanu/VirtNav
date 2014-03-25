(function() {
  window.gshhs = function() {
    var canvas, init, isVisible, read4, trace, _datas, _p, _scale, _translate;
    _datas = "";
    _p = 0;
    canvas = document.getElementById('canvas');
    _scale = {
      h: 2,
      w: 2
    };
    _translate = {
      x: 180,
      y: 0
    };
    init = function() {
      var input, reader;
      reader = new FileReader();
      reader.onload = function(e) {
        var viewBox;
        _datas = e.target.result;
        viewBox = {
          west: -180,
          east: 180,
          south: -90,
          north: 90
        };
        while (_p < _datas.length) {
          trace(viewBox);
        }
        console.log("done...");
        return null;
      };
      input = document.getElementById("upload");
      input.onchange = function(e) {
        var el;
        el = e.target;
        if (el.files.length > 0) {
          reader.readAsBinaryString(el.files[0]);
        }
        return null;
      };
      return null;
    };
    trace = function(vBox) {
      var ancestor, area, area_full, container, ctx, flag, greenwich, i, id, lat, level, lineBox, lon, n, polygon, renderPolygon, river, scale, source, version, _i, _lat, _lon, _ref;
      id = read4();
      n = read4();
      flag = read4();
      level = flag & 255;
      version = (flag >>> 8) & 255;
      greenwich = (flag >>> 16) & 3;
      source = (flag >>> 24) & 1;
      river = (flag >>> 25) & 1;
      scale = Math.pow(10, flag >>> 26);
      polygon = {
        west: read4() * 0.000001,
        east: read4() * 0.000001,
        south: read4() * 0.000001,
        north: read4() * 0.000001
      };
      if (polygon.west > 180) {
        polygon.west -= 180;
      }
      if (polygon.east > 180) {
        polygon.east -= 180;
      }
      area = read4();
      area = area / scale;
      area_full = read4();
      area_full = area_full / scale;
      container = read4();
      ancestor = read4();
      renderPolygon = isVisible(polygon, vBox);
      if (renderPolygon) {
        ctx = canvas.getContext('2d');
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.save();
        ctx.translate(180, 0);
        ctx.transform(1, 0, 0, -1, 0, 180);
        ctx.beginPath();
        for (i = _i = 0, _ref = n - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          lon = read4() * 1e-6;
          lat = read4() * 1e-6;
          if (lon > 180) {
            lon = lon - 360;
          }
          if (level === 1) {
            lineBox = {
              south: _lat <= lat ? _lat : lat,
              north: _lat > lat ? _lat : lat,
              west: _lon <= lon ? _lon : lon,
              east: _lon > lon ? _lon : lon
            };
            if (i === 0) {
              ctx.moveTo(lon, lat);
            } else {
              if (isVisible(lineBox, vBox)) {
                if ((Math.abs(_lon - lon)) > 180) {
                  ctx.lineTo((lon > 0 ? lon - 360 : lon + 360), lat);
                  ctx.moveTo((_lon > 0 ? _lon - 360 : _lon + 360), _lat);
                }
                ctx.lineTo(lon, lat);
              } else {
                ctx.moveTo(lon, lat);
              }
            }
          }
          _lat = lat;
          _lon = lon;
        }
        ctx.stroke();
        ctx.restore();
      } else {
        _p += n * 8;
      }
      return null;
    };
    read4 = function() {
      var a;
      a = 0;
      a += (_datas.charCodeAt(_p)) * Math.pow(2, 24);
      a += (_datas.charCodeAt(_p + 1)) * Math.pow(2, 16);
      a += (_datas.charCodeAt(_p + 2)) * Math.pow(2, 8);
      a += _datas.charCodeAt(_p + 3);
      _p += 4;
      return a | 0;
    };
    isVisible = function(shapeBox, ViewBox) {
      return !((shapeBox.east <= ViewBox.west) || (shapeBox.west >= ViewBox.east) || (shapeBox.north <= ViewBox.south) || (shapeBox.south >= ViewBox.north));
    };
    init();
    return null;
  };

}).call(this);
