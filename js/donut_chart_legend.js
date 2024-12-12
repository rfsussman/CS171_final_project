class DonutChartLegend {
    constructor(container, chronicColor, satisfactionColor) {
        this.container = container;
        this.chronicColor = chronicColor;
        this.satisfactionColor = satisfactionColor;

        this.initLegend();
    }

    initLegend() {
        const self = this;

        // legend container
        const legendContainer = d3.select(self.container)
            .append("div")
            .attr("class", "legend")
            .style("display", "flex")
            .style("flex-direction", "row")
            .style("justify-content", "space-around")
            .style("align-items", "center")
            .style("margin-bottom", "20px");

        // chronic conditions Legend
        const chronicLegend = legendContainer
            .append("div")
            .style("text-align", "center");

        chronicLegend
            .append("h5")
            .text("Chronic Conditions")
            .style("margin-bottom", "10px");

        const chronicLegendItems = chronicLegend
            .append("div")
            .style("display", "flex")
            .style("gap", "20px");

        chronicLegendItems
            .selectAll(".chronic-item")
            .data(["Heart Disease", "Diabetes", "High Blood Pressure"])
            .enter()
            .append("div")
            .attr("class", "chronic-item")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .each(function (d) {
                const item = d3.select(this);

                item.append("div")
                    .style("width", "15px")
                    .style("height", "15px")
                    .style("background-color", self.chronicColor(d))
                    .style("margin-bottom", "5px");

                item.append("span")
                    .style("font-size", "14px")
                    .text(d);
            });

        // medicare satisfaction levels legend
        const satisfactionLegend = legendContainer
            .append("div")
            .style("text-align", "center");

        satisfactionLegend
            .append("h5")
            .text("Medicare Satisfaction Levels")
            .style("margin-bottom", "10px");

        const satisfactionLegendItems = satisfactionLegend
            .append("div")
            .style("display", "flex")
            .style("gap", "20px");

        satisfactionLegendItems
            .selectAll(".satisfaction-item")
            .data(["Very Satisfied", "Satisfied", "Dissatisfied", "Very Dissatisfied"])
            .enter()
            .append("div")
            .attr("class", "satisfaction-item")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .each(function (d) {
                const item = d3.select(this);

                item.append("div")
                    .style("width", "15px")
                    .style("height", "15px")
                    .style("background-color", self.satisfactionColor(d))
                    .style("margin-bottom", "5px");

                item.append("span")
                    .style("font-size", "14px")
                    .text(d);
            });
    }
}

const chronicColor = d3.scaleOrdinal()
    .domain(["Diabetes", "Heart Disease", "High Blood Pressure"])
    .range(["#F78154", "#0075C4", "#4C3B4D"]);

const satisfactionColor = d3.scaleOrdinal()
    .domain(["Very Satisfied", "Satisfied", "Dissatisfied", "Very Dissatisfied"])
    .range(["#28a745", "#85C66F", "#dc3545", "#8B0000"]);

const legend = new DonutChartLegend("#legend-container", chronicColor, satisfactionColor);