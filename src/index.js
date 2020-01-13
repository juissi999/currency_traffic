var charts = require('./charts')
var $ = require('jquery')
var d3 = require('d3')

// place app in body
currency_traffic('wrapper')

function currency_traffic (canvasid) {

  if (typeof(Storage) !== 'undefined') {
    // Code for localStorage/sessionStorage.
    } else {
      return $(canvasid).append('Sorry! Your browser has no Web Storage support..')
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
  var newpsec = createsection ('New purchase', 'newpb', 'newp_wrapper')
  newpsec.wrapper.appendChild(document.createTextNode('Name '))
  newpsec.wrapper.appendChild(createinput('purchase', 15))
  newpsec.wrapper.appendChild(document.createTextNode('Price '))
  newpsec.wrapper.appendChild(createinput('price', 7))
  var sdiv = document.createElement('div')
  sdiv.setAttribute('id', 'selection')
  newpsec.wrapper.appendChild(sdiv) 
  newpsec.wrapper.appendChild(createbutton ('Add', 'addbutton'))
  document.getElementById(canvasid).appendChild(newpsec.div)
  
  // s2
  var statssec = createsection ('Statistics', 'statsb', 'stats_wrapper')
  document.getElementById(canvasid).appendChild(statssec.div)

  // s3
  var chartssec = createsection ('Charts', 'chartsb', 'charts_wrapper')
  chartssec.wrapper.appendChild(createchart('chart1'))
  chartssec.wrapper.appendChild(createchart('chart2'))
  chartssec.wrapper.appendChild(createchart('chart3'))
  document.getElementById(canvasid).appendChild(chartssec.div)

  // s4
  var psec = createsection ('Purchases', 'purchaselistb', 'datalist')
  document.getElementById(canvasid).appendChild(psec.div)

  // s5
  var csec = createsection ('Clear data', 'cleardatab', 'cleardata_wrapper')
  csec.wrapper.appendChild(document.createTextNode('Are you sure? All data will be removed permanently.'))
  csec.wrapper.appendChild(createbutton ('Clear all', 'data_final_rmb'))
  document.getElementById(canvasid).appendChild(csec.div)

  function createsection (name, button_id, wrapper_id) {
    var section = {}

    var div = document.createElement('div')

    // button (and header)
    var but = document.createElement('button')
    but.appendChild(document.createTextNode(name + ' -'))
    but.setAttribute('class', 'section_toggle')
    but.setAttribute('id', button_id)
    div.appendChild(but)

    // wrapper_div
    var wrapper = document.createElement('div')
    wrapper.setAttribute('id', wrapper_id)
    div.appendChild(wrapper)

    section.div = div
    section.wrapper = wrapper

    return section
  }

  function createbutton (txt, id) {
    var but = document.createElement('button')
    but.setAttribute('id', id)
    but.appendChild(document.createTextNode(txt))
    return but
  }

  function createchart (id) {
    var div = document.createElement('div')
    div.setAttribute('class', 'chart')
    div.setAttribute('id', id)
    return div
  }

  function createinput (id, length) {
    var inp = document.createElement('input')
    inp.setAttribute('type', 'text')
    inp.setAttribute('id', id)
    inp.setAttribute('size', length)
    return inp
  }

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

  const showbmap = {'#newpb':'#newp_wrapper',
                    '#statsb':'#stats_wrapper',
                    '#chartsb':'#charts_wrapper',
                    '#purchaselistb':'#datalist',
                    '#cleardatab':'#cleardata_wrapper'}

  var showb_states = {
    '#newpb': 1,
    '#chartsb': 0,
    '#statsb':  0,
    '#purchaselistb': 0,
    '#cleardatab': 0
  }

  if (typeof(window.localStorage.ct_show_options) !== 'undefined') {
    // been there before, load my show options
    showb_states = JSON.parse(localStorage.getItem('ct_show_options'))
  }

  // set button states to what they had previous session or initialize if not on localstorage
  for (key in showb_states) {
    if(showb_states[key] === 0) {
        toggle_div(key)
    }
  }

  function save_showb_state () {
    localStorage.setItem('ct_show_options', JSON.stringify(showb_states))
  }

  var dnow = new Date()
  var monthnames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // options match to colors
  var colors = d3.schemePastel1
  var categories = ['food', 'service', 'leisure', 'item', 'rent', 'insurance', 'transport']

  $('#time').text(timestring(dnow))

  // generate selections for different categories
  var selection = 0
  addSelections(categories)
     
  function addSelections (categories) {
    //Create and append the options
    for (var i = 0; i < categories.length; i++) {
        // var option = document.createElement('option')
        // option.value = options[i]
        // option.text = options[i]
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

  //document.getElementById('newp').style.cursor = 'pointer' 
  $('#newpb').click((e) => {
    showbclick_callback(e)
  })

  $('#statsb').click((e) => {
    showbclick_callback(e)
  })

  // button callbacks
  $('#chartsb').click((e) => {
    showbclick_callback(e)
  })

  $('#purchaselistb').click((e) => {
    showbclick_callback(e)
  })

  $('#cleardatab').click((e) => {
    showbclick_callback(e)
  })

  function showbclick_callback (e) {
    // callback that gets elements id and calls divtoggle
    elid = '#' + e.target.id
    toggle_div(elid)
    // save show button states to local variable
    showb_states[elid] = 1 - showb_states[elid]
    save_showb_state()
  }

  function toggle_div (element) {
    // element is the showbutton id that is toggled
    // change text and reveal corresponding div

    // change the buttons polarity
    var divtitle = $(element).html()
    if (divtitle.slice(-1) === '+') {
        $(element).html(divtitle.slice(0, -1) + '-')
    } else {
        $(element).html(divtitle.slice(0, -1) + '+')
    }
    // map element to corresponding div
    $(showbmap[element]).toggle()
  }

  $('#data_final_rmb').click(() => {
    localStorage.removeItem('ctdata')
    data = []
    updateView(dnow.getFullYear())
    toggle_div('#cleardatab')
    showb_states['#cleardatab'] = 1 - showb_states['#cleardatab']
    save_showb_state()
  })

  $('#addbutton').click(function validateForm () {
    ptime = new Date()
    purchase = $('#purchase').val()
    price = $('#price').val()

    // change all , => . so that both are usable as currency delims
    // and parse as float
    var floatprice = parseFloat(price.split(',').join('.'))

    // check that price was actually a number
    if (!isNaN(floatprice)) {
        // format datafields -> faster for user to put next item
        $('#purchase').val('')
        $('#price').val('')

        addPurchase(purchase, floatprice, selection, ptime)
        updateView(dnow.getFullYear())
    }
  })

  $('#randombutton').click(function validateForm () {
    var howmanyrandom = 100
    for (var i=0; i<howmanyrandom; i++) {
        // generate random attributes
        const [rnddate, rndprice, rndselection] = generateRandomPurchase(categories.length)

        // insert purchase
        addPurchase('random', rndprice, rndselection, rnddate)
    }
    updateView(dnow.getFullYear())
  })

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
        
    spendingstr = ''
    if (data.length > 0) {
        var categoryspendings = calcCategorySpendings(data)
        var monthlyspendings = calcYearlySpendins(data, dnow)
        printCharts(categoryspendings, monthlyspendings, year)

        // form categorical spending string
        for (var i=0;i<categories.length;i++){
          spendingstr += categories[i] + ': ' + float2price(categoryspendings[i]) + ' '
        }
    } else {
        document.getElementById('chart1').innerHTML = ''
        document.getElementById('chart2').innerHTML = ''
        document.getElementById('chart3').innerHTML = ''
    }

    // update categorical spending string
    document.getElementById('stats_wrapper').innerHTML = 'Transactions: ' + data.length + ' total spending: ' +
                                                          float2price(calcTotalSpending(data)) + '<br>' + spendingstr
  }

  function calcCategorySpendings (inputdata) {
    // Calculate categorical spendings for each option for input values
    var categoryspendings = Array(categories.length).fill(0)
    for (var i=0;i<categories.length;i++){
        for (j=0;j<data.length;j++) {
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
    var arraystr = '<table>'
    arraystr += '<tr><th>Item</th><th>Price</th><th>Date</th></tr>'
    var len = purchaselist.length
    for (var i=len-1;i>-1;i--){
        var category = purchaselist[i][2]
        var date = purchaselist[i][3]
        arraystr += '<tr style="background-color:' + colors[category] + '"><td>'
        arraystr += purchaselist[i][0]
        arraystr += '</td><td>'
        arraystr += float2price(purchaselist[i][1])
        arraystr += '</td><td>'
        //arraystr += purchaselist[i][3].toLocaleDateString('fi')
        arraystr += date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear().toString().substr(2,2)
        arraystr += '</td><td>'
        arraystr += '<button id="rb' + i + '" class="rmitembutton">del</button>'
        arraystr += '</tr>'
    }
    arraystr += '</table>'
    document.getElementById('datalist').innerHTML = arraystr
    
    // add click-function to each remove-button
    for (var i=0;i<purchaselist.length;i++){
        $('#rb' + i).click({p1:i}, function removeItem (event) {
          purchaselist.splice(event.data.p1, 1)
          updateView(dnow.getFullYear())
          localStorage.setItem('ctdata', JSON.stringify(purchaselist))
        })
    }
  }

  function generateRandomPurchase (selectioncount) {
    var rnddate = new Date()
    // scale a it later than from beginning of computertime (rand/4)+0.75
    rnddate.setTime(Math.round(rnddate.getTime()*((Math.random()/5)+0.8)))
    var rndprice = Math.floor((Math.random() * 100) + 1)
    var rndselection = Math.floor((Math.random() * selectioncount))
    return [rnddate, rndprice, rndselection]
  }

  function calcYearlySpendins (data, dnow) {

    var yearlyspendings = {}

    // initialize year dict with all years starting from beginning to this
    // moment with empty dicts.
    var oldestyear = dnow.getFullYear()
    for (i=0;i<data.length;i++) {
        var ditem = new Date(data[i][3])
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
    for (i=0;i<data.length;i++) {
        var ditem = new Date(data[i][3])
        var month = ditem.getMonth()
        var year = ditem.getFullYear()
        
        yearlyspendings[year][month] += data[i][1]
    }
  return yearlyspendings
  }

  function calcTotalSpending (data) {
    // Calculate (and currently print) total spending for all products
    spending = 0
    for (var i=0;i<data.length;i++){
        spending += data[i][1]
    }
    return spending
  }

  function timestring (dnow) {
    return dnow.getDate() + '.' + (dnow.getMonth() + 1)  + '.' + dnow.getFullYear()
  }
}