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
        this.margin = {top: 100, right: 50, bottom: 100, left: 50},
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
            .attr("font-size", "28px")
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
            .attr('transform', `translate(${this.width * 8.5/10}, ${this.height/2})`)

        // make rectangle to store legend gradient
        this.color_legend
            .append("rect")
            .attr("id", "legend_rectangle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", this.width/6)
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("fill", "url(#gradient)");

        // get legend dimensions
        this.legend_dimensions = d3.select('#legend_rectangle')
            .node()
            .getBBox();

        // add minimum text spot
        this.min_text = this.color_legend
            .append("text")
            .attr("x", this.legend_dimensions.x + 10)
            .attr("y", this.legend_dimensions.y - 5)
            .style("font-size", "14px")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle");

        // add maximum text spot
        this.max_text = this.color_legend
            .append("text")
            .attr("x", this.legend_dimensions.x + 10)
            .attr("y", this.legend_dimensions.y + this.legend_dimensions.height + 15)
            .style("font-size", "14px")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle");

        // initialize color scale
        this.fills = d3.scaleLinear()

        // initialize tooltip
        this.state_tooltip = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'state_tooltip');

        // define projection
        this.viewpoint = {'width': 1000, 'height': 800};
        this.zoom = this.width / this.viewpoint.width;
        this.projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([500, 200])

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
            .attr('stroke-width', '2px')
            .attr('stroke', 'black')
            .style("fill", "lightgrey");

        // call wrangleData()
        this.wrangleData()
    }

    wrangleData(selected_category) {
        this.selected_category = "greater_than_74_pct"

        // change color scheme depending on category
        this.fills
            .domain([
                d3.min(this.demographic_data, d => +d[this.selected_category]),
                d3.max(this.demographic_data, d => +d[this.selected_category])])

        if (["aged_pct", "disabled_pct"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#F70073"])
        } else if (["less_than_65_pct", "between_65_to_74_pct", "greater_than_74_pct"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#FAB300"])
        } else if (["female_pct", "male_pct"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#81DE00"])
        } else if (["black_pct", "hispanic_pct", "white_pct", "other_pct"].includes(this.selected_category)){
            this.fills
                .range(["#FFFFFF", "#0050E6"])
        }

        // merge percent data into GeoJSON data
        this.geoJSON.forEach(state => {
            const matched_state = this.demographic_data.find(s => s.state === state.properties.name);
            if (matched_state) {
                state.properties.fill = this.fills(+matched_state[this.selected_category]);
                state.properties.aged_pct = +matched_state.aged_pct;
                state.properties.disabled_pct = +matched_state.disabled_pct;
                state.properties.less_than_65_pct = +matched_state.less_than_65_pct;
                state.properties.between_65_to_74_pct = +matched_state.between_65_to_74_pct;
                state.properties.greater_than_74_pct = +matched_state.greater_than_74_pct;
                state.properties.female_pct = +matched_state.female_pct;
                state.properties.male_pct = +matched_state.male_pct;
                state.properties.black_pct = +matched_state.black_pct;
                state.properties.hispanic_pct = +matched_state.hispanic_pct;
                state.properties.white_pct = +matched_state.white_pct;
                state.properties.other_pct = +matched_state.other_pct;
            }
        })

        this.updateVis()
    }

    updateVis() {
        // update title
        this.map_title
            .text(d => {
                switch (this.selected_category) {
                    case "aged_pct": return "% of beneficiaries eligible for Medicare due to age";
                    case "disabled_pct": return "% of beneficiaries eligible for Medicare due to disability";
                    case "less_than_65_pct": return "% of beneficiaries less than 65 years old";
                    case "between_65_to_74_pct": return "% of beneficiaries between 65 and 74 years old";
                    case "greater_than_74_pct": return "% of beneficiaries greater than 75 years old";
                    case "black_pct": return "% of Black beneficiaries";
                    case "hispanic_pct": return "% of Hispanic beneficiaries";
                    case "white_pct": return "% of white beneficiaries";
                    case "other_pct": return "% of beneficiaries of other race";
                }
            })

        // update legend
        this.stops = this.fills.ticks(5);
        this.gradient.selectAll("stop")
            .data(this.stops)
            .enter()
            .append("stop")
            .attr("offset", (d, i) => `${(i / (this.stops.length - 1)) * 100}%`)
            .attr("stop-color", (d) => this.fills(d));

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
                    .style("fill", "#B1740F")
                    .style("stroke", "#363020");

                // tooltip popup
                this.state_tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")

                if (["aged_pct", "disabled_pct"].includes(this.selected_category)){
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 15px">
                         <div style = "font-weight: bold">Eligibility Reason in ${d.properties.name}:</div>
                         <div> Aged: ${d.properties.aged_pct}%</div> 
                         <div> Disabled: ${d.properties.disabled_pct}%</div>                                  
                     </div>`);
                } else if (["less_than_65_pct", "between_65_to_74_pct", "greater_than_74_pct"].includes(this.selected_category)){
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 15px">
                         <div style = "font-weight: bold">Age in ${d.properties.name}:</div>
                         <div> < 65: ${d.properties.less_than_65_pct}%</div> 
                         <div> 65-74: ${d.properties.between_65_to_74_pct}%</div>        
                         <div> > 74: ${d.properties.greater_than_74_pct}%</div>                                     
                     </div>`);
                } else if (["female_pct", "male_pct"].includes(this.selected_category)){
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 15px">
                         <div style = "font-weight: bold">Sex in ${d.properties.name}:</div>
                         <div> Female: ${d.properties.female_pct}%</div> 
                         <div> Male: ${d.properties.male_pct}%</div>        
                     </div>`);
                } else if (["black_pct", "hispanic_pct", "white_pct", "other_pct"].includes(this.selected_category)){
                    this.state_tooltip
                        .html(`<div style="border: solid black; border-radius: 5px; background: white; padding: 10px; font-size: 15px">
                         <div style = "font-weight: bold">Race in ${d.properties.name}:</div>
                         <div> Black: ${d.properties.black_pct}%</div> 
                         <div> Hispanic: ${d.properties.hispanic_pct}%</div>        
                         <div> White: ${d.properties.white_pct}%</div>      
                         <div> Other: ${d.properties.other_pct}%</div>      
                     </div>`);
                }


                

            })
            .on('mouseout', (event, d) => {
                // return to regular color
                d3.select(event.currentTarget)
                    .style("fill", d => d.properties.fill)
                    .style("stroke", "black");

                // remove tooltip popup
                this.state_tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);


            })
            .transition() // has to happen after tooltip, before attributes
            .style("fill", d => d.properties.fill);
    }
}