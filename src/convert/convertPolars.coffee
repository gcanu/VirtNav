Window::convertPolar = (() ->
  return () ->
  
    #
    # initialize file upload
    #
    
    init = () ->
      reader = new FileReader()
      reader.onload = (e) ->
        console.log convert e.target.result

      input = document.getElementById "upload"
      input.onchange = (e) -> 
        el = e.target
        if el.files.length > 0
          reader.readAsBinaryString el.files[0]
        null

      null
  
  
  
    #
    # Convert CSV datas
    #
    
    convert = (datas) ->
      header = []
      polars = {}
    
      rows = datas.split "\n"
      
      for row, i in rows
        header = row.split ";" if i is 0

        if i > 0
          cols = row.split ";"

          for col, j in cols
            hcol = col.toString() if j is 0
            polars[hcol] = {} if !polars[hcol]

            if j > 0
              datas = col.split ":"
              polars[hcol][header[j].toString()] =
                vit: datas[0]
                voile: datas[1]
      
      JSON.stringify polars
            
          
          
    
    #
    # Execute
    #
    init()
    
)()