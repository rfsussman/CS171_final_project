// define legend ocntainer
const legendContainer = d3
    .select("#legend-container")
    .append("div")
    .attr("class", "legend")
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("justify-content", "space-around")
    .style("align-items", "center")
    .style("margin-bottom", "20px");

// initialize chronic conditions legend
const chronicLegend = legendContainer
    .append("div")
    .style("text-align", "center");

// add legend title
chronicLegend
    .append("h5")
    .text("Chronic Conditions")
    .style("margin-bottom", "10px");

// prepare to add legend items
const chronicLegendItems = chronicLegend
    .append("div")
    .style("display", "flex")
    .style("gap", "20px");

// add legend items
chronicLegendItems
    .selectAll(".chronic-item")
    .data(["Heart Disease", "Diabetes", "High Blood Pressure"])
    .enter()
    .append("div")
    .attr("class", "chronic-item")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    // for each legend item, make div and set text
    .each(function (d) {
        const item = d3.select(this);

        item.append("div")
            .style("width", "15px")
            .style("height", "15px")
            .style("background-color", chronicColor(d))
            .style("margin-bottom", "5px");

        item.append("span")
            .style("font-size", "14px")
            .text(d);
    });

// initialize medicare satisfaction levels legend
const satisfactionLegend = legendContainer
    .append("div")
    .style("text-align", "center");

// add legend title
satisfactionLegend
    .append("h5")
    .text("Satisfaction Levels")
    .style("margin-bottom", "10px");

// parepare to add legend items
const satisfactionLegendItems = satisfactionLegend
    .append("div")
    .style("display", "flex")
    .style("gap", "20px");

// add legend items
satisfactionLegendItems
    .selectAll(".satisfaction-item")
    .data(["Very Satisfied", "Satisfied", "Dissatisfied", "Very Dissatisfied"])
    .enter()
    .append("div")
    .attr("class", "satisfaction-item")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    // for each legend item, make div and set text
    .each(function (d) {
        const item = d3.select(this);

        item.append("div")
            .style("width", "15px")
            .style("height", "15px")
            .style("background-color", satisfactionColor(d))
            .style("margin-bottom", "5px");

        item.append("span")
            .style("font-size", "14px")
            .text(d);
    });
