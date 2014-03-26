#
# return the orthodromic distance between two points
# both params must be a Position Object
#
orthodist = (a, b) ->
  t = Math.sin(a.lat)*Math.sin(b.lat)+Math.cos(a.lat)*Math.cos(b.lat)*Math.cos(b.lon-a.lon)
  6371/1.852*Math.acos(t)



#
# return the loxodromic distance between two points
# both params must be a Position Object
#
loxodist = (a, b) ->
  lati = (lat) ->
    Math.log(Math.tan(Math.PI/4+lat/2))

  rv = Math.atan((b.lon-a.lon)/(lati(b.lat) - lati(a.lat)))
  (b.lat - b.lat)/Math.cos(rv)*(6371/1.852)



#
# pos: {lat: rad, lon: rad}
# cap: rad
# dist: Nm
#
getCoordFromLoxoDist = (pos, cap, dist) ->
  lati = (lat) ->
    Math.log(Math.tan(Math.PI/4+lat/2))

  angle = deg2rad cap
  target_lat = pos.lat + deg2rad(Math.cos(angle) * dist/60)
  if Math.abs(target_lat-pos.lat) > deg2rad(0.001)
    ld = lati pos.lat
    la = lati target_lat
    target_lon = pos.lon + (la-ld)*Math.tan(angle);
  else
    target_lon = pos.lon + Math.sin(angle)*deg2rad(distance/(60.0*Math.cos(pos.lat)));

  { lat: dec2dms(rad2deg target_lat), lon: dec2dms(rad2deg target_lon) }


#
# Angles conversions
#
deg2rad = (deg) ->
      Math.PI * deg / 180



rad2deg = (rad) ->
  rad * 180 / Math.PI



#
# Position representation conversion
#
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



exports.orthodist = orthodist
exports.loxodist = loxodist
exports.getCoordFromLoxoDist = getCoordFromLoxoDist
exports.deg2rad = deg2rad
exports.rad2deg = rad2deg
exports.dms2dec = dms2dec
exports.dec2dms = dec2dms