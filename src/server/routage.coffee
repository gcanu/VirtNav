utils = require './Utils'
remote = require './server'

# position actuelle
pos = remote.getPositionFromServer()

  # dès que la position est récupérée, on peut lancer le routage
  .then \
    (position) ->
      getNextRoute position
      utils.speed
      true

#getNextRoute = (startPos) ->
#  for i in []