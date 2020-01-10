function linechart (selector, datapoints, width, height, margins, radius, on_click) {

   var inner_height = height - margins.top-margins.bottom
   var inner_width = width - margins.left-margins.right

   // format all previous graphs
   d3.select(selector).html("")

   var svg = d3.select(selector).append("svg")
               .attr("height", height)
               .attr("width", width)

   // make a group which has this transform
   var g = svg.append("g")
               .attr("transform", "translate(" + margins.left + "," + margins.top + ")")

   // min and max of range
   var extent_x = d3.extent(datapoints, function (d) { return d.x})
   var extent_y = d3.extent(datapoints, function (d) { return d.y})

   var scalex = d3.scaleLinear()
                  .domain(extent_x) // data space
                  .range([0, inner_width]) // pixel space

   var ymax = d3.max(datapoints, function(d) {return d.y;})

   var scaley = d3.scaleLinear()
                  .domain([0, ymax*1.3]) // add a bit to ymax to leave some empty on top (was ymax)
                  .range([inner_height, 0]) // here invert y-axis

   // make axes (add one group for each axis to g)
   g.append("g")
      .call(d3.axisLeft(scaley))
   g.append("g")
      .attr("transform", "translate(0," + inner_height + ")")
      .call(d3.axisBottom(scalex))

   
   var linegenerator = d3.line()
                         .x(function (d){ return scalex(d.x)})
                         .y(function (d){ return scaley(d.y)})

   g.append('svg:path')
   .attr('d', linegenerator(datapoints))
   .attr('stroke', "#6495ED")
   .attr('stroke-width', 2)
   .attr('fill', 'none');

   g.selectAll("circle").data(datapoints)
   .enter().append("circle")
   .attr("r", radius)
   .attr("cx", (d)=>{ return scalex(d.x)})
   .attr("cy", (d)=>{ return scaley(d.y)})
   .on("click", on_click)
}

function bubblechart(selector, datapoints, width, height) {
   // make a bubble chart d3 visualization
   // datapoints: id, r

   // format all previous graphs
   d3.select(selector).html("")

   var svg = d3.select(selector).append("svg")
               .attr("height", height)
               .attr("width", width)
               .attr("viewBox", [0, 0, width, height])

   var colors = d3.schemePastel2

   var circles = svg.selectAll("circle")
               .data(datapoints)
               .enter().append("circle")
               .attr("cx", 0)
               .attr("cy", 0)
               .attr("r", function (d) { return d.r })
               .style("fill", function (d, i) {
                  return colors[i]
               });

   var texts = svg.selectAll("texts")
               .data(datapoints)
               .enter().append("text")
               .text(function (d) {
                  return d.id;
               })
               .attr("text-anchor", "middle")

   var simulation = d3.forceSimulation()
      .force("x", d3.forceX(width/2).strength(0.05))
      .force("y", d3.forceY(height/2).strength(0.05))
      .force("collide", d3.forceCollide(function(d) {
         return d.r + 1;
      }))

   simulation.nodes(datapoints)
      .on("tick", ticked)

   function ticked() {
      circles
         .attr("cx", function(d) {
            return d.x
         })
         .attr("cy", function(d) {
            return d.y
         })

      texts
         .attr("x", function (d) {
            return d.x
         })
         .attr("y", function (d) {
            return d.y
         })
   }
}