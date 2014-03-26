window.VMG = (() ->
  return () ->

    #
    # Load polars
    #

    init = () ->
      bestAngle pos.wind.speed, pos.wind.angle
      null



    #
    # Tools
    #
    orthodist = (boat, target) ->
      t = Math.sin(boat.lat)*Math.sin(target.lat)+Math.cos(boat.lat)*Math.cos(target.lat)*Math.cos(target.lon-boat.lon)
      6371/1.852*Math.acos(t)



    loxodist = () ->
      lati = (lat) ->
        Math.log(Math.tan(Math.PI/4+lat/2))

      rv = Math.atan((pos.target.lon-pos.boat.lon)/(lati(pos.target.lat) - lati(pos.boat.lat)))

      (pos.target.lat - pos.boat.lat)/Math.cos(rv)*(6371/1.852)



    ortho = (cap, vit) -> # cap en degré
      dist = vit / 6
      cap = deg2rad cap
      la = pos.boat.lat + deg2rad(dist * Math.cos(cap) / 60)
      lm = (pos.boat.lat + la) / 2
      ga = pos.boat.lon + deg2rad(dist * Math.sin(cap) / Math.cos(lm) / 60)
      {lat: la, lon: ga}



    loxo = (cap, vit) ->
      dist = vit / 6
      cap = deg2rad cap
      la =
      {lat: la, lon: ga}



    orthoAngle = () ->
      ct = Math.acos(Math.cos(pos.boat.lat)*Math.cos(pos.target.lat)*Math.cos(pos.target.lon-pos.boat.lon)+Math.sin(pos.boat.lat)*Math.sin(pos.target.lat))
      signe = if pos.boat.lon - pos.target.lon < 0 then -1 else 1
      co = Math.acos((Math.sin(pos.target.lat)-Math.cos(ct)*Math.sin(pos.boat.lat))/(Math.cos(pos.boat.lat)*Math.sin(ct))) * signe
      co+Math.PI*2*((1-signe)/2)



    loxoAngle = () ->
      tan_rv = (pos.target.lon-pos.boat.lon)/(pos.target.lat-pos.boat.lat)*Math.cos((pos.target.lat+pos.boat.lat)/2)
      Math.atan(tan_rv)



    # lat et lon en rad, cap en deg et dist en Nm
    getCoordFromLoxoDist = (lat, lon, cap, dist) ->
      lat = lat
      lon = lon
      angle = deg2rad cap
      target_lat = lat + deg2rad(Math.cos(angle) * dist/60)
      if Math.abs(target_lat-lat) > deg2rad(0.001)
        ld = Math.log(Math.tan(Math.PI/4 + (lat/2)));
        la = Math.log(Math.tan(Math.PI/4 + (target_lat/2)));
        target_lon = lon - (la-ld)*Math.tan(angle);
      else
        target_lon = lon - Math.sin(angle)*deg2rad(distance/(60.0*Math.cos(lat)));

      [ dec2dms(rad2deg target_lat), dec2dms(rad2deg target_lon) ]



    #
    # Search the best VMG to the target
    # side : babord = -1, tribord = 1
    #
    bestAngle = (ws, wa, side) ->
      angle = Math.round rad2deg orthoAngle()
      best_vit = 0
      best_angle = 0

      for i in [-90..90]
        c_angle = angle + i

        # calcul de l'angle du bateau au vent
        if c_angle < 0
          wa_r = c_angle + 360 - wa
        else
          wa_r = c_angle - wa

        # calcul de la vitesse
        vit = speed Math.abs(wa_r), ws

        # on détermine la vitesse relative à la cible
        vit_cible = vit * Math.cos(deg2rad angle - c_angle);

        if best_vit < vit_cible
          best_vit = vit_cible
          best_angle = c_angle

        console.log best_angle, best_vit if i is 0
        console.log best_angle, best_vit if i is 90
      console.log ortho best_angle, best_vit
    null



    #
    # Get the speed from json
    #
    speed = (a, s) ->
      bs = 0

      # define interpolation function
      interpolate = (_data) ->
        # interpolate angle
        step_a = (_data.vit[1].vit - _data.vit[0].vit) / (_data.ord[1] - _data.ord[0])
        i_a = _data.vit[1].vit - (_data.ord[1] - a)* step_a

        step_a2 = (_data.vit[3].vit - _data.vit[2].vit) / (_data.ord[1] - _data.ord[0])
        i_a2 = _data.vit[3].vit - (_data.ord[1] - a)* step_a2

        # interpolate speed
        step_s = (i_a2 - i_a) / (_data.abs[1] - _data.abs[0])
        i_s = i_a2 - (_data.abs[1] - s) * step_s

        i_s

      # search angle
      t_a = 0
      t_s = 0

      for angle of _polars
        if t_a <= a and a <= angle
          for vit of _polars[t_a]
            if t_s <= s and s <= vit
              data =
                abs: [t_s, vit]
                ord: [t_a, angle]
                vit: [_polars[t_a][t_s], _polars[angle][t_s], _polars[t_a][vit], _polars[angle][vit]]
              return interpolate data
              break
            else
              t_s = vit
          break
        else
          t_a = angle

      null



    #
    # convert angle
    #
    deg2rad = (deg) ->
      Math.PI * deg / 180



    rad2deg = (rad) ->
      rad * 180 / Math.PI



    dms2dec = (d, m, s) ->
      d = d || 0
      m = m || 0
      s = s || 0
      d + m/60 + s/3600



    dec2dms = (dec) ->
      d = dec | 0
      dec = (dec - d)*60
      m = dec | 0
      dec = (dec - m)*60
      s = dec
      [d, m, s]


    #
    # Datas
    #
    pos =
      boat:
        lat: deg2rad dms2dec 41, 27, 28
        lon: deg2rad dms2dec -12, -22, -41
      target:
        lat: deg2rad dms2dec 43
        lon: deg2rad dms2dec -9, -27
      wind:
        angle: 288
        speed: 3.1


    init()


    null

)()