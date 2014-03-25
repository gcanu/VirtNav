window.gshhs = () ->

  # Variables declaration
  _datas = "" # string datas
  _p = 0      # read pointer
  canvas = document.getElementById 'canvas'

  # View controls
  _scale =
    h: 2
    w: 2

  _translate =
    x: 180
    y: 0

  init = () ->
    reader = new FileReader()
    reader.onload = (e) ->
      _datas = e.target.result

      viewBox =
        west: -180
        east: 180
        south: -90
        north: 90

      while(_p < _datas.length)
        trace viewBox

      console.log "done..."
      null

    input = document.getElementById "upload"
    input.onchange = (e) ->
      el = e.target
      if el.files.length > 0
        reader.readAsBinaryString el.files[0]
      null

    null

  #
  # Read datas
  # params pour la zone de tracage
  #
  trace = (vBox) ->
    id = read4()

    n = read4()

    flag = read4()
    level = flag & 255

    version = (flag >>> 8) & 255
    greenwich = (flag >>> 16) & 3
    source = (flag >>> 24) & 1
    river = (flag >>> 25) & 1
    scale = Math.pow(10, flag >>> 26);

    polygon =
      west: read4() * 0.000001
      east: read4() * 0.000001
      south: read4() * 0.000001
      north: read4() * 0.000001

    polygon.west -= 180 if polygon.west > 180
    polygon.east -= 180 if polygon.east > 180

    area = read4()
    area = area/scale
    area_full = read4()
    area_full = area_full/scale

    container = read4()
    ancestor = read4()

    # on vérifie si la box du polygone se trouve dans la zone de traçage
    renderPolygon = isVisible polygon, vBox

    # initialize canvas context
    if renderPolygon
      ctx = canvas.getContext '2d'

      ctx.lineWidth = 1
      ctx.strokeStyle = 'black';

      ctx.save()

      ctx.translate 180, 0
      ctx.transform 1,0,0,-1,0,180

      ctx.beginPath()

      # read points
      for i in [0..n-1]
        lon = read4() * 1e-6
        lat = read4() * 1e-6

        if lon > 180
          lon = lon - 360

        if level == 1
          lineBox =
            south: if _lat <= lat then _lat else lat
            north: if _lat > lat then _lat else lat
            west: if _lon <= lon then _lon else lon
            east: if _lon > lon then _lon else lon

          # render line only if visible
          if i is 0
            ctx.moveTo lon, lat
          else
            if isVisible lineBox, vBox
              if (Math.abs _lon-lon) > 180
                ctx.lineTo (if lon > 0 then lon-360 else lon+360), lat
                ctx.moveTo (if _lon > 0 then _lon-360 else _lon+360), _lat
              ctx.lineTo lon, lat
            else
              ctx.moveTo lon, lat

        _lat = lat
        _lon = lon

      ctx.stroke()
      ctx.restore()
    else
      _p += n*8

    null



  #
  # read 4 bytes, return a signed int
  #
  read4 = () ->
    a = 0;
    a += (_datas.charCodeAt _p) * Math.pow(2, 24)
    a += (_datas.charCodeAt _p+1) * Math.pow(2, 16)
    a += (_datas.charCodeAt _p+2) * Math.pow(2, 8)
    a += _datas.charCodeAt _p+3
    _p += 4
    a | 0


  #
  # return if a shape determined by his bouding box is visible
  #
  isVisible = (shapeBox, ViewBox) ->
    !((shapeBox.east <= ViewBox.west) || (shapeBox.west >= ViewBox.east) || (shapeBox.north <= ViewBox.south) || (shapeBox.south >= ViewBox.north))


  # Execution
  init()

  null