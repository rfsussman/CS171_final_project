// init global variables & switches
let bar_graph,
    medicaid_pie_chart,
    medicare_advantage_pie_chart,
    part_d_pie_chart,
    private_insurance_pie_chart,
    total_pie_chart;

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

// initialize graphs
function initialize_graphs(data) {
    bar_graph = new Rachel_Grouped_Bar("bar_graph_div", data[0]);
    bar_graph.wrangleData(["medicare_reason"])
}

// button styling
function click_demographic_button(button) {
    // activate button
    button.classList.toggle("active");

    // find list of active demographic buttons
    const active_demographic_buttons = document.querySelectorAll('.demographic_button.active');

    // if there are other buttons active, deactivate them
    for (let active_demographic_button of active_demographic_buttons) {
        if (this !== active_demographic_button) {
            active_demographic_button.classList.remove('active');
        }
    }

    // send list of active buttons to graph
    const graph_active_demographic_buttons = [];
    active_demographic_buttons.forEach(button => {
        graph_active_demographic_buttons.push(button.id)
    })
    console.log(graph_active_demographic_buttons)
    bar_graph.wrangleData(graph_active_demographic_buttons)
}


function click_bar_button(button) {
    // activate button
    button.classList.toggle("active");

    // find list of active bar buttons
    const active_bar_buttons = document.querySelectorAll('.bar_button.active');

    // send list of active buttons to graph
    const graph_active_bar_buttons = [];
    active_bar_buttons.forEach(button => {
        graph_active_bar_buttons.push(button.id)
    })
    console.log(graph_active_bar_buttons)
    bar_graph.filterBars(graph_active_bar_buttons)
}