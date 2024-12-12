// initialize global variables & switches
let bar_graph, demographic_map, demographic_bar;
let buttons = { demographic_button: ["medicare_reason"], bar_buttons:["medicaid", "medicare_advantage", "part_d", "private_insurance"]};
let oopDistribution;
let oopScatterVis;

// load data using promises
let promises = [
    d3.csv("data/rachel_data_cleaned.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.csv("data/rachel_map_data_cleaned.csv"),
    d3.csv("data/processed_mcbs_cost_supplement.csv")
];

Promise.all(promises)
    .then(function (data) {
        // clean data types
        data[3].forEach(d => {
            d.PAMTOOP = +d.PAMTOOP; // convert out-of-pocket costs to numeric
            d.PAMTTOT = +d.PAMTTOT; // convert total costs to numeric
            d.CSP_AGE = +d.CSP_AGE; // convert age to numeric
            d.CSP_RACE = +d.CSP_RACE; // convert race to numeric
            d.CSP_SEX = +d.CSP_SEX; // convert gender to numeric
            d.CSP_INCOME = +d.CSP_INCOME; // convert income to numeric
        });
        // initialize graphs
        initialize_graphs(data)
    })
    .catch(function (err) {
        // set up an error
        console.log("Error loading data:", err)
    });

// initialize graphs
function initialize_graphs(data) {
    // initialize graphs
    bar_graph = new Rachel_Grouped_Bar("bar_graph_div", data[0], buttons);
    demographic_map = new Rachel_Demographic_Map("demographic_map_div", data[1], data[2]);
    medicare_reason_bar = new Rachel_Demographic_Bar("medicare_reason_bar_div", data[0], "medicare_reason");
    age_bar = new Rachel_Demographic_Bar("age_bar_div", data[0], "age");
    sex_bar = new Rachel_Demographic_Bar("sex_bar_div", data[0], "sex");
    race_bar = new Rachel_Demographic_Bar("race_bar_div", data[0], "race");
    oopDistribution = new OOPDistributionVis("oop_distribution_div", data[3]);
    oopScatterVis = new OOPScatterVis("scatter-plot", data[3]);

    // when income filter for out-of-pocket scatter chart is switched, re-wrangle data
    d3.select("#incomeFilter").on("change", () => {
        oopScatterVis.wrangleData();
    });

    // add resize listener to adjust graphs dynamically
    window.addEventListener("resize", () => {
        oopScatterVis.resizeVis();
        oopDistribution.resizeVis();
    });
}

// style demographic buttons
function click_demographic_button(button) {
    // deactivate all other buttons
    document.querySelectorAll('.demographic_button').forEach(demographic_button => {
        if (demographic_button.id !== button.id) {
            demographic_button.classList.remove('active');
        }
    });

    // activate current button
    button.classList.add("active");

    // send list of active buttons to graph
    buttons.demographic_button = button.id
    bar_graph.wrangleData(buttons)
}


function click_bar_button(button) {
    // activate button
    button.classList.toggle("active");

    // find list of active bar buttons
    const active_bar_buttons = document.querySelectorAll('.bar_button.active');

    // send list of active buttons to graph
    const send_active_bar_buttons = [];
    active_bar_buttons.forEach(button => {
        send_active_bar_buttons.push(button.id)
    })

    // send list of active buttons to graph
    buttons.bar_buttons = send_active_bar_buttons
    bar_graph.wrangleData(buttons)
}

// instead of scrollama (which failed at the last minute), use interaction observer to implement scrollytelling elements

// initialize steps and dots
const steps = document.querySelectorAll('.step');
const dots = document.querySelectorAll('.dot');

// define observer that tracks which stage of the webpage the observer is at
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // make the current entry active
            entry.target.classList.add('active');

            // make the corresponding dot active
            const index = Array.from(steps).indexOf(entry.target);
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        } else {
            // otherwise, make inactive
            entry.target.classList.remove('active');
        }
    });
}, { threshold: 0.5 }); // make snap-like feature

steps.forEach((step) => observer.observe(step)); // call observer whenever step is changed
