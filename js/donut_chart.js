class DonutChart {
    constructor(parentElement, dataFile) {
        this.parentElement = parentElement;
        this.dataFile = dataFile;
        this.width = 300;
        this.height = 300;
        this.ringThickness = 20;
        this.maxRadius = 100;

        this.chronicColor = d3.scaleOrdinal()
            .domain(["Diabetes", "Heart Disease", "High Blood Pressure"])
            .range(["#F78154", "#0075C4", "#4C3B4D"]);

        this.satisfactionColor = d3.scaleOrdinal()
            .domain(["Very Satisfied", "Satisfied", "Dissatisfied", "Very Dissatisfied"])
            .range(["#28a745", "#85C66F", "#dc3545", "#8B0000"]);

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("font-size", "14px");

        this.initVis();
    }

    initVis() {
        let vis = this;

        // load & process data
        d3.csv(vis.dataFile).then(data => {
            vis.rawData = data;
            vis.wrangleData();
        });
    }

    wrangleData() {
        let vis = this;

        // process data
        const groupedData = d3.group(vis.rawData, d => d.DEM_RACE);

        vis.processedData = Array.from(groupedData, ([ethnicity, rows]) => {
            const chronicConditions = [
                { condition: "Heart Disease", value: vis.calculateProportion(rows, "Heart_Disease", "Yes") },
                { condition: "Diabetes", value: vis.calculateProportion(rows, "HLT_OCBETES", "Yes") },
                { condition: "High Blood Pressure", value: vis.calculateProportion(rows, "High_Blood_Pressure", "Yes") },
            ];

            const satisfaction = [
                { level: "Very Satisfied", value: vis.calculateProportion(rows, "Medicare_Satisfaction", "Very Satisfied") },
                { level: "Satisfied", value: vis.calculateProportion(rows, "Medicare_Satisfaction", "Satisfied") },
                { level: "Dissatisfied", value: vis.calculateProportion(rows, "Medicare_Satisfaction", "Dissatisfied") },
                { level: "Very Dissatisfied", value: vis.calculateProportion(rows, "Medicare_Satisfaction", "Very Dissatisfied") },
            ];

            return { ethnicity, chronicConditions, satisfaction };
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // add on each of the 4 charts
        const container = d3
            .select(vis.parentElement)
            .selectAll(".chart")
            .data(vis.processedData)
            .enter()
            .append("div")
            .attr("class", "chart")
            .style("text-align", "center");

        container.append("h4")
            .text(d => d.ethnicity)
            .style("margin-bottom", "10px");

        const svg = container.append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr("transform", `translate(${vis.width / 2}, ${vis.height / 2})`);

        svg.each(function (data) {
            const g = d3.select(this);
            const chronicConditions = data.chronicConditions;
            const startingRadius = vis.maxRadius - vis.ringThickness * (chronicConditions.length + 1);

            // draw inner chronic condition rings
            chronicConditions.forEach((condition, index) => {
                const arc = d3.arc()
                    .innerRadius(startingRadius + index * vis.ringThickness)
                    .outerRadius(startingRadius + (index + 1) * vis.ringThickness)
                    .startAngle(0)
                    .endAngle((condition.value / 100) * 2 * Math.PI);

                g.append("path")
                    .attr("d", arc)
                    .attr("fill", vis.chronicColor(condition.condition))
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5)
                    .on("mouseover", (event) => {
                        vis.tooltip
                            .style("opacity", 1)
                            .style("left", event.pageX + 10 + "px")
                            .style("top", event.pageY + "px")
                            .html(
                                `<strong>${condition.condition}</strong><br>Value: ${condition.value.toFixed(2)}%`
                            );
                    })
                    .on("mousemove", (event) => {
                        vis.tooltip
                            .style("left", event.pageX + 10 + "px")
                            .style("top", event.pageY + "px");
                    })
                    .on("mouseout", () => {
                        vis.tooltip.style("opacity", 0);
                    });
            });

            // draw outer rings for satisfaction levels of medicare
            const satisfactionData = data.satisfaction;
            const satisfactionInnerRadius = vis.maxRadius - vis.ringThickness;
            const satisfactionOuterRadius = vis.maxRadius;

            const arcOuter = d3.arc()
                .innerRadius(satisfactionInnerRadius)
                .outerRadius(satisfactionOuterRadius);

            const pie = d3.pie()
                .value(d => d.value)
                .sort(null);

            g.selectAll(".satisfaction-ring")
                .data(pie(satisfactionData))
                .enter()
                .append("path")
                .attr("d", arcOuter)
                .attr("fill", d => vis.satisfactionColor(d.data.level))
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .on("mouseover", (event, d) => {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + "px")
                        .html(
                            `<strong>${d.data.level}</strong><br>Value: ${d.data.value.toFixed(2)}%`
                        );
                })
                .on("mousemove", (event) => {
                    vis.tooltip
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + "px");
                })
                .on("mouseout", () => {
                    vis.tooltip.style("opacity", 0);
                });
        });
    }

    calculateProportion(rows, column, value) {
        const total = rows.length;
        const count = rows.filter(row => row[column] === value).length;
        return (count / total) * 100;
    }
}

const chart = new DonutChart("#donut-charts", "data/ricardo_data_cleaned.csv");
