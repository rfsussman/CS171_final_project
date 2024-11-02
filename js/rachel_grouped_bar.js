class Rachel_Grouped_Bar {
    constructor(parent_element, bar_graph_data) {
        // define variables
        this.parent_element = parent_element;
        this.original_data = bar_graph_data;
        this.subgroups = ["medicaid", "medicare_advantage", "part_d", "private_insurance"]
        this.colors = ["#3C1742","#476A6F","#7D4600", "#C97B84"]

        // call initVis()
        this.initVis()
    }

    initVis() {
        // set up full SVG and related parameters
        this.full_svg = d3.select("#" + this.parent_element)
            .style("display", "flex");

        this.margin = {top: 30, right: 30, bottom: 30, left: 60},
            this.width = 1200,
            this.graph_width = (3/4)*this.width,
            this.legend_width = (1/4)*this.width,
            this.height = 400 - this.margin.top - this.margin.bottom;

        // define graph and legend SVGs
        this.graph_svg = this.full_svg
            .append("svg")
            .attr("width", this.graph_width)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.legend_svg = this.full_svg
            .append("svg")
            .attr("width", this.legend_width)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // initialize color scale
        this.color_scale = d3.scaleOrdinal()
            .domain(this.subgroups)
            .range(this.colors)

        // initialize legend
        this.legend = this.legend_svg
            .append("g")
            .attr('class', 'legend')

        // draw legend
        this.legend
            .selectAll("rect")
            .data(this.colors)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function(d, i) { return 35*i + 40; })
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", d => d)
            .attr("stroke", "black");

        // label legend colors
        this.legend.selectAll("text")
            .data(["Medicaid", "Medicare Advantage", "Part D", "Private Insurance"])
            .enter()
            .append("text")
            .text(d => d)
            .attr("x", 32)
            .attr("y", function(d, i) { return 35*i + 60; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "15px")
            .attr("fill", "black");

        // title legend
        this.legend.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -10)
            .attr("x", -29)
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .attr("font-family", "sans-serif")
            .attr("font-size", "15px")
            .text("Supplemental Insurance");

        // call wrangleData()
        this.wrangleData()
    }

    wrangleData() {
        // set for now; this will update with a button eventually
        this.selected_category = "medicare_reason"
        if (this.selected_category == "medicare_reason") {
            this.selected_title = "Medicare Reason"
        } else if (this.selected_category == "age") {
            this.selected_title = "Age"
        } else if (this.selected_category == "sex") {
            this.selected_title = "Sex"
        } else if (this.selected_category == "race") {
            this.selected_title = "Race"
        } if (this.selected_category == "mental_illness") {
            this.selected_title = "Mental Illness"
        }


            // group data by selected category
        this.grouped_data = d3.group(this.original_data, d => d[this.selected_category])

        // extract group names
        this.groups = Array.from(this.grouped_data.keys());

        // initialize storage for summed data
        this.compiled_data = {};
        this.groups.forEach(group => {
            this.compiled_data[group] = {
                total: this.grouped_data.get(group).length,
                medicaid_num: 0,
                medicare_advantage_num: 0,
                part_d_num: 0,
                private_insurance_num: 0};
        });

        // sum up number of beneficiaries per category across supplemental insurance subtypes
        this.grouped_data.forEach((array, group) => {
            array.forEach(row => {
                this.compiled_data[group].medicaid_num += +row.medicaid;
                this.compiled_data[group].medicare_advantage_num += +row.medicare_advantage;
                this.compiled_data[group].part_d_num += +row.part_d;
                this.compiled_data[group].private_insurance_num += +row.private_insurance;
            });
        })

        // based on these totals, calculate percent of beneficiaries with each type of insurance
        this.groups.forEach(group => {
            this.compiled_data[group].medicaid_pct = Math.round(100*this.compiled_data[group].medicaid_num/this.compiled_data[group].total);
            this.compiled_data[group].medicare_advantage_pct = Math.round(100*this.compiled_data[group].medicare_advantage_num/this.compiled_data[group].total);
            this.compiled_data[group].part_d_pct = Math.round(100*this.compiled_data[group].part_d_num/this.compiled_data[group].total);
            this.compiled_data[group].private_insurance_pct = Math.round(100*this.compiled_data[group].private_insurance_num/this.compiled_data[group].total);
        });

        // convert data into structure for d3 plotting
        this.data_for_graph = Object.keys(this.compiled_data).map(group => {
            return this.subgroups.map(subgroup => ({
                group: group,
                subgroup: subgroup,
                value: this.compiled_data[group][`${subgroup}_pct`],
                num_value: this.compiled_data[group][`${subgroup}_num`]
            }));
        }).flat();

        // call updateVis()
        this.updateVis()
    }

    updateVis() {

        // initialize and generate x axis (overall groups and subgroups)
        this.x = d3.scaleBand()
            .domain(this.groups)
            .range([0, this.graph_width - this.margin.left - this.margin.right])
            .padding([0.2])

        this.x_subgroups = d3.scaleBand()
            .domain(this.subgroups)
            .range([0, this.x.bandwidth()])
            .padding([0.1])

        this.graph_svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x))
            .selectAll("text")
            .attr("font-size", "15px");

        // initialize and generate y axis
        this.y = d3.scaleLinear()
            .domain([0, 100])
            .range([this.height, 0])

        this.graph_svg.append("g")
            .call(d3.axisLeft(this.y))
            .selectAll("text")
            .attr("font-size", "12px");

        this.graph_svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", -30)
            .attr("x", -this.height/2)
            .attr("transform", "rotate(-90)")
            .text("% of Beneficiaries")
            .attr("font-family", "sans-serif")
            .attr("font-size", "15px")
            .attr("fill", "black");

        // initialize bars (considering group and subgroup)
        this.bars = this.graph_svg.append("g")
            .selectAll("g")
            .data(this.data_for_graph)
            .join("g")
            .attr("transform", d => `translate(${this.x(d.group)}, 0)`)
            .selectAll("rect")
            .data(d => this.subgroups.map(category => ({key: category, value: this.compiled_data[d.group][`${category}_pct`]})));

        // call bars
        this.bars
            .enter()
            .append("rect")
            .attr("class", "bar")
            .merge(this.bars)
            .transition()
            .attr("x", d => this.x_subgroups(d.key))
            .attr("y", d => this.y(d.value))
            .attr("width", this.x_subgroups.bandwidth())
            .attr("height", d => this.height - this.y(d.value))
            .attr("fill", d => this.color_scale(d.key))
            .attr("stroke", "black");

        // initialize numeric labels (considering group and subgroup)
        this.num_labels = this.graph_svg.append("g")
            .selectAll("g")
            .data(this.data_for_graph)
            .join("g")
            .attr("transform", d => `translate(${this.x(d.group)}, 0)`)
            .selectAll("text")
            .data(d => this.subgroups.map(category => (
                {key: category, value: this.compiled_data[d.group][`${category}_pct`], num_value: this.compiled_data[d.group][`${category}_num`]})));

        // call numeric labels
        this.num_labels
            .enter()
            .append("text")
            .attr("class", "label")
            .merge(this.num_labels)
            .transition()
            .attr("x", d => this.x_subgroups(d.key) + this.x_subgroups.bandwidth()/2)
            .attr("text-anchor", "middle")
            .attr("y", d => this.y(d.value) - 5)
            .attr("fill", "black")
            .attr("font-size", "10px")
            .text(function(d) {
                return "(n=" + d.num_value + ")";
            });

        // make graph title
        this.graph_svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", this.graph_width/2)
            .attr("y", 0)
            .text("% of Beneficiaries by " + this.selected_title)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black");

    }
}