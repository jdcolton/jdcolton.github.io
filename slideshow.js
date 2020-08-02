var margin = 70;
var width = 1500;
var height = 1000;
var radius = 3
var stroke_width = 2
var years = [1988, 1993, 1998, 2003, 2008]
var colors = ["black", "purple", "blue", "grey", "black"]
var screen_counter = 0

var x = d3.scaleLinear(10)
.domain([0,75000])
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

var legend = d3.select("legend").append("svg")
.attr("width", margin)
.attr("height", margin)

var data_file_name = 'https://raw.githubusercontent.com/jdcolton/cs498/master/inequality_data.csv'
var prior_year_dict = {}
var dataset

async function setup_data() {
    dataset = await d3.csv(data_file_name)
    plot_circles()
}

function plot_lines() {

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
    
    if ((y2 - y1) / Math.abs(x2 - x1) >= 0 ) {
        return "green"
    }
    else {
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

    circles.on("mouseover", function(d) {      
        div.transition()
        .duration(200)
        .style('opacity', 1)
        div.html(d.Country + "<br/> Group 10 Income: " + d.Group10 + "<br/> Group 1  Income: " + d.Group1) })
    .on('mousemove', function() {
        div.style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY + 10) + 'px') })
    .on("mouseout", function(d) {       
        div.transition()
        .duration(500)
        .style('opacity', 0) })
}

function update_legend() {
    legend.append("circle").attr("cx",200).attr("cy",30).attr("r", 6).style("fill", "black")
    legend.append("circle").attr("cx",300).attr("cy",30).attr("r", 6).style("fill", "blue")
    legend.append("text").attr("x", 220).attr("y", 30).text("1988").style("font-size", "15px").attr("alignment-baseline","middle")
    legend.append("text").attr("x", 320).attr("y", 30).text("1993").style("font-size", "15px").attr("alignment-baseline","middle")
}

function update_data() {
    screen_counter = screen_counter + 1
    if (screen_counter < 5) {
        plot_lines()
        plot_circles()

        console.log(screen_counter)
        document.getElementById("year").innerHTML = "Current Year: " + years[screen_counter];
        
        if (screen_counter == 4) {
                document.getElementById("button").innerHTML = "Refresh browser to restart slideshow";
        }
    }
}

setup_data()
update_legend()
