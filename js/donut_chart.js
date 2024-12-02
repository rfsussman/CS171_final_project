// SAMPLE DATA (NEED TO HOOK UP TO REAL DATA LAST)
const ethnicityData = [
    {
        ethnicity: "Black",
        chronicConditions: [
            { condition: "Diabetes", value: 41 },
            { condition: "Heart Disease", value: 13 },
            { condition: "High Blood Pressure", value: 75 },
        ],
        satisfaction: [
            { level: "Satisfied", value: 70 },
            { level: "Neutral", value: 20 },
            { level: "Dissatisfied", value: 10 },
        ],
    },
    {
        ethnicity: "Hispanic",
        chronicConditions: [
            { condition: "Diabetes", value: 43 },
            { condition: "Kidney Failure", value: 9 },
            { condition: "High Blood Pressure", value: 65 },
        ],
        satisfaction: [
            { level: "Satisfied", value: 60 },
            { level: "Neutral", value: 30 },
            { level: "Dissatisfied", value: 10 },
        ],
    },
    {
        ethnicity: "White",
        chronicConditions: [
            { condition: "Diabetes", value: 27 },
            { condition: "Kidney Failure", value: 10 },
            { condition: "High Blood Pressure", value: 39 },
        ],
        satisfaction: [
            { level: "Satisfied", value: 80 },
            { level: "Neutral", value: 15 },
            { level: "Dissatisfied", value: 5 },
        ],
    },
    {
        ethnicity: "Other",
        chronicConditions: [
            { condition: "Diabetes", value: 35 },
            { condition: "Kidney Failure", value: 25 },
            { condition: "High Blood Pressure", value: 40 },
        ],
        satisfaction: [
            { level: "Satisfied", value: 50 },
            { level: "Neutral", value: 35 },
            { level: "Dissatisfied", value: 15 },
        ],
    },
];

// donut chart dimensions
const width = 300;
const height = 300;
const ringThickness = 20;
const maxRadius = 100; //no ring will have a larger radius than this

// donut chart scales
const chronicColor = d3.scaleOrdinal()
    .domain(["Kidney Failure", "Diabetes", "High Blood Pressure"])
    .range(["#235789", "#AC9FBB", "#5A1807"]);

const satisfactionColor = d3.scaleOrdinal()
    .domain(["Satisfied", "Neutral", "Dissatisfied"])
    .range(["#28a745", "#ffc107", "#dc3545"]);

// tooltip
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
    .style("font-size", "12px");

// SVG containers for each racial group
const container = d3
    .select("#donut-charts")
    .selectAll(".chart")
    .data(ethnicityData)
    .enter()
    .append("div")
    .attr("class", "chart")
    .style("margin", "10px")
    .style("text-align", "center");

container.append("h4")
    .text((d) => d.ethnicity)
    .style("margin-bottom", "10px");

const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

// draw inner rings for chronic condition
svg.each(function (data) {
    const g = d3.select(this);

    const chronicConditions = data.chronicConditions;

    // Calculate the starting radius dynamically
    const startingRadius = maxRadius - ringThickness * (chronicConditions.length + 1);

    chronicConditions.forEach((condition, index) => {
        const arc = d3.arc()
            .innerRadius(startingRadius + index * ringThickness)
            .outerRadius(startingRadius + (index + 1) * ringThickness)
            .startAngle(0)
            .endAngle((condition.value / 100) * 2 * Math.PI); // Proportional angle

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
                        `<strong>${condition.condition}</strong><br>Value: ${condition.value}%`
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

// draw medicare satisfaction outer rings
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
        .value((d) => d.value)
        .startAngle(0)
        .endAngle(2 * Math.PI);

    g.selectAll(".satisfaction-ring")
        .data(pie(satisfactionData))
        .enter()
        .append("path")
        .attr("d", arcOuter)
        .attr("fill", (d) => satisfactionColor(d.data.level))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
            tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + "px")
                .html(
                    `<strong>${d.data.level}</strong><br>Value: ${d.data.value}%`
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
