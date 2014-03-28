utils = require './Utils'
remote = require './server'
meteo = require './meteo'

# position actuelle
winds = meteo.getMeteo()
pos = remote.getPositionFromServer()
  # dès que la position est récupérée, on peut lancer le routage
  .then \
    (position) ->

      position =
        lat: utils.deg2rad 43.5
        lon: utils.deg2rad 6.5
      console.log position
      infos = getInterpolationInfos position
      console.log infos

      getInterpolationMeteo infos, position
      true

#
# Méthode chargée de trouver les informations de météo nécessaires aux calculs d'interpolation.
# Recherche des 4 points météo encadrant le bateau
# @param pos {Position} position du bateau
#
getInterpolationInfos = (pos) ->
  lat = utils.rad2deg pos.lat
  lon = utils.rad2deg pos.lon

  return false if not winds

  res = []

  for wind in winds
    if Math.floor(lat) is wind.lat and Math.floor(lon) is wind.lon
      res.push wind
    if Math.ceil(lat) is wind.lat and Math.floor(lon) is wind.lon
      res.push wind
    if Math.floor(lat) is wind.lat and Math.ceil(lon) is wind.lon
      res.push wind
    if Math.ceil(lat) is wind.lat and Math.ceil(lon) is wind.lon
      res.push wind

  return false if res.length is not 4
  res



getInterpolationMeteo = (square, pos) ->
  lat = utils.rad2deg pos.lat
  lon = utils.rad2deg pos.lon

  getIntermediate = (x1, x2, y1, y2, d) ->
    (y2-y1)/(x2-x1)*d+y1

  delta = lat-square[0].lat
  i1 = getIntermediate square[0].lat, square[1].lat, square[0].speed, square[1].speed, delta
  return false if Math.abs i1 is Infinity or i1 is NaN
  i2 = getIntermediate square[2].lat, square[3].lat, square[2].speed, square[3].speed, delta
  return false if Math.abs i2 is Infinity or i1 is NaN
  f1 = getIntermediate square[0].lon, square[2].lon, i1, i2, lon-square[0].lon
  return false if Math.abs f1 is Infinity or f1 is NaN

  f1