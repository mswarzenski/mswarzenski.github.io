var margin = {top: 10, right: 20, bottom: 20, left: 20}
var w = 220;
var h = 280;

var legendcat = ["lived in", "been to", "to be visited!"];
var	parseDate = d3.time.format("%m").parse;
var formatTime = d3.time.format("%B");// Format tooltip date / time

var projection = d3.geo.albersUsa()
    .translate([w/1.8, h/1.4])
    .scale([1200]);

var path = d3.geo.path()
    .projection(projection);

var tip = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
		.style("opacity", 0);

/* scales */
var colors = d3.scale.ordinal()
	.domain(legendcat)
	.range(["#F45B69", "#456990", "#535353"])
var colors2 = d3.scale.ordinal()
	.range(["#e0a4a4", "#b37f7f", "#d9ecd0", "#77a8a8", "#b7d7e8"]);

var timelinexScale = d3.scale.linear()
		.domain([0,12])
	    .range([0,w]);
var timelineyScale = d3.scale.linear()
		.domain([2016, 1992])
	    .range([h,0]);

var countriesxScale = d3.scale.ordinal()
		.rangeRoundBands([0, w + margin.left], 0.01);
var countriesyScale = d3.scale.linear()
		.rangeRound([h, 0]);

/* axes */
var timelineyAxis = d3.svg.axis()
    .scale(timelineyScale)
    .orient("left")
    .ticks(25)
    .tickSize(0)
    .tickFormat(function(a) { return a; });

 var countriesxAxis = d3.svg.axis()
     .scale(countriesxScale)
     .ticks(25)
     .tickSize(0)
     .tickFormat(function(a) { return a; });

/* containers */
var map = d3.select("#map")
    .append("div")
    .attr("class", "map");

var timeline = d3.select("#timeline")
	.append("div")
	.attr("class", "timeline");

var countries = d3.select("#countries")
	.append("div")
	.attr("class", "countries");

/* svgs */
var mapsvg = map.append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom);

var timelinesvg = timeline.append("svg")
     .attr("width", w + margin.left + margin.right)
     .attr("height", h + margin.top + margin.bottom)
     .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

var countriessvg = countries.append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(0," + (-margin.top) + ")");;


/*------ DATA CALLBACKS ---------*/
d3.csv("data/states.csv", function(error, data) { //places lived
    if (error) return console.log(error);
    data.forEach (function(d) {
        d.visited = +d.visited;
        d.lived = +d.lived;
    })

    d3.json("data/state_squares.geojson", function(json) {
        for (var i=0; i < data.length; i++) {
            var state = data[i].state;
            var visited = data[i].visited;
            var lived = data[i].lived

            for (var j=0; j < json.features.length; j++) { //find the corresponding state inside the GeoJSON
                var jsonState = json.features[j].properties.name;

                if (state == jsonState) {
                    json.features[j].properties.visited = visited; //copy the data value into the JSON
                    json.features[j].properties.lived = lived; //copy the data value into the JSON
                    break;
                }
            }
        };

    mapsvg.selectAll("path")
        .data(json.features)
        .enter().append("path")
            .attr("class", function(d) { return "geomap " + d.properties.abbr; })
            .attr("d", path)
                .style("fill", function(d) { return (d.properties.lived==1) ? "#F45B69" : (d.properties.visited==1) ? "#456990" : "#535353"; })
                .classed("hover-state", function(d) { return (d.properties.visited==1) ? true : false; })
                .on("mouseover", mapmouseover)
                .on("mouseout", mouseout);
    });

    var legend = mapsvg.selectAll("g")
   	.data(legendcat)
   	.enter().append("g")
   		.attr("class", "legend")
     	.attr("transform", function(d,i) { return "translate(0," + (i*10+20) + ")"; });

	legend.append("rect")
   		.attr("width", 6)
   		.attr("height", 6)
   		.style("fill", colors);

	legend.append("text")
  		.data(legendcat)
	    .attr("x", 10)
    	.attr("y", 3)
    	.attr("dy", ".35em")
      		.text(function(d) { return d; });
});

d3.csv("data/timeline.csv", function(error, data) { //states visited
    if (error) return console.log(error);
    data.forEach (function(d) {
        d.year = +d.year;
        d.monthtext = formatTime(parseDate(d.month));
        d.month = +d.month;
    });

    colors2.domain(["San Francisco", "Annapolis", "St. Louis", "Auckland", "Baton Rouge"]);

    timelinesvg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(timelineyAxis)

    timelinesvg.selectAll("circle")
    	.data(data)
    	.enter().append("circle")
    	.attr("class", "timeline-circle")
    	.attr("cx", function(d) { return timelinexScale(d.month); })
    	.attr("cy", function(d) { return timelineyScale(d.year); })
    	.attr("r", 5)
    		.style("fill", function(d) { return colors2(d.city); })
    	.on("mouseover", livemouseover)
    	.on("mouseout", mouseout);
});

d3.csv("data/countries.csv", function(error, data) {
	if (error) return console.log(error);

	colors2.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

	data.forEach(function(d) {
	  var y0 = 0;
	  d.countries = colors2.domain().map(function(name) { return {name: name, year: d["year"], y0: y0, y1: y0 += +d[name]}; });
	  d.total = d.countries[d.countries.length - 1].y1;
	});

	countriesxScale.domain(data.map(function(d) { return d.year; }));
	countriesyScale.domain([0, d3.max(data, function(d) { return d.total; })+20]);

	countriessvg.append("g")
	     .attr("class", "x axis")
	     .attr("transform", "translate(0," + h + ")")
	     .call(countriesxAxis)
	     .selectAll("text")
	     .attr("y", 0)
	     .attr("x", 9)
	     .attr("dy", ".35em")
	     .attr("transform", "rotate(90)")
	     .style("text-anchor", "start");

	countriessvg.append("text") //large month label
	    .attr("id", "selected-text")
	    .attr("transform", "translate(10,40)")
	        .text("");

  countriessvg.append("text") //large month label
      .attr("id", "link-text")
      .attr("transform", "translate(10,55)")
          .text("");

	var year = countriessvg.selectAll(".year")
		.data(data)
		.enter().append("g")
			.attr("class", "g")
	    	.attr("transform", function(d) { return "translate(" + countriesxScale(d.year) + ",0)"; });

	year.selectAll("rect")
	    	.data(function(d) { return d.countries; })
	    .enter().append("rect")
			.attr("class", "country-rect")
			.attr("y", function(d) { return countriesyScale(d.y1); })
			.attr("width", countriesxScale.rangeBand())
			.attr("height", function(d) { return countriesyScale(d.y0) - countriesyScale(d.y1); })
      .style("cursor", function(d) { return (d.name == "New Zealand") ? "pointer" : "default"; })
			.on("mouseover", countrymouseover)
			.on("mouseout", mouseout)
      .on("click", click);


});


/*------ HELPER FUNCTIONS ---------*/
function mapmouseover(d) {
	tip.classed("maptip", true);
	tip.transition()
	    .style("opacity", 0.9);
	tip.html(d.properties.name)
	    .style("left", (d3.event.pageX) + "px")
	    .style("top", (d3.event.pageY - 15) + "px");

  d3.select(this).style("fill-opacity", "0.2")
}

function livemouseover(d) {
	tip.classed("livetip", true);
	tip.transition()
		.style("opacity", 0.9);
	tip.html("<b>" + d.monthtext + " " + d.year + "</b></br>" + d.city + ", " + d.state)
	    .style("left", (d3.event.pageX + 15) + "px")
	    .style("top", (d3.event.pageY - 15) + "px");



  d3.select(this).attr("r", 7);

}

function countrymouseover(d) {
	countriessvg.selectAll("#selected-text")
	    .text(d.year + ": " + d.name);

  d3.select(this).style("fill", "rgb(244, 91, 105)");

  if (d.name == "New Zealand") {
    countriessvg.selectAll("#link-text")
        .text("Click me!");
  }
}

function mouseout(d) {
	tip.transition()
		.duration(0)
		.style("opacity", 0);
	tip.attr("class", "tooltip");

  d3.select(this).style("fill-opacity", null);

	countriessvg.selectAll("#selected-text")
	    .text("");
  countriessvg.selectAll("#link-text")
      .text("");

  d3.selectAll(".country-rect").style("fill", null);
  d3.selectAll(".timeline-circle").attr("r", 5);

}

function click(d) {
  console.log(d.name)
  if (d.name == "New Zealand") {
    window.open(
      "https://nzmarie.wordpress.com/",
      '_blank'
    );
  }
}






