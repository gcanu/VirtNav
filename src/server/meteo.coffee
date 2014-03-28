fs = require 'fs'
http = require 'http'
whn = require 'when'
url = require 'url'
zlib = require 'zlib'
expat = require 'node-expat'

meteo = [
    'http://datacenter.manyplayers.com/winds/dated_1x1/50/meteo_20140327075947_0_50.xml'
]

Meteo =
    winds: []

#
# Cette méthode charge la météo à partir des fichiers météo stockés
# localement. S'il ne sont pas disponibles, ils sont téléchargés depuis le
# serveur distant
#
getMeteo = () ->
  # recherche des fichiers météos
  for addr in meteo
    matches = addr.match /meteo_(\d+)_\d+_\d+.?(\d+)?.xml/
    if matches
      path = './meteo/' + matches[0]
      if fs.existsSync path
        console.log "fichier "+path+" présent"
        getMeteoFromFile path
      else
        console.log "chargement de "+path
        getMeteoFromServer addr, path
          .then \
            ((p) ->
              console.log p+' enregistré avec succès'
              getMeteoFromFile p
            ), \
            ((code) ->
              console.log "erreur "+code
            )
  Meteo.winds


#
# Chargement depuis le serveur distant des données météo et les stocke dans un
# fichier
#
getMeteoFromServer = (addr, path) ->
  options =
    host: "vipproxy1.prod.extelia.fr"
    port: 8080
    path: addr

  defer = whn.defer()

  req = http.get options

  req.on 'response', (res) ->

    type = res.headers['content-encoding'] or res.headers['content-type']

    res.on 'end', () ->
      defer.resolve path

    if res.statusCode isnt 404

      if type is 'gzip' or type is 'text/xml'
        out = fs.createWriteStream path

        if type is 'gzip'
          res.pipe(zlib.createUnzip()).pipe(out)
        else
          res.pipe out
      else
        defer.resolve()
    else
      defer.reject res.statusCode

  defer.promise



#
# La méthode lit et parse le fichier xml et initialise l'objet Meteo
#
getMeteoFromFile = (path) ->
  Pt =
    x: 0
    y: 0
  datas = fs.readFileSync path
  xml = new expat.Parser "UTF-8"

  xml.on 'startElement', (el, attr) ->
    if el is 'PREVISIONS'
      Meteo.cols = attr.COLS|0
      Meteo.rows = attr.ROWS|0
      Meteo.lat = attr.LATITUDESTART|0
      Meteo.lon = attr.LONGITUDESTART|0
      Meteo.dx = attr.DX|0
      Meteo.dy = attr.DY|0
    if el is 'M'
      Meteo.winds.push {
        lat: Meteo.lat - Pt.x++
        lon: Meteo.lon + Pt.y
        speed: (attr.V|0) / 1.852
        angle: attr.D
      }

      if Pt.x is Meteo.rows
        Pt.x = 0
        Pt.y++

  xml.write datas
  undefined

exports.getMeteo = getMeteo