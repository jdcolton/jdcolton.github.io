var margin = 70;
var width = 1500;
var height = 750;
var radius = 3
var stroke_width = 2
var years = [1988, 1993, 1998, 2003, 2008]
var colors = ["black", "lightsteelblue", "blue", "grey", "purple"]
var screen_counter = 0
var red_count = 0
var green_count = 0

var x = d3.scaleLinear(10)
.domain([0,80000])
.range([0,width]);
                    
var y = d3.scaleLinear(10)
.domain([0,10000])
.range([height,0]);;

var svg = d3.select("body").append("svg")
svg.attr("width", width + 2*margin)
.attr("height", height + 2*margin)

d3.select("svg").append("g")
.attr("transform", "translate(" + margin + "," + margin + ")")
.call(d3.axisLeft(y))

d3.select("svg").append("g")
.attr("transform", "translate(" + margin + "," + (height + margin) + ")")
.call(d3.axisBottom(x))

d3.select("svg").append("g")
.append("text")             
.attr("transform", "translate(" + (width/2) + " ," + (height + 2*margin - 30) + ")")
.style("text-anchor", "middle")
.text("Group 10 income (2005 PPP)");

d3.select("svg").append("g")
.append("text")
.attr("transform", "rotate(-90)")
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.style("text-anchor", "middle")
.text("Group 1 income (2005 PPP)");

var div = d3.select("body").append("div")
.attr("class", "tooltip")
.attr("style", "position: absolute; opacity: 0;")

var data_file_name = 'https://raw.githubusercontent.com/jdcolton/jdcolton.github.io/master/inequality_data.csv'
var prior_year_dict = {}
var dataset

async function setup_data() {
    dataset = await d3.csv(data_file_name)
    plot_circles()
    update_yr_legend()
}

function plot_lines() {

    if(screen_counter > 1) { 
        svg.selectAll("line").style('opacity', 0)
    }

    var lines = svg.append("g")
    .attr("transform","translate(" + margin + "," + margin + ")")
    .selectAll()
    .data(dataset)
    .enter().append("line")
    .filter(function(d) { return d.Bin_year == years[screen_counter] })
    .filter(function(d) { return d.Country in prior_year_dict })
    .attr("x1", function(d, i) { return x(prior_year_dict[d.Country][0]) })
    .attr("y1", function(d, i) { return y(prior_year_dict[d.Country][1]) })
    .attr("x2", function(d, i) { return x(d.Group10) })
    .attr("y2", function(d, i) { return y(d.Group1) })
    .attr("stroke-width", stroke_width)
    .attr("stroke", function(d, i) { return color_line(d.Group1, d.Group10, prior_year_dict[d.Country][1], prior_year_dict[d.Country][0]) })
    .style("stroke-dasharray", ("3, 3"))
}

function color_line(y2, x2, y1, x1) {
    
    var ratio_change = x1/y1 - x2/y2

    if (ratio_change > 0) {
        green_count = green_count + 1
        return "green"
    }
    else {
        red_count = red_count + 1
        return "red"
    }
}

function plot_circles() {

    var circles = svg.append("g")
    .attr("transform","translate(" + margin + "," + margin + ")")
    .selectAll()
    .data(dataset)
    .enter().append("circle")
    .filter(function(d) { return d.Bin_year == years[screen_counter] })
    .attr("r", function(d, i) { prior_year_dict[d.Country] = [d.Group10, d.Group1]
        return radius })
    .attr("cx", function(d, i) { return x(d.Group10) })
    .attr("cy", function(d, i) { return y(d.Group1) })
    .style("fill", colors[screen_counter])
    
    ttip(circles)
}

function ttip(circles) {
    circles.on("mouseover", function(d) {
        div.transition()
        .duration(200)
        .style('opacity', 1)
        div.html(d.Country + " (" + d.Bin_year + ")" + "<br/> 10/10 ratio: " + (d.Group10/d.Group1).toFixed(2)) })
    .on('mousemove', function() {
        div.style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY + 10) + 'px') })
    .on("mouseout", function(d) {       
        div.transition()
        .duration(500)
        .style('opacity', 0) })
}

function update_yr_legend() {

    var yr_legend_svg = d3.selectAll("yr")
    .filter(function (d, i) { return i == screen_counter })
    .append("svg")
    .attr("width", 60)
    .attr("height", 30)

    yr_legend_svg.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .text(years[screen_counter])
    .style("font-size", "16px")
    .attr("alignment-baseline","middle")

    yr_legend_svg.append("circle")
    .attr("cx",10)
    .attr("cy",20)
    .attr("r", 8)
    .style("fill", colors[screen_counter])  
}

function populate_filter() {
    d3.select("#select")
    .selectAll('myOptions')
    .data(Object.keys(prior_year_dict).sort())
    .enter()
    .append('option')
    .text(function (d) { return d })
    .attr("value", function (d) { return d })
}

function filter_data() {

    var selected_country = d3.select("select").property("value")
    svg.selectAll("line").style('opacity', 0)
    svg.selectAll("circle").style('opacity', 0)
    .on("mouseover", function(d) {})
    .on("mousemove", function(d) {})
    .on("mouseout", function(d) {})

    filtered_circles = svg.selectAll("circle")
    .filter(function(d) { return d.Country == selected_country })
    .style('opacity', 1);
    svg.selectAll("line")
    .filter(function(d) { return d.Country == selected_country })
    .style('opacity', 1);

    ttip(filtered_circles)
}

function update_data() {
    screen_counter = screen_counter + 1
    if (screen_counter < 5) {
        plot_lines()
        plot_circles()
        update_yr_legend() 

        document.getElementById("year")
        .innerHTML = "Current Year: " + years[screen_counter];

        if (screen_counter == 4) {
            document.getElementById("button")
            .innerHTML = "Refresh browser to restart slideshow or select individual country:";
            populate_filter()
        }
    }
}

setup_data()