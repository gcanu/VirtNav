(function() {
  Window.prototype.convertPolar = (function() {
    return function() {
      var convert, init;
      init = function() {
        var input, reader;
        reader = new FileReader();
        reader.onload = function(e) {
          return console.log(convert(e.target.result));
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
      convert = function(datas) {
        var col, cols, hcol, header, i, j, polars, row, rows, _i, _j, _len, _len1;
        header = [];
        polars = {};
        rows = datas.split("\n");
        for (i = _i = 0, _len = rows.length; _i < _len; i = ++_i) {
          row = rows[i];
          if (i === 0) {
            header = row.split(";");
          }
          if (i > 0) {
            cols = row.split(";");
            for (j = _j = 0, _len1 = cols.length; _j < _len1; j = ++_j) {
              col = cols[j];
              if (j === 0) {
                hcol = col.toString();
              }
              if (!polars[hcol]) {
                polars[hcol] = {};
              }
              if (j > 0) {
                datas = col.split(":");
                polars[hcol][header[j].toString()] = {
                  vit: datas[0],
                  voile: datas[1]
                };
              }
            }
          }
        }
        return JSON.stringify(polars);
      };
      return init();
    };
  })();

}).call(this);
