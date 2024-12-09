// initialize class for out-of-pocket distribution visualization
class OOPDistributionVis {
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
        vis.height = vis.width * 0.5 - vis.margin.top - vis.margin.bottom;

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

        // make axes
        vis.xAxis = vis.svg.append("g").attr("transform", `translate(0,${vis.height})`);
        vis.yAxis = vis.svg.append("g");

        // assign text to x axis
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .attr("font-size", "15px")
            .text("Out-of-Pocket Costs ($)");

        // assign text to y axis
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -50)
            .attr("font-size", "15px")
            .text("Frequency");

        // define tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // make event listeners that listen to filters
        d3.select("#genderFilter").on("change", () => vis.wrangleData());
        d3.select("#raceFilter").on("change", () => vis.wrangleData());

        // call wrangleData()
        vis.wrangleData();
    }

    wrangleData() {
        const vis = this;

        // retrieve selected filter values
        const selectedGender = d3.select("#genderFilter").property("value");
        const selectedRace = d3.select("#raceFilter").property("value");

        // filter data based on selected filters
        vis.filteredData = vis.data.filter(d => {
            const genderMatch = selectedGender === "all" || +d.CSP_SEX === (selectedGender === "male" ? 1 : 2);
            const raceMatch = selectedRace === "all" || +d.CSP_RACE === {
                white: 1,
                black: 2,
                hispanic: 3,
                other: 4
            }[selectedRace];
            return genderMatch && raceMatch;
        });

        // call updateVis()
        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // determine bar color based on selected gender
        const selectedGender = d3.select("#genderFilter").property("value");
        let barColor = "#FAC748"; // default color
        if (selectedGender === "female") {
            barColor = "#F7ACCF";
        } else if (selectedGender === "male") {
            barColor = "#99B2DD";
        }

        // initialize histogram bins
        const bins = d3.bin()
            .value(d => +d.PAMTOOP)
            .thresholds(20)(vis.filteredData);

        // update x and y scales
        vis.xScale.domain([0, d3.max(vis.filteredData, d => +d.PAMTOOP)]);
        vis.yScale.domain([0, d3.max(bins, d => d.length)]);

        // JOIN: bind data to rectangles
        const bars = vis.svg.selectAll(".bar").data(bins);

        // ENTER bars
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.xScale(d.x0))
            .attr("y", vis.height) // start at the bottom of the chart
            .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
            .attr("height", 0) // start with zero height (no lie factor)
            .style("fill", barColor)
            .on("mouseover", (event, d) => {
                vis.tooltip.transition().duration(200).style("opacity", 1);
                // match tooltip style across visualizations
                vis.tooltip.html(`
            <div style="border: 1px solid black; border-radius: 5px; background: white; padding: 10px; font-size: 14px; font-family: sans-serif; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);">
                <strong>Range:</strong> ${d.x0.toFixed(2)} - ${d.x1.toFixed(2)}<br>
                <strong>Frequency:</strong> ${d.length}
            </div>
        `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", (event) => {
                vis.tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", () => {
                vis.tooltip.transition().duration(200).style("opacity", 0);
            })
            .merge(bars) // ENTER + UPDATE bars
            .transition()
            .duration(1000)
            .attr("x", d => vis.xScale(d.x0))
            .attr("y", d => vis.yScale(d.length))
            .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
            .attr("height", d => vis.height - vis.yScale(d.length))
            .style("fill", barColor);

        // EXIT bars
        bars.exit()
            .transition()
            .duration(1000)
            .attr("y", vis.height)
            .attr("height", 0)
            .remove();

        // add bars labels
        const labels = vis.svg.selectAll(".bar-label").data(bins);

        // ENTER labels
        labels.enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => vis.xScale(d.x0) + (vis.xScale(d.x1) - vis.xScale(d.x0)) / 2)
            .attr("y", vis.height) // Start at the bottom
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", "12px")
            .text(d => d.length)
            .merge(labels) // ENTER + UPDATE labels
            .transition()
            .duration(1000)
            .attr("x", d => vis.xScale(d.x0) + (vis.xScale(d.x1) - vis.xScale(d.x0)) / 2)
            .attr("y", d => vis.yScale(d.length) - 5) // Position above the bar
            .text(d => d.length);

        // EXIT labels
        labels.exit().remove();

        // update axes
        vis.xAxis.transition().duration(1000).call(d3.axisBottom(vis.xScale));
        vis.yAxis.transition().duration(1000).call(d3.axisLeft(vis.yScale));
    }

    resizeVis() {
        const vis = this;

        // update visualization dimensions
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = vis.width * 0.5 - vis.margin.top - vis.margin.bottom;

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
