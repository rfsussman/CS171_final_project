// dimensions
const width = 300;
const height = 300;
const ringThickness = 20;
const maxRadius = 100;

// colors for chronic conditions and satisfaction levels
const chronicColor = d3.scaleOrdinal()
    .domain(["Diabetes", "Heart Disease", "High Blood Pressure"])
    .range(["#235789", "#AC9FBB", "#5A1807"]);

const satisfactionColor = d3.scaleOrdinal()
    .domain(["Very Satisfied", "Satisfied", "Dissatisfied", "Very Dissatisfied"])
    .range(["#28a745", "#85C66F", "#dc3545", "#8B0000"]);

// set up tooltip
const tooltip = d3.select("body")
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

// load csv and process data
d3.csv("data/ricardo_data_cleaned.csv").then(data => {
    // process data into the required format
    const ethnicityData = processData(data);

    // append charts for each ethnicity
    const container = d3
        .select("#donut-charts")
        .selectAll(".chart")
        .data(ethnicityData)
        .enter()
        .append("div")
        .attr("class", "chart")
        .style("text-align", "center");

    container.append("h4")
        .text(d => d.ethnicity)
        .style("margin-bottom", "10px");

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // draw inner rings for chronic conditions
    svg.each(function (data) {
        const g = d3.select(this);
        const chronicConditions = data.chronicConditions;

        // dynamically calculate the starting radius
        const startingRadius = maxRadius - ringThickness * (chronicConditions.length + 1);

        chronicConditions.forEach((condition, index) => {
            const arc = d3.arc()
                .innerRadius(startingRadius + index * ringThickness)
                .outerRadius(startingRadius + (index + 1) * ringThickness)
                .startAngle(0)
                .endAngle((condition.value / 100) * 2 * Math.PI);

            g.append("path")
                .attr("d", arc)
                .attr("fill", chronicColor(condition.condition))
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .on("mouseover", (event) => {
                    tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + "px")
                        .html(
                            `<strong>${condition.condition}</strong><br>Value: ${condition.value.toFixed(2)}%`
                        );
                })
                .on("mousemove", (event) => {
                    tooltip
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + "px");
                })
                .on("mouseout", () => {
                    tooltip.style("opacity", 0);
                });
        });
    });

    // draw outer rings for medicare satisfaction
    svg.each(function (data) {
        const g = d3.select(this);
        const satisfactionData = data.satisfaction;

        const satisfactionInnerRadius = maxRadius - ringThickness;
        const satisfactionOuterRadius = maxRadius;

        const arcOuter = d3.arc()
            .innerRadius(satisfactionInnerRadius)
            .outerRadius(satisfactionOuterRadius);

        const pie = d3
            .pie()
            .value(d => d.value)
            .sort(null);

        g.selectAll(".satisfaction-ring")
            .data(pie(satisfactionData))
            .enter()
            .append("path")
            .attr("d", arcOuter)
            .attr("fill", d => satisfactionColor(d.data.level))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + "px")
                    .html(
                        `<strong>${d.data.level}</strong><br>Value: ${d.data.value.toFixed(2)}%`
                    );
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    });
});

// process csv data into a usable format
function processData(data) {
    // group data by ethnicity
    const grouped = d3.group(data, d => d.DEM_RACE);

    return Array.from(grouped, ([ethnicity, rows]) => {
        // calculate chronic condition proportions
        const chronicConditions = [
            { condition: "Diabetes", value: calculateProportion(rows, "HLT_OCBETES") },
            { condition: "Heart Disease", value: calculateProportion(rows, "Heart_Disease") },
            { condition: "High Blood Pressure", value: calculateProportion(rows, "High_Blood_Pressure") },
        ];

        // calculate medicare satisfaction proportions
        const satisfaction = [
            { level: "Very Satisfied", value: calculateProportion(rows, "Medicare_Satisfaction", "Very Satisfied") },
            { level: "Satisfied", value: calculateProportion(rows, "Medicare_Satisfaction", "Satisfied") },
            { level: "Dissatisfied", value: calculateProportion(rows, "Medicare_Satisfaction", "Dissatisfied") },
            { level: "Very Dissatisfied", value: calculateProportion(rows, "Medicare_Satisfaction", "Very Dissatisfied") },
        ];

        return { ethnicity, chronicConditions, satisfaction };
    });
}

// calculate proportions for a specific column
function calculateProportion(rows, column, value) {
    const total = rows.length;
    const count = rows.filter(row => row[column] === value).length;
    return (count / total) * 100;
}
