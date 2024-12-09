// initialize class for out-of-pocket scatter plot visualization
class OOPScatterVis {
    constructor(_parentElement, _data) {
        // define parentElement and data based on class inputs
        this.parentElement = _parentElement;
        this.data = _data;

        // call initVis()
        this.initVis();
    }

    initVis() {
        const vis = this;

        // define margins and initial dimensions
        vis.margin = { top: 50, right: 150, bottom: 50, left: 100 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = vis.width * 0.6 - vis.margin.top - vis.margin.bottom;

        // initialize SVG container
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // make scales
        vis.xScale = d3.scaleLinear().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);

        // set up axes
        vis.xAxis = d3.axisBottom(vis.xScale).tickFormat(d3.format("$,.0f"));
        vis.yAxis = d3.axisLeft(vis.yScale).tickFormat(d3.format("$,.0f"));

        // make axes
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis");

        // assign text to x axis
        vis.svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .attr("font-size", "15px")
            .text("Total Payments ($)");

        // assign text to y axis
        vis.svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -60)
            .attr("font-size", "15px")
            .text("Out-of-Pocket Payments ($)");

        // add legend group
        vis.legendGroup = vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("font-size", "14px")
            .attr("transform", `translate(${vis.width - 100}, 20)`);

        // define legend color scale
        vis.legendColorScale = d3.scaleOrdinal()
            .domain(["< $25,000", ">= $25,000"])
            .range(["#FAC748", "#9FD356"]);

        // define tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // call wrangleData()
        vis.wrangleData();
    }

    wrangleData() {
        const vis = this;

        // retrieve selected filter values
        const selectedIncome = d3.select("#incomeFilter").property("value");

        // filter data based on selected filters
        vis.filteredData = vis.data.filter(d => {
            if (selectedIncome === "all") return true;
            if (selectedIncome === "<25000") return d.CSP_INCOME === 1; // Income < $25,000
            if (selectedIncome === ">=25000") return d.CSP_INCOME === 2; // Income >= $25,000
        });

        // call updateVis()
        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // update scales
        vis.xScale.domain([0, d3.max(vis.filteredData, d => +d.PAMTTOT)]);
        vis.yScale.domain([0, d3.max(vis.filteredData, d => +d.PAMTOOP)]);

        // JOIN: Bind data
        const circles = vis.svg.selectAll(".circle")
            .data(vis.filteredData, d => d.PUF_ID);

        // ENTER
        circles.enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", d => vis.xScale(+d.PAMTTOT))
            .attr("cy", vis.height) // start at the bottom
            .attr("r", 4)
            .style("fill", d => d.CSP_INCOME === 1 ? "#FAC748" : "#9FD356") // Color by income
            .style("opacity", 0.7)
            .on("mouseover", (event, d) => {
                // highlight the hovered point
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("r", 8) // increase size when hovered over
                    .style("stroke", "black")
                    .style("stroke-width", 2);

                // show tooltip
                vis.tooltip.transition().duration(200).style("opacity", 1);
                // match tooltip style across visualizations
                vis.tooltip.html(
                    `<strong>Total Payments:</strong> $${d.PAMTTOT.toLocaleString()}<br>
                     <strong>Out-of-Pocket:</strong> $${d.PAMTOOP.toLocaleString()}`
                )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                // unhighlight after mousover ends
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("r", 4) // Reset size
                    .style("stroke", "none");

                // hide tooltip
                vis.tooltip.transition().duration(200).style("opacity", 0);
            })
            .merge(circles) // ENTER + UPDATE
            .transition()
            .duration(1000)
            .attr("cx", d => vis.xScale(+d.PAMTTOT))
            .attr("cy", d => vis.yScale(+d.PAMTOOP));

        // EXIT: remove circles not in filtered data
        circles.exit()
            .transition()
            .duration(1000)
            .attr("cy", vis.height)
            .remove();

        // update axes
        vis.svg.select(".x-axis").transition().duration(1000).call(vis.xAxis);
        vis.svg.select(".y-axis").transition().duration(1000).call(vis.yAxis);

        // update legend
        const legend = d3.legendColor()
            .scale(vis.legendColorScale)
            .title("Income Group")
            .shape("circle")
            .shapeRadius(6)
            .shapePadding(10)
            .labelOffset(10);

        // call legend
        vis.legendGroup.call(legend);
    }

    resizeVis() {
        const vis = this;

        // update visualization dimensions
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = vis.width * 0.6 - vis.margin.top - vis.margin.bottom;

        // update SVG dimensions
        d3.select(`#${vis.parentElement} svg`)
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        // update scales
        vis.xScale.range([0, vis.width]);
        vis.yScale.range([vis.height, 0]);

        // update axes and visualization
        vis.updateVis();
    }
}

