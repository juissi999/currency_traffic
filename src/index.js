var charts = require('./charts')
var d3 = require('d3')

// place app in body
currency_traffic('wrapper')

function currency_traffic (canvasid) {

  if (typeof(Storage) !== 'undefined') {
    // Code for localStorage/sessionStorage.
    } else {
      return document.getElementById(canvasid).appendChild(document.createTextNode('Sorry! Your browser has no Web Storage support..'))
  }

  // initialize sections states of load on localstorage
  var sections_visible = {
    'newpb': 1,
    'chartsb': 0,
    'statsb':  0,
    'purchaselistb': 0,
    'cleardatab': 0
  }

  if (typeof(window.localStorage.sections_visible) !== 'undefined') {
    // been there before, load my show options
    sections_visible = JSON.parse(localStorage.getItem('sections_visible'))
  }

  // generate site structure, add elements to canvas
  // title
  var h1 = document.createElement('h1');
  h1.appendChild(document.createTextNode('Currency traffic '));
  var timediv = document.createElement('div')
  timediv.setAttribute('id', 'time')
  timediv.setAttribute('class', 'inlineitem')
  h1.appendChild(timediv)
  document.getElementById(canvasid).appendChild(h1);

  // s1
  var newpsec = createsection ('New purchase', 'newpb', 'newp_wrapper', sections_visible['newpb'])
  
  newpsec.wrapper.appendChild(createinput('Name', 'purchase', 15))
  newpsec.wrapper.appendChild(createinput('Price', 'price', 7))
  var sdiv = document.createElement('div')
  sdiv.setAttribute('id', 'selection')
  newpsec.wrapper.appendChild(sdiv) 
  newpsec.wrapper.appendChild(createbutton ('Add', 'addbutton'))
  document.getElementById(canvasid).appendChild(newpsec.div)
  
  // s2
  var statssec = createsection ('Statistics', 'statsb', 'stats_wrapper', sections_visible['statsb'])
  document.getElementById(canvasid).appendChild(statssec.div)

  // s3
  var chartssec = createsection ('Charts', 'chartsb', 'charts_wrapper', sections_visible['chartsb'])
  chartssec.wrapper.appendChild(createchart('chart1'))
  chartssec.wrapper.appendChild(createchart('chart2'))
  chartssec.wrapper.appendChild(createchart('chart3'))
  document.getElementById(canvasid).appendChild(chartssec.div)

  // s4
  var psec = createsection ('Purchases', 'purchaselistb', 'datalist', sections_visible['purchaselistb'])
  document.getElementById(canvasid).appendChild(psec.div)

  // s5
  var csec = createsection ('Clear data', 'cleardatab', 'cleardata_wrapper', sections_visible['cleardatab'])
  csec.wrapper.appendChild(document.createTextNode('Are you sure? All data will be removed permanently.'))
  csec.wrapper.appendChild(createbutton ('Clear all', 'data_final_rmb'))
  document.getElementById(canvasid).appendChild(csec.div)


  function createsection (name, button_id, wrapper_id, visible) {
    // creates a section object
    var div = document.createElement('div')

    // button (and header)
    var but = document.createElement('button')
    but.setAttribute('class', 'section_toggle')
    but.setAttribute('id', button_id)
    but.setAttribute('data-wrapperdiv', wrapper_id)

    but.addEventListener('click', function (event) {
      // button click callback (toggle show/not_show)

      var button_id =  event.target.id
      toggle_div(button_id)
      // save show button states to local variable
      sections_visible[button_id] = 1 - sections_visible[button_id]
      save_showb_state()
    })

    div.appendChild(but)

    // wrapper_div
    var wrapper = document.createElement('div')
    wrapper.setAttribute('id', wrapper_id)
    div.appendChild(wrapper)

    // visible or not
    var statestr = ' -'
    if (!visible) {
      statestr = ' +'
      wrapper.setAttribute('class', 'hiddendiv')
    }
    but.appendChild(document.createTextNode(name + statestr))

    // form return object
    var section = {}
    section.div = div
    section.wrapper = wrapper
    return section
  }

  function createbutton (txt, id) {
    // creates a button object
    var but = document.createElement('button')
    but.setAttribute('id', id)
    but.appendChild(document.createTextNode(txt))
    return but
  }

  function createchart (id) {
    // creates a chart div
    var div = document.createElement('div')
    div.setAttribute('class', 'chart')
    div.setAttribute('id', id)
    return div
  }

  function createinput (txt, id, length) {
    // creates an input field
    var div = document.createElement('div')
    div.setAttribute('class', 'input_wrapper')
    div.appendChild(document.createTextNode(txt + ' '))
    var inp = document.createElement('input')
    inp.setAttribute('type', 'text')
    inp.setAttribute('id', id)
    inp.setAttribute('size', length)
    div.appendChild(inp)
    return div
  }

  // initialize data or load from local storage
  var data = []
  if (typeof(window.localStorage.ctdata) === "undefined") {
    // check if browser localstorage has data variable
    localStorage.setItem("ctdata", JSON.stringify([]))
  } else {
    var data_string = JSON.parse(localStorage.getItem("ctdata"))
        data_string.forEach(element => {
          // this is done because some elements might need processing (date e.g.)
          data.push([element[0], element[1], element[2], new Date(element[3])])
        })
  }

  function save_showb_state () {
    localStorage.setItem('sections_visible', JSON.stringify(sections_visible))
  }

  var dnow = new Date()
  var monthnames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // options match to colors
  var colors = d3.schemePastel1
  var categories = ['food', 'service', 'leisure', 'item', 'rent', 'insurance', 'transport']

  document.getElementById('time').innerHTML = timestring(dnow)

  // generate selections for different categories
  var selection = 0
  addSelections(categories)

  function addSelections (categories) {
    // Create and append the category selector elements
    for (var i = 0; i < categories.length; i++) {
        var cel = document.createElement('button')
        cel.setAttribute('class', 'categorybutton')
        cel.setAttribute('style', 'background-color:' + colors[i])
        cel.setAttribute('data-category', i)
        cel.innerHTML = categories[i]
        cel.addEventListener('click', function (event) {
          // set selection variable to correct
          selection = parseInt(event.target.getAttribute('data-category'))

          // remove selected-class from all selections
          var ss = document.getElementById('selection').children
          for (j=0;j<ss.length;j++) {
            ss[j].classList.remove('selected')
          }

          // add to newest selection
          event.target.classList.add('selected')
        })
        document.getElementById('selection').appendChild(cel)
    }
    // initialize to first element selected
    document.getElementById('selection').children[0].classList.add('selected')
  }

  // if data exists at this point, calc and draw statistics
  if (data.length > 0) {
    updateView(dnow.getFullYear())
  }

  function toggle_div (element) {
    // callback for toggling div to be visible or not

    var but = document.getElementById(element)
    var txt = but.firstChild.textContent

    var wrapper = document.getElementById(but.getAttribute('data-wrapperdiv'))
    if (wrapper.classList.contains('hiddendiv')){
      wrapper.classList.remove('hiddendiv')
      but.firstChild.textContent = txt.slice(0, -1) + '-'
    } else {
      wrapper.classList.add('hiddendiv')
      but.firstChild.textContent = txt.slice(0, -1) + '+'
    }
  }

  document.getElementById('data_final_rmb').addEventListener('click', ()=> {
    // callback for data_final_rmb
    localStorage.removeItem('ctdata')
    data = []
    updateView(dnow.getFullYear())
    toggle_div('cleardatab')
    sections_visible['cleardatab'] = 1 - sections_visible['cleardatab']
    save_showb_state()
  })

  document.getElementById('addbutton').addEventListener('click', ()=> {
    // callback for addbutton
    ptime = new Date()
    purchase = document.getElementById('purchase').value
    price = document.getElementById('price').value

    // change all , => . so that both are usable as currency delims
    // and parse as float
    var floatprice = parseFloat(price.split(',').join('.'))

    // check that price was actually a number
    if (!isNaN(floatprice)) {
        // format datafields -> faster for user to put next item
        document.getElementById('purchase').value = ''
        document.getElementById('price').value = ''

        addPurchase(purchase, floatprice, selection, ptime)
        updateView(dnow.getFullYear())
    }
  })

  // document.getElementById('randombutton').addEventListener('click', ()=> {
  //   var howmanyrandom = 100
  //   for (var i=0; i<howmanyrandom; i++) {
  //       // generate random attributes
  //       const [rnddate, rndprice, rndselection] = generateRandomPurchase(categories.length)

  //       // insert purchase
  //       addPurchase('random', rndprice, rndselection, rnddate)
  //   }
  //   updateView(dnow.getFullYear())
  // })

  // function generateRandomPurchase (selectioncount) {
  //   var rnddate = new Date()
  //   // scale a it later than from beginning of computertime (rand/4)+0.75
  //   rnddate.setTime(Math.round(rnddate.getTime()*((Math.random()/5)+0.8)))
  //   var rndprice = Math.floor((Math.random() * 100) + 1)
  //   var rndselection = Math.floor((Math.random() * selectioncount))
  //   return [rnddate, rndprice, rndselection]
  // }

  function addPurchase (purchase, price, selection, datetime) {
    if (purchase.length > 0) {
        data.push([purchase, price, selection, datetime])
        localStorage.setItem('ctdata', JSON.stringify(data))
    }
  }

  function float2price (f) {
    return f.toFixed(2)
  }

  function updateView (year){
    // this function updates the view, recalculates all too
    printPurchases(data)
    document.getElementById('stats_wrapper').innerHTML = ''
    // document.getElementById('spending').innerHTML = 'Transactions: ' + data.length + ' total spending: ' + float2price(calcTotalSpending(data))

    var stable = document.createElement('table')
    stable.setAttribute('id', 'stats_table')
    document.getElementById('stats_wrapper').appendChild(stable)

    add_headers('stats_table', ['', 'this month', 'all time'])

    var categoryspendings = 0
    if (data.length > 0) {
        categoryspendings = calcCategorySpendings(data)
        var data_thism = filter_data_by_month(data, dnow.getYear(), dnow.getMonth())
        var categoryspendings_thism = calcCategorySpendings(data_thism)
        var monthlyspendings = calcYearlySpendins(data, dnow)
        printCharts(categoryspendings, monthlyspendings, year)
        add_row('stats_table', '', ['transactions', data_thism.length, data.length])

        // form categorical spending string
        for (var i=0;i<categories.length;i++){
          add_row('stats_table', '', [categories[i], float2price(categoryspendings_thism[i]), float2price(categoryspendings[i])])
        }
    } else {
        document.getElementById('chart1').innerHTML = ''
        document.getElementById('chart2').innerHTML = ''
        document.getElementById('chart3').innerHTML = ''
        add_row('stats_table', ['transactions', 0, 0])
    }
    add_row('stats_table', '', ['total', float2price(sum_list_values(categoryspendings_thism)), float2price(sum_list_values(categoryspendings))])
  }

  function add_headers (table_id, header_list ) {
    // creates the header row to table
    var str = document.createElement('tr')
    for (i=0;i<header_list.length;i++){
      var sth = document.createElement('th')
      sth.appendChild(document.createTextNode(header_list[i]))
      str.appendChild(sth)
    }
    document.getElementById(table_id).appendChild(str)
  }

  function add_row (table_id, rowcolor, row_items_list) {
    var str = document.createElement('tr')
    str.setAttribute('style', 'background-color:' + rowcolor)
    for (i=0;i<row_items_list.length;i++){
      var std = document.createElement('td')
      std.appendChild(document.createTextNode(row_items_list[i]))
      str.appendChild(std)
    }
    document.getElementById(table_id).appendChild(str)
    return str
  }

  function calcCategorySpendings (inputdata) {
    // Calculate categorical spendings for each option for input values
    var categoryspendings = Array(categories.length).fill(0)
    for (var i=0;i<categories.length;i++){
        for (j=0;j<inputdata.length;j++) {
              if (i === inputdata[j][2]) {
                categoryspendings[i] += inputdata[j][1]
              }
        }
    }
    return categoryspendings
  }

  function printCharts (categoryspendings, yearlyspendings, year) {
    // parse categoryspendings
    var width = 280
    var height = 200
    var margins = {left:35,right:20,top:10,bottom:20}

    // calculate bubbles r's so that they show correct amount of area
    var totals = d3.sum(categoryspendings)
    var chart_area = Math.min(width, height)*Math.min(width, height)

    var currency_per_pixel = chart_area/totals
    // make used chart area little bit smaller than 100% to minimize the part of
    // circles that gets left out
    currency_per_pixel = currency_per_pixel*0.7

    var cgdata = []
    for (var i = 0; i < categories.length; i++){
        if (categoryspendings[i] > 0) {
          cgdata.push({'id':categories[i], 'r':Math.sqrt(categoryspendings[i]*currency_per_pixel/Math.PI), 'color':colors[i]})
        }
    }
    
    // parse monthlyspendings for selected year
    var monthlyspendings = yearlyspendings[year]
    var dataforthisyear = []
    for (var key in monthlyspendings) {
        dataforthisyear.push({'x':+key+1, 'y': monthlyspendings[key]})
    }
    
    // parse yearlyspendings
    var yearlyspending = 0
    var data3 = [['year', 'spending']]
    var yearly = []
    for (var key in yearlyspendings) {
        // loop and sum all monthly spendings across year
        for (var mkey in yearlyspendings[key]) {
          yearlyspending += yearlyspendings[key][mkey]
        }
        data3.push([key, yearlyspending])
        yearly.push({'x':key, 'y':yearlyspending})
        yearlyspending = 0
    }
    
    function selectYear (d) {
        // when user selects year set draw that years monthly graph
        updateView(d.x)
    }

    charts.bubblechart('#chart1', cgdata, width, height)
    charts.linechart('#chart2', dataforthisyear, width, height, margins, 4, ()=>{})
    charts.linechart('#chart3', yearly, width, height, margins, 4, selectYear)
  }

  function printPurchases (purchaselist) {
    // Print the list of goodies bought
    document.getElementById('datalist').innerHTML = ''
    // create table element
    var ptable = document.createElement('table')
    ptable.setAttribute('id', 'purchases_table')
    document.getElementById('datalist').appendChild(ptable)

    add_headers('purchases_table', ['Item', 'Price', 'Date'])

    var len = purchaselist.length
    for (var i=len-1;i>-1;i--){
        // create row for purchasetable
        var category = purchaselist[i][2]
        var date = purchaselist[i][3]
        var tr = add_row('purchases_table', colors[category], [purchaselist[i][0], float2price(purchaselist[i][1]), 
                                                               date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear().toString().substr(2,2)])

        // create deletebutton to the end of the row
        var rmbut = document.createElement('button')
        rmbut.setAttribute('id', 'rb' + i )
        rmbut.setAttribute('data-indice',  i)
        rmbut.setAttribute('class', 'rmitembutton')
        rmbut.innerHTML = 'del'
        rmbut.addEventListener('click', (event) => {
          // deletebutton callback
          var indice = parseInt(event.target.getAttribute('data-indice'))
          purchaselist.splice(indice, 1)
          updateView(dnow.getFullYear())
          localStorage.setItem('ctdata', JSON.stringify(purchaselist))
        })

        // add deletebutton
        tr.appendChild(rmbut)
    }
  }

  function calcYearlySpendins (purchaselist, dnow) {

    var yearlyspendings = {}

    // initialize year dict with all years starting from beginning to this
    // moment with empty dicts.
    var oldestyear = dnow.getFullYear()
    for (i=0;i<purchaselist.length;i++) {
        var ditem = new Date(purchaselist[i][3])
        var year = ditem.getFullYear()
        if (year < oldestyear) {
          oldestyear = year
        }
    }
    
    // loop all years and add zero months
    for (i=oldestyear;i<=dnow.getFullYear();i++) {
        yearlyspendings[i] = {}
    
        // loop all months, but if current year, only loop till current month
        var maxmonth = 12
        if (i === dnow.getFullYear()) {
          maxmonth = dnow.getMonth() + 1
        }
        for (j=0;j<maxmonth;j++) {
          yearlyspendings[i][j] = 0
        }
    }

    // find all months when purchases are made
    for (i=0;i<purchaselist.length;i++) {
        var ditem = new Date(purchaselist[i][3])
        var month = ditem.getMonth()
        var year = ditem.getFullYear()
        
        yearlyspendings[year][month] += purchaselist[i][1]
    }
  return yearlyspendings
  }

  function sum_list_values (my_list) {
    // sum all variables in list together
    // assumes all are numerical
    var my_sum = 0
    for (var i=0;i<my_list.length;i++) {
      my_sum += my_list[i]
    }
    return my_sum
  }

  function filter_data_by_month(purchaselist, year, month) {

    var new_data = []
    for (var i=0;i<purchaselist.length;i++) {
      if (purchaselist[i][3].getYear() === year && purchaselist[i][3].getMonth() === month) {
        new_data.push(purchaselist[i])
      }
    } 
    return new_data
  }

  function timestring (dnow) {
    return dnow.getDate() + '.' + (dnow.getMonth() + 1)  + '.' + dnow.getFullYear()
  }
}