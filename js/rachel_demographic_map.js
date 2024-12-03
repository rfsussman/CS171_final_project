class Rachel_Demographic_Map {
    constructor(parent_element, geographic_data, demographic_data) {
        // define variables
        this.parent_element = parent_element;
        this.geographic_data = geographic_data;
        this.demographic_data = demographic_data;

        // call initVis()
        this.initVis()
    }

    initVis() {

        // initialize svg
        this.margin = {top: 100, right: 50, bottom: 10, left: 50},
            this.width = document.getElementById(this.parent_element).getBoundingClientRect().width - this.margin.left - this.margin.right,
            this.height =  document.getElementById(this.parent_element).getBoundingClientRect().width*0.5 - this.margin.top - this.margin.bottom

        this.svg = d3.select("#" + this.parent_element)
            .style("display", "flex")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // initialize title
        this.map_title = this.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr("font-size", "18px")
            .attr('transform', `translate(${this.width / 2}, -50)`)
            .attr('text-anchor', 'middle')
            .text('Map');

        // initialize legend gradient
        this.gradient = this.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        // initialize legend
        this.color_legend = this.svg
            .append("g")
            .attr("class", "color-legend")
            .attr('transform', `translate(${this.width * 9/10}, ${this.height/10})`)

        // make rectangle to store legend gradient
        this.color_legend
            .append("rect")
            .attr("id", "legend_rectangle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", this.width/6)
            .style("stroke", "black")
            .style("stroke-width", 1);

        // get legend dimensions
        this.legend_dimensions = d3.select('#legend_rectangle')
            .node()
            .getBBox();

        // add minimum text spot
        this.min_text = this.color_legend
            .append("text")
            .attr("x", this.legend_dimensions.x + 10)
            .attr("y", this.legend_dimensions.y - 5)
            .style("font-size", "12px")
            .attr("fill", "black")
            .style("text-anchor", "middle");

        // add maximum text spot
        this.max_text = this.color_legend
            .append("text")
            .attr("x", this.legend_dimensions.x + 10)
            .attr("y", this.legend_dimensions.y + this.legend_dimensions.height + 15)
            .style("font-size", "12px")
            .attr("fill", "black")
            .style("text-anchor", "middle");

        // initialize color scale
        this.fills = d3.scaleLinear()

        // initialize tooltip
        this.state_tooltip = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'state_tooltip');

        // define projection
        // this.viewpoint = {'width': 1000, 'height': 1200};
        this.viewpoint = {'width': 500, 'height': 600};
        this.zoom = this.width / this.viewpoint.width;
        this.projection = d3.geoAlbersUsa()
            .scale(500)
            .translate([250, 100])

        // define path generator
        this.path = d3.geoPath()
            .projection(this.projection);

        // convert from TopoJSON to GeoJSON
        this.geoJSON = topojson.feature(this.geographic_data, this.geographic_data.objects.states).features

        // draw map
        this.states = this.svg
            .append("g")
            .attr("class", "states")
            .attr('transform', `scale(${this.zoom} ${this.zoom})`)
            .selectAll("path")
            .data(this.geoJSON, d => d.properties.name)
            .enter()
            .append("path")
            .attr("id", d => "map" + d.properties.name.replace(/\s+/g, '-'))
            .attr("d", this.path)
            .attr('stroke-width', '1px')
            .attr('stroke', 'black')
            .style("fill", "lightgrey");

        // call wrangleData()
        this.wrangleData("Aged")
    }

    wrangleData(selected_category) {
        // map selected category to recognizeable variable name
        switch (selected_category) {
            case "Aged": this.selected_category = "pct_aged"; break;
            case "Disabled": this.selected_category = "pct_disabled"; break;
            case "Unknown": this.selected_category = "pct_aged"; break;
            case "<65": this.selected_category = "pct_less_than_65"; break;
            case "65-74": this.selected_category = "pct_between_65_to_74"; break;
            case "75+": this.selected_category = "pct_greater_than_74"; break;
            case "Female": this.selected_category = "pct_female"; break;
            case "Male": this.selected_category = "pct_male"; break;
            case "Black": this.selected_category = "pct_black"; break;
            case "White": this.selected_category = "pct_white"; break;
            case "Hispanic": this.selected_category = "pct_hispanic"; break;
            case "Other": this.selected_category = "pct_other"; break;
        }
        // change color scheme depending on category
        this.fills
            .domain([
                d3.min(this.demographic_data, d => +d[this.selected_category]),
                d3.max(this.demographic_data, d => +d[this.selected_category])])

        if (["pct_aged", "pct_disabled"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#F70073"])
        } else if (["pct_less_than_65", "pct_between_65_to_74", "pct_greater_than_74"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#FAB300"])
        } else if (["pct_female", "pct_male"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#81DE00"])
        } else if (["pct_black", "pct_hispanic", "pct_white", "pct_other"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#0050E6"])
        }

        // merge percent data into GeoJSON data
        this.geoJSON.forEach(state => {
            const matched_state = this.demographic_data.find(s => s.state === state.properties.name);
            if (matched_state) {
                state.properties.fill = this.fills(+matched_state[this.selected_category]);
                state.properties.pct_aged = +matched_state.pct_aged;
                state.properties.pct_disabled = +matched_state.pct_disabled;
                state.properties.pct_less_than_65 = +matched_state.pct_less_than_65;
                state.properties.pct_between_65_to_74 = +matched_state.pct_between_65_to_74;
                state.properties.pct_greater_than_74 = +matched_state.pct_greater_than_74;
                state.properties.pct_female = +matched_state.pct_female;
                state.properties.pct_male = +matched_state.pct_male;
                state.properties.pct_black = +matched_state.pct_black;
                state.properties.pct_hispanic = +matched_state.pct_hispanic;
                state.properties.pct_white = +matched_state.pct_white;
                state.properties.pct_other = +matched_state.pct_other;
            }
        })

        this.updateVis()
    }

    updateVis() {
        // update title
        this.map_title
            .text(d => {
                switch (this.selected_category) {
                    case "pct_aged": return "% of beneficiaries eligible for Medicare due to age";
                    case "pct_disabled": return "% of beneficiaries eligible for Medicare due to disability";
                    case "pct_less_than_65": return "% of beneficiaries less than 65 years old";
                    case "pct_between_65_to_74": return "% of beneficiaries between 65 and 74 years old";
                    case "pct_greater_than_74": return "% of beneficiaries greater than 75 years old";
                    case "pct_female": return "% of female beneficiaries";
                    case "pct_male": return "% of male beneficiaries";
                    case "pct_black": return "% of Black beneficiaries";
                    case "pct_hispanic": return "% of Hispanic beneficiaries";
                    case "pct_white": return "% of white beneficiaries";
                    case "pct_other": return "% of beneficiaries of other race";
                }
            })

        // clear existing stops
        this.gradient
            .selectAll("stop").remove();

        // make new stops
        this.stops = this.fills.ticks(5);

        // make new gradient
        this.gradient
            .selectAll("stop")
            .data(this.stops)
            .enter()
            .append("stop")
            .attr("offset", (d, i) => `${(i / (this.stops.length - 1)) * 100}%`)
            .attr("stop-color", (d) => this.fills(d));

        // update fill of color legend
        this.color_legend
            .attr("fill", "url(#gradient)");

        // update legend text
        this.min_text
            .text(this.fills.domain()[0] + "%");

        this.max_text
            .text(this.fills.domain()[1] + "%");

        // update state fill
        this.states
            .on('mouseover', (event, d) => {
                // highlight
                d3.select(event.currentTarget)
                    .style("fill", "#AC3931")
                    .attr("stroke-width", 2);

                // tooltip popup
                this.state_tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")

                if (["pct_aged", "pct_disabled"].includes(this.selected_category)){
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 14px">
                         <div style = "font-weight: bold">Eligibility Reason in ${d.properties.name}:</div>
                         <div> Aged: ${d.properties.pct_aged}%</div> 
                         <div> Disabled: ${d.properties.pct_disabled}%</div> 
                         <br>
                         <div> Click to show ${d.properties.name}'s demographic breakdown above.</div>                            
                     </div>`);
                } else if (["pct_less_than_65", "pct_between_65_to_74", "pct_greater_than_74"].includes(this.selected_category)){
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 14px">
                         <div style = "font-weight: bold">Age in ${d.properties.name}:</div>
                         <div> < 65: ${d.properties.pct_less_than_65}%</div> 
                         <div> 65-74: ${d.properties.pct_between_65_to_74}%</div>        
                         <div> > 74: ${d.properties.pct_greater_than_74}%</div>    
                         <br>
                         <div> Click to show ${d.properties.name}'s demographic breakdown above.</div>                            
                     </div>`);
                } else if (["pct_female", "pct_male"].includes(this.selected_category)){
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 14px">
                         <div style = "font-weight: bold">Sex in ${d.properties.name}:</div>
                         <div> Female: ${d.properties.pct_female}%</div> 
                         <div> Male: ${d.properties.pct_male}%</div>   
                         <br>
                         <div> Click to show ${d.properties.name}'s demographic breakdown above.</div>                            
                     </div>`);
                } else if (["pct_black", "pct_hispanic", "pct_white", "pct_other"].includes(this.selected_category)) {
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 14px">
                         <div style = "font-weight: bold">Race in ${d.properties.name}:</div>
                         <div> Black: ${d.properties.pct_black}%</div> 
                         <div> White: ${d.properties.pct_white}%</div>      
                         <div> Hispanic: ${d.properties.pct_hispanic}%</div>        
                         <div> Other: ${d.properties.pct_other}%</div>  
                         <br>
                         <div> Click to show ${d.properties.name}'s demographic breakdown above.</div>                            
                     </div>`);
                }
            })
            .on('click', (event, d) => {
                // send (pre-wrangled) percents to change the bar heights with (original bar graph dataset is not disaggregated by state)
                medicare_reason_bar.filterData([{ group: "Aged", y: d.properties.pct_aged },
                    {group: "Disabled", y: d.properties.pct_disabled }])

                age_bar.filterData([{ group: "<65", y: d.properties.pct_less_than_65 },
                    {group: "65-74", y: d.properties.pct_between_65_to_74 },
                    {group: "75+", y: d.properties.pct_greater_than_74 }])

                sex_bar.filterData([{ group: "Female", y: d.properties.pct_female },
                    {group: "Male", y: d.properties.pct_male }])

                race_bar.filterData([{ group: "Black", y: d.properties.pct_black },
                    {group: "White", y: d.properties.pct_white },
                    {group: "Hispanic", y: d.properties.pct_hispanic },
                    {group: "Other", y: d.properties.pct_other }])
            })
            .on('mouseout', (event, d) => {
                // return to regular color
                d3.select(event.currentTarget)
                    .style("fill", d => d.properties.fill)
                    .attr("stroke-width", 1);

                // remove tooltip popup
                this.state_tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);


            })
            .transition() // has to happen after tooltip, before attributes
            .duration(500)
            .style("fill", d => d.properties.fill);
    }
}