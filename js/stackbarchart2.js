// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 90, left: 30 },
    width = 670 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_stack2 = d3.select("#stacked_bar2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");



svg_stack2.append("text")
    .attr("text-anchor", "end")
    .attr("x", width - 300)
    .attr("y", height + margin.top + 30)
    .text("Year");

// Y axis label:
svg_stack2.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top - 80)
    .text("Number of Students")

// Parse the Data
d3.csv("js/csv/processed/private_public_by_year_processed.csv", function (data) {
   
    var parsetime = d3.timeParse("%Y-%m-%d");
    data.forEach(function (d) {
        const sum = +d.private + parseFloat(d.public);
        d.year = parsetime(d.year);
        d.private_perc = +(parseFloat(d.private) / sum) * 100;
        d.public_perc = +(parseFloat(d.public) / sum) * 100;
        
    });
    data.forEach(function (d) {
        d.year = d.year.getFullYear();
    });

    console.log(data);

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = data.columns.slice(1)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.year) }).keys()

    const capitalized = subgroups.map(element => {
        return element.toUpperCase();
    });

    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
    svg_stack2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 200000000])
        .range([height, 0]);
    svg_stack2.append("g")
        .call(d3.axisRight(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['rgb(107,174,214)', "rgb(33,113,181)"])

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        (data)


    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#stacked_bar2")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        var PercentageToShow = d.data[subgroupName+'_perc'];
        
        tooltip
            .html(subgroupName + "<br>" + d3.format(".2s")(subgroupValue)+ "<br>" + "Percentage: " + d3.format("20.2s")(PercentageToShow)+'%')
            .style("opacity", 1)
    }
    var mousemove = function (d) {
        tooltip
            .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
    }

    // -------------
    // ADD LEGENDS
    //--------------
    // Add one dot in the legend for each name.
    var size = 10
    svg_stack2.selectAll("mydots")
        .data(capitalized)
        .enter()
        .append("rect")
        // .attr("transform", function (d, i) { return "translate(" + i * (100 / color.domain().length) + ",350)"; })
        .attr("x", 10)
        .attr("y", function (d, i) { return 355 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color(d) })
        

    // Add one dot in the legend for each name.
    svg_stack2.selectAll("mylabels")
        .data(capitalized)
        .enter()
        .append("text")
        // .attr("transform", function (d, i) { return "translate(" + i * (450 / color.domain().length) + ",350)"; })
        .attr("x", 10 + size * 1.2)
        .attr("y", function (d, i) { return 355 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    // Show the bars
    svg_stack2.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.data.year); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

})
