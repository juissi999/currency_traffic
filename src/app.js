var charts = require("./charts")
var $ = require("jquery")
var d3 = require("d3")

var canvasid = "body"

if (typeof(Storage) !== "undefined") {
   // Code for localStorage/sessionStorage.
   } else {
   return $(canvasid).append("Sorry! Your browser has no Web Storage support..")
   }

// generate site structure, add elements to canvas
$(canvasid).append("<h1>Currency traffic <div id=\"time\" class=\"inlineitem\"></div></h1>");
$(canvasid).append("<button class=\"section_toggle\" id=\"newpb\">New purchase -</button><br>");
$(canvasid).append("<div id=\"newp_wrapper\">Name <input type=\"text\" id=\"purchase\" size=\"15\">" +
                  " Price <input type=\"text\" id=\"price\" size=\"7\"><br>Type:" +
                  "<select id=\"selection\"></select>" +
                  " <button id=\"addbutton\">Add</button>" +
                  " <button id=\"randombutton\">Add 100 random purchases</button></div>");
$(canvasid).append("<button class=\"section_toggle\" id=\"statsb\">Statistics -</button><br>");
$(canvasid).append("<div id=\"stats_wrapper\">" +
                  "<p id=\"spending\"></p><p id=\"categoryspending\"></p></div>");
$(canvasid).append("<button class=\"section_toggle\" id=\"chartsb\">Charts -</button><br>");
$(canvasid).append("<div id=\"charts_wrapper\" class=\"charts\">" +
                     "<div id=\"chart\" class=\"chart\"></div>" +
                     "<div id=\"chart2\" class=\"chart\"></div>" +
                     "<div id=\"chart3\" class=\"chart\"></div></div>")
$(canvasid).append("<button class=\"section_toggle\" id=\"purchaselistb\">Purchases -</button><br>");                      
$(canvasid).append("<div id=\"datalist\"></div>")
$(canvasid).append("<button class=\"section_toggle\" id=\"cleardatab\">Clear data -</button>");
$(canvasid).append("<div id=\"cleardata_wrapper\">Are you sure? All data will be removed permanently " +
                     "<button id=\"data_final_rmb\">Clear all</button></div>");

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

const showbmap = {"#newpb":"#newp_wrapper",
                  "#statsb":"#stats_wrapper",
                  "#chartsb":"#charts_wrapper",
                  "#purchaselistb":"#datalist",
                  "#cleardatab":"#cleardata_wrapper"}

var showb_states = {
   "#newpb": 1,
   "#chartsb": 0,
   "#statsb":  0,
   "#purchaselistb": 0,
   "#cleardatab": 0
}

if (typeof(window.localStorage.ct_show_options) !== "undefined") {
   // been there before, load my show options
   showb_states = JSON.parse(localStorage.getItem("ct_show_options"))
}

// set button states to what they had previous session or initialize if not on localstorage
for (key in showb_states) {
   if(showb_states[key] == 0) {
      toggle_div(key)
   }
}

function save_showb_state() {
   localStorage.setItem("ct_show_options", JSON.stringify(showb_states))
}


var dnow = new Date()
var monthnames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

var options = ["food", "service", "leisure", "item", "rent", "insurance"]
$("#time").text(timestring(dnow))

// generate selections for different categories
addSelections(options)

// if data exists at this point, calc and draw statistics
if (data.length > 0) {
   updateView(dnow.getFullYear())
}

//document.getElementById("newp").style.cursor = "pointer"; 
$("#newpb").click((e) => {
   showbclick_callback(e)
})

$("#statsb").click((e) => {
   showbclick_callback(e)
})

// button callbacks
$("#chartsb").click((e) => {
   showbclick_callback(e)
})

$("#purchaselistb").click((e) => {
   showbclick_callback(e)
})

$("#cleardatab").click((e) => {
   showbclick_callback(e)
})

function showbclick_callback(e) {
   // callback that gets elements id and calls divtoggle
   elid = "#" + e.target.id
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
   if (divtitle.slice(-1) == "+") {
      $(element).html(divtitle.slice(0, -1) + "-")
   } else {
      $(element).html(divtitle.slice(0, -1) + "+")
   }
   // map element to corresponding div
   $(showbmap[element]).toggle()
}

$("#data_final_rmb").click(() => {
   localStorage.removeItem("ctdata")
   data = []
   updateView(dnow.getFullYear())
   toggle_div("#cleardatab")
   showb_states["#cleardatab"] = 1 - showb_states["#cleardatab"]
   save_showb_state()
})

$("#addbutton").click(function validateForm() {
   ptime = new Date()
   purchase = $("#purchase").val()
   price = $("#price").val()
   selection = document.getElementById("selection")["value"]

   // change all , => . so that both are usable as currency delims
   // and parse as float
   var floatprice = parseFloat(price.split(",").join("."));

   // check that price was actually a number
   if (!isNaN(floatprice)) {
      // format datafields -> faster for user to put next item
      $("#purchase").val("")
      $("#price").val("")

      addPurchase(purchase, floatprice, selection, ptime)
      updateView(dnow.getFullYear())
   }
});

$("#randombutton").click(function validateForm() {
   var howmanyrandom = 100
   for (var i=0; i<howmanyrandom; i++) {
      // generate random attributes
      const [rnddate, rndprice, rndselection] = generateRandomPurchase(document.getElementById("selection").length)

      // insert purchase
      addPurchase("random", rndprice, document.getElementById("selection")[rndselection]["value"], rnddate)
   }
   updateView(dnow.getFullYear())
});

function addPurchase(purchase, price, selection, datetime) {
   if (purchase.length > 0) {
      data.push([purchase, price, selection, datetime])
      localStorage.setItem("ctdata", JSON.stringify(data))
   }
}

function float2price(f) {
   return f.toFixed(2)
}

function updateView(year){
   // this function updates the view, recalculates all too
   printPurchases(data)
   document.getElementById("spending").innerHTML = "Transactions: " + data.length + " total spending: " + float2price(calcTotalSpending(data))
      
   spendingstr = "";
   if (data.length > 0) {
      var categoryspendings = calcCategorySpendings(data)
      var monthlyspendings = calcYearlySpendins(data, dnow)
      printCharts(categoryspendings, monthlyspendings, year)

      // form categorical spending string
      for (var i=0;i<options.length;i++){
      spendingstr += options[i] + ": " + float2price(categoryspendings[i]) + " "
      }
   } else {
      document.getElementById('chart').innerHTML = ""
      document.getElementById('chart2').innerHTML = ""
      document.getElementById('chart3').innerHTML = ""
   }

   // update categorical spending string
   document.getElementById("categoryspending").innerHTML = spendingstr
}

function calcCategorySpendings(inputdata){
   // Calculate categorical spendings for each option for input values
   var categoryspendings = Array(options.length).fill(0)
   for (var i=0;i<options.length;i++){
      for (j=0;j<data.length;j++) {
            if (options[i].valueOf() == inputdata[j][2].valueOf()) {
               categoryspendings[i] += inputdata[j][1]
            }
      }
   }
   return categoryspendings
}
      
function addSelections(options){
   //Create and append the options
   for (var i = 0; i < options.length; i++) {
      var option = document.createElement("option");
      option.value = options[i]
      option.text = options[i]
      document.getElementById("selection").appendChild(option)
   }
}

function printCharts(categoryspendings, yearlyspendings, year){
   // parse categoryspendings
   totals = d3.sum(categoryspendings)
   var cgdata = []
   for (var i = 0; i < options.length; i++){
      cgdata.push({"id":options[i], "r":categoryspendings[i]/totals*150})
   }
   
   // parse monthlyspendings for selected year
   var monthlyspendings = yearlyspendings[year]
   var dataforthisyear = []
   for (var key in monthlyspendings) {
      dataforthisyear.push({"x":+key+1, "y": monthlyspendings[key]})
   }
   
   // parse yearlyspendings
   var yearlyspending = 0
   var data3 = [["year", "spending"]]
   var yearly = []
   for (var key in yearlyspendings) {
      // loop and sum all monthly spendings across year
      for (var mkey in yearlyspendings[key]) {
         yearlyspending += yearlyspendings[key][mkey]
      }
      data3.push([key, yearlyspending])
      yearly.push({"x":key, "y":yearlyspending})
      yearlyspending = 0
   }
   
   function selectYear(d) {
      // when user selects year set draw that years monthly graph
      updateView(d.x)
   }

   var width = 280
   var height = 200
   var margins = {left:35,right:20,top:10,bottom:20}
   charts.bubblechart("#chart", cgdata, width, height)
   charts.linechart("#chart2", dataforthisyear, width, height, margins, 3, ()=>{})
   charts.linechart("#chart3", yearly, width, height, margins, 3, selectYear)
}

function printPurchases(purchaselist){
   // Print the list of goodies bought
   var arraystr = "<table>";
   arraystr += "<tr><th>Item</th><th>Price</th><th>Type</th><th>Date</th></tr>"
   var len = purchaselist.length
   for (var i=len-1;i>-1;i--){
      arraystr += "<tr><td>"
      arraystr += purchaselist[i][0]
      arraystr += "</td><td>"
      arraystr += float2price(purchaselist[i][1]);
      arraystr += "</td><td>"
      arraystr += purchaselist[i][2]
      arraystr += "</td><td>"
      arraystr += purchaselist[i][3].toLocaleDateString('fi')
      arraystr += "</td><td>"
      arraystr += "<input id=\"rb" + i + "\" type=\"button\" class=\"rmitembutton\" value=\"del\">"
      arraystr += "</tr>"
   }
   arraystr += "</table>"
   document.getElementById("datalist").innerHTML = arraystr
   
   // add click-function to each remove-button
   for (var i=0;i<purchaselist.length;i++){
      $("#rb" + i).click({p1:i}, function removeItem(event){
         purchaselist.splice(event.data.p1, 1)
         updateView(dnow.getFullYear())
         localStorage.setItem("ctdata", JSON.stringify(purchaselist))
      });
   }
}

function generateRandomPurchase(selectioncount) {
   var rnddate = new Date()
   // scale a it later than from beginning of computertime (rand/4)+0.75
   rnddate.setTime(Math.round(rnddate.getTime()*((Math.random()/4)+0.75)))
   var rndprice = Math.floor((Math.random() * 100) + 1)
   var rndselection = Math.floor((Math.random() * selectioncount))
   return [rnddate, rndprice, rndselection]
}

function calcYearlySpendins(data, dnow){

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
      if (i == dnow.getFullYear()) {
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
return yearlyspendings;
}

function calcTotalSpending(data){
   // Calculate (and currently print) total spending for all products
   spending = 0;
   for (var i=0;i<data.length;i++){
      spending += data[i][1];
   }
   return spending
}

function timestring(dnow) {
   return dnow.getDate() + "." + (dnow.getMonth() + 1)  + "." + dnow.getFullYear()
}