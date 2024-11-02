// init global variables & switches
let paired_bar_chart,
    medicaid_pie_chart,
    medicare_advantage_pie_chart,
    part_d_pie_chart,
    private_insurance_pie_chart,
    total_pie_chart;

let selected_demographic_bar = "";
let selected_insurance_bar = [];
let selected_reason_pie = [];
let selected_age_pie = [];
let selected_sex_pie = [];
let selected_race_pie = [];
let selected_mental_illness_pie = [];

// load data using promises
let promises = [
    d3.csv("data/rachel_data_cleaned.csv"),
];

Promise.all(promises)
    .then(function (data) {
        console.log("data/rachel_data_cleaned loaded")
        initialize_graphs(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function initialize_graphs(data) {
    bar_graph = new Rachel_Grouped_Bar("bar_graph_div", data[0]);
}