var currencyTraffic = function (canvasid) {

   if (typeof(Storage) !== "undefined") {
      // Code for localStorage/sessionStorage.
    } else {
      return $(canvasid).append("Sorry! Your browser has no Web Storage support..")
    }

   // generate site structure, add elements to canvas
   $(canvasid).append("<h1>Currency traffic <div id=\"time\" class=\"inlineitem\"></div></h1>");
   $(canvasid).append("<button class=\"section_toggle\" id=\"newpb\">New purchase +</button><br>");
   $(canvasid).append("<div id=\"newp_wrapper\">Name <input type=\"text\" id=\"purchase\" size=\"15\">" +
                    " Price <input type=\"text\" id=\"price\" size=\"7\"><br>Type:" +
                    "<select id=\"selection\"></select>" +
                    " <button id=\"addbutton\">Add</button>" +
                    " <button id=\"randombutton\">Add 100 random purchases</button></div>");
   $(canvasid).append("<button class=\"section_toggle\" id=\"statsb\">Statistics +</button><br>");
   $(canvasid).append("<div id=\"stats_wrapper\">" +
                     "<p id=\"spending\"></p><p id=\"categoryspending\"></p></div>");
   $(canvasid).append("<button class=\"section_toggle\" id=\"chartsb\">Charts +</button><br>");
   $(canvasid).append("<div id=\"charts_wrapper\" class=\"charts\">" +
                      "<div id=\"chart\" class=\"chart\"></div>" +
                      "<div id=\"chart2\" class=\"chart\"></div>" +
                      "<div id=\"chart3\" class=\"chart\"></div></div>")
   $(canvasid).append("<button class=\"section_toggle\" id=\"purchaselistb\">Purchases +</button><br>");                      
   $(canvasid).append("<div id=\"datalist\"></div>")
   $(canvasid).append("<button class=\"section_toggle\" id=\"cleardatab\">Clear data +</button>");
   $(canvasid).append("<div id=\"cleardata_wrapper\" class=\"hiddendiv\">Are you sure? All data will be removed permanently " +
                      "<button id=\"data_final_rmb\">Clear all</button></div>");

   if (typeof(window.localStorage.ctdata) === "undefined") {
      // check if browser localstorage has data variable
      localStorage.setItem("ctdata", JSON.stringify([]))
      var data = []
   } else {
      var data_string = JSON.parse(localStorage.getItem("ctdata"))
       data = []
       data_string.forEach(element => {
          // this is done because some elements might need processing (date e.g.)
          data.push([element[0], element[1], element[2], new Date(element[3])])
       })
   }

   // var show_partials_buttons = {"#chartsb":["#charts_wrapper", 1],
   //                              "#newpb":["#newp_wrapper", 1],
   //                              "#statsb": ["#stats_wrapper", 1],
   //                              "#purchaselistb": ["#datalist", 1],
   //                              "#cleardatab":["#cleardata_wrapper", 1]
   //                            }

   // if (typeof(window.localStorage.ct_show_options) === "undefined") {
   //    // first time in site
   //    localStorage.setItem("ctdata", JSON.stringify({}))
   // }

   var dnow = new Date()
   var monthnames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

   var options = ["food", "service", "leisure", "item", "rent", "insurance"]
   $("#time").text(timestring(dnow))

   // generate selections for different categories
   addSelections(options)

   // load google charts
   google.charts.load('current', {'packages':['corechart']})
   google.charts.setOnLoadCallback(googlec_loaded)

   function googlec_loaded() {
      // if data exists at this point, calc and draw statistics
      if (data.length > 0) {
         updateView(dnow.getFullYear())
      }
   }
   
   //document.getElementById("newp").style.cursor = "pointer"; 
   $("#newpb").click(() => {
      toggle_div("#newp_wrapper")
   })

   $("#statsb").click(() => {
      toggle_div("#stats_wrapper")
   })

   // button callbacks
   $("#chartsb").click(() => {
      toggle_div("#charts_wrapper")
      // this updateview not necessarily needed but it is here to combat the
      // google charts bug that messes up drawing options if drawing to a
      // div that is hidden and then revealed
      updateView(dnow.getFullYear())
   })

   $("#purchaselistb").click(() => {
      toggle_div("#datalist")
   })

   $("#cleardatab").click(() => {
      toggle_div("#cleardata_wrapper")
   })

   function toggle_div (id) {
      $(id).toggle(300)
   }

   $("#data_final_rmb").click(() => {
      localStorage.removeItem("ctdata")
      data = []
      updateView(dnow.getFullYear())
      toggle_div("#rmdata_wrapper")
   })


   $("#addbutton").click(function validateForm() {
      ptime = new Date()
      purchase = $("#purchase").val()
      price = parseInt($("#price").val())
      selection = document.getElementById("selection")["value"]

      // format datafields -> faster for user to put next item
      $("#purchase").val("")
      $("#price").val("")

      addPurchase(purchase, price, selection, ptime)
      updateView(dnow.getFullYear())
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
   
   function updateView(year){
      // this function updates the view, recalculates all too
      printPurchases(data)
      document.getElementById("spending").innerHTML = "Total: " + calcTotalSpending(data)
         
      spendingstr = "";
      if (data.length > 0) {
            var categoryspendings = calcCategorySpendings(data)
            var monthlyspendings = calcYearlySpendins(data, dnow)
            printCharts(categoryspendings, monthlyspendings, year)

            // form categorical spending string
            for (var i=0;i<options.length;i++){
            spendingstr += options[i] + ": " + categoryspendings[i] + " "
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
      var d = [['Category', 'Spending on category']]
      for (var i = 0; i < options.length; i++){
         d.push([options[i], categoryspendings[i]])
      }
      
      // parse monthlyspendings for selected year
      var monthlyspendings = yearlyspendings[year]
      var d2 = [["month", "spending"]]
      for (var key in monthlyspendings) {
         d2.push([monthnames[key], monthlyspendings[key]]) //parseInt(Number(key)+1)
      }
      
      // parse yearlyspendings
      var yearlyspending = 0
      var d3 = [["year", "spending"]]
      for (var key in yearlyspendings) {
         // loop and sum all monthly spendings across year
         for (var mkey in yearlyspendings[key]) {
            yearlyspending += yearlyspendings[key][mkey]
         }
         d3.push([key, yearlyspending])
         yearlyspending = 0
      }
      
      var piedata = google.visualization.arrayToDataTable(d)
      var monthlydata = google.visualization.arrayToDataTable(d2)
      var yearlydata = google.visualization.arrayToDataTable(d3)
      
      var chart = new google.visualization.PieChart(document.getElementById('chart'))
      var chart2 = new google.visualization.LineChart(document.getElementById('chart2'))
      var chart3 = new google.visualization.LineChart(document.getElementById('chart3'))

      function selectYear() {
         // when user selects year set draw that years monthly graph
         var item = chart3.getSelection()[0]
         var year = d3[item.row+1][0]
         updateView(year)
      }

      chart.draw(piedata, {title: 'Categorical spending', chartArea:{width: '100%', height: '75%'}})
      chart2.draw(monthlydata, {title: 'Monthly spending in ' + Number(year), chartArea:{width: '90%', height: '75%'}})
      chart3.draw(yearlydata, {title: 'Spending by year', chartArea:{width: '90%', height: '75%'}})
      google.visualization.events.addListener(chart3, 'select', selectYear)
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
         arraystr += purchaselist[i][1]
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
      rnddate.setTime(Math.round(rnddate.getTime()*Math.random()))
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
         spending += parseInt(data[i][1]);
      }
      return spending
   }

   function timestring(dnow) {
      return dnow.getDate() + "." + (dnow.getMonth() + 1)  + "." + dnow.getFullYear()
   }
}