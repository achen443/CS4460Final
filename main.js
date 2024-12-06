import { stateToRegion, regionColors } from './stateToRegion.js';

// Set dimensions for the scatterplot
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Append an SVG element to the body
const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the CSV data
d3.csv("colleges.csv").then((data) => {
    // Parse numeric data (convert columns to numbers where applicable)
    data.forEach((d) => {
        d["ACT Median"] = +d["ACT Median"];
        d["Admission Rate"] = +d["Admission Rate"];
    });

    // Set the scales
    const xScale = d3
        .scaleLinear()
        .domain([1, 0]) // Admission Rate (0 to 1)
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([d3.min(data, (d) => d["ACT Median"]) - 2, d3.max(data, (d) => d["ACT Median"]) + 2])
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")));

    svg.append("g").call(d3.axisLeft(yScale));

    // Add labels for axes
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Admission Rate");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("ACT Median");

    // Define a color scale for public vs private
    const colorScale = d3.scaleOrdinal()
        .domain(["Public", "Private"])
        .range(["#1f77b4", "#ff7f0e"]); // Colors for public and private

    // Add circles for each college
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d["Admission Rate"]))
        .attr("cy", (d) => yScale(d["ACT Median"]))
        .attr("r", 5)
        .attr("fill", (d) => colorScale(d.Control)) // Assign color based on Control
        .attr("opacity", 0.7);

    // Add tooltips displaying all data
    const tooltip = d3
        .select("body")
        .append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("padding", "10px")
        .style("visibility", "hidden");

    svg.selectAll("circle")
        .on("mouseover", function (event, d) {
            tooltip
                .style("visibility", "visible")
                .html(
                    Object.entries(d)
                        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                        .join("<br>")
                );
            const region = d.Region;
            console.log(region);
            highlightRegion(region);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
            resetRegions();
        });

    // Add a legend for public/private schools
    const legend = svg.append("g")
        .attr("class", "legend")
        // .attr("transform", `translate(${width - 20}, 4)`); // Adjust legend position
        .attr("transform", `translate(10, 10)`);

    const categories = ["Public", "Private"];

    categories.forEach((category, i) => {
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", i * 20)
            .attr("r", 5)
            .attr("fill", colorScale(category));

        legend.append("text")
            .attr("x", 15)
            .attr("y", i * 20 + 5)
            .text(category)
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");
    });
});

function highlightRegion(selectedRegion) {
    svg2.selectAll("path")
        .attr("fill", (d) => {
            const stateName = d.properties.name;
            const region = stateToRegion[stateName]; // Get the region of the state
            return region === selectedRegion
                ? regionColors(region) // Keep the color for the selected region
                : "#ccc"; // Grey out other regions
        });
}

// Reset all regions to their original colors
function resetRegions() {
    svg2.selectAll("path")
        .attr("fill", (d) => {
            const stateName = d.properties.name;
            const region = stateToRegion[stateName]; // Get the region of the state
            return region ? regionColors(region) : "#ccc"; // Restore original color
        });
}


// US MAP (SVG 2)

// Create a container for the map
const mapContainer = d3.select("body")
    .append("div")
    .attr("id", "map-container")
    .style("display", "inline-block")
    .style("vertical-align", "top");

// Set dimensions for the map
const mapWidth = 800;
const mapHeight = 600;

// Create the projection
const projection = d3.geoAlbersUsa()
    .scale(1100)
    .translate([mapWidth / 2, mapHeight / 2]);

// Path generator
const path = d3.geoPath().projection(projection);

// Append an SVG for the map inside the map container
const svg2 = mapContainer
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .style("border", "1px solid black");

// Tooltip for region-college mapping
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("padding", "10px")
    .style("visibility", "hidden");

// Load CSV for colleges and map GeoJSON
Promise.all([
    d3.csv("colleges.csv"),
    d3.json("states.json")
]).then(([colleges, us]) => {
    // Map colleges to regions directly
    const regionToColleges = {};
    colleges.forEach(college => {
        const region = college.Region;
        if (region) {
            if (!regionToColleges[region]) {
                regionToColleges[region] = [];
            }
            regionToColleges[region].push(college.Name);
        }
    });

    const states = topojson.feature(us, us.objects.states).features;

    // Draw the map
    svg2.selectAll("path")
        .data(states)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d) => {
            const stateName = d.properties.name; // State name from GeoJSON
            const region = stateToRegion[stateName]; // Map state to region
            return region ? regionColors(region) : "#ccc"; // Assign color or default
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, d) {
            const stateName = d.properties.name;
            const region = stateToRegion[stateName];
            const collegesInRegion = region ? regionToColleges[region] : [];
            tooltip
                .style("visibility", "visible")
                .html(
                    `<strong>Region:</strong> ${region || "Unknown"}<br>` +
                    `<strong>Colleges:</strong><br>` +
                    (collegesInRegion && collegesInRegion.length > 0
                        ? collegesInRegion.join("<br>")
                        : "No colleges")
                );
        })
        .on("mousemove", function (event) {
            tooltip
                .style("top", `${event.pageY + 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        });

    // Add a legend
    const legend = svg2.append("g")
        .attr("transform", "translate(20,20)");

    const regions = regionColors.domain();
    regions.forEach((region, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", regionColors(region));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(region)
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");
    });
}).catch(error => console.error("Error loading data:", error));