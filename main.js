import { stateToRegion, regionColors } from './stateToRegion.js';

const scatterContainer = d3.select("#scatterplot")
    .append("div")
    .attr("id", "scatter-container")
    .style("display", "inline-block")
    .style("vertical-align", "top");
    
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 750 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = scatterContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("colleges.csv").then((data) => {
    data.forEach((d) => {
        d["ACT Median"] = +d["ACT Median"];
        d["Admission Rate"] = +d["Admission Rate"];
        d["Average Cost"] = +d["Average Cost"];
    });

    const xScale = d3
        .scaleLinear()
        .domain([1, 0])
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([d3.min(data, (d) => d["ACT Median"]) - 2, d3.max(data, (d) => d["ACT Median"]) + 2])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")));

    svg.append("g").call(d3.axisLeft(yScale));

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

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d["Admission Rate"]))
        .attr("cy", (d) => yScale(d["ACT Median"]))
        .attr("r", 5)
        .attr("fill", (d) => colorScale(d.Control))
        .attr("opacity", 0.7);

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
            const fieldsToDisplay = [
                { label: "Name", value: d["Name"] },
                { label: "Control", value: d["Control"] },
                { label: "Region", value: d["Region"] },
                { label: "Locale", value: d["Locale"] },
                { label: "Admission Rate", value: d3.format(".0%")(d["Admission Rate"]) },
                { label: "ACT Median", value: d["ACT Median"] },
            ];
                const tooltipContent = fieldsToDisplay
                .map(({ label, value }) => `<strong>${label}:</strong> ${value}`)
                .join("<br>");
    
            tooltip
                .style("visibility", "visible")
                .html(tooltipContent);
            highlightRegion(d["Region"]);
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

    const legend = svg.append("g")
        .attr("class", "legend")
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

    d3.select("#hideZeroACT").on("change", function () {
        const checked = d3.select(this).property("checked");
    
        svg.selectAll("circle")
            .attr("display", (d) => {
                if (checked && d["ACT Median"] === 0) {
                    return "none";
                }
                return null;
            });
    });
});

function highlightRegion(selectedRegion) {
    svg2.selectAll("path")
        .attr("fill", (d) => {
            const stateName = d.properties.name;
            const region = stateToRegion[stateName];
            return region === selectedRegion
                ? regionColors(region)
                : "#ccc";
        });
}

function resetRegions() {
    svg2.selectAll("path")
        .attr("fill", (d) => {
            const stateName = d.properties.name;
            const region = stateToRegion[stateName];
            return region ? regionColors(region) : "#ccc";
        });
}

const colorScale = d3.scaleOrdinal()
.domain(["Public", "Private"])
.range(["#1f77b4", "#ff7f0e"]);


function highlightScatterplot(selectedRegion) {
    svg.selectAll("circle")
        .attr("fill", (d) => {
            return d.Region === selectedRegion
                ? colorScale(d.Control)
                : "#ccc";
        });
}

function resetScatterplot() {
    svg.selectAll("circle")
        .attr("fill", (d) => colorScale(d.Control));
}

d3.select("#costFilter").on("change", function () {
    const selectedRange = this.value;
    filterScatterplot(selectedRange);
});

function filterScatterplot(selectedRange) {
    svg.selectAll("circle")
        .attr("opacity", (d) => {
            const cost = d["Average Cost"];
            if (selectedRange === "all") return 1;
            if (selectedRange === "5000-10000") return cost > 5000 && cost <= 10000 ? 1 : 0.1;
            if (selectedRange === "10000-20000") return cost > 10000 && cost <= 20000 ? 1 : 0.1;
            if (selectedRange === "20000-40000") return cost > 20000 && cost <= 40000 ? 1 : 0.1;
            if (selectedRange === "40000-60000") return cost > 40000 && cost <= 60000 ? 1 : 0.1;
            if (selectedRange === "60000+") return cost > 60000 ? 1 : 0.1;
        })
        .attr("pointer-events", (d) => {
            const cost = d["Average Cost"];
            if (selectedRange === "all") return "all";
            if (selectedRange === "5000-10000") return cost > 5000 && cost <= 10000 ? "all" : "none";
            if (selectedRange === "10000-20000") return cost > 10000 && cost <= 20000 ? "all" : "none";
            if (selectedRange === "20000-40000") return cost > 20000 && cost <= 40000 ? "all" : "none";
            if (selectedRange === "40000-60000") return cost > 40000 && cost <= 60000 ? "all" : "none";
            if (selectedRange === "60000+") return cost > 60000 ? "all" : "none";
        });
}

const mapContainer = d3.select("body")
    .append("div")
    .attr("id", "map-container")
    .style("display", "inline-block")
    .style("vertical-align", "top");

const mapWidth = 600;
const mapHeight = 500;

const projection = d3.geoAlbersUsa()
    .scale(900)
    .translate([mapWidth / 2 + 100, mapHeight / 2]);

const path = d3.geoPath().projection(projection);

const svg2 = mapContainer
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .style("border", "1px solid black");

const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("padding", "10px")
    .style("visibility", "hidden");

Promise.all([
    d3.csv("colleges.csv"),
    d3.json("states.json")
]).then(([colleges, us]) => {
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

    svg2.selectAll("path")
        .data(states)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d) => {
            const stateName = d.properties.name;
            const region = stateToRegion[stateName];
            return region ? regionColors(region) : "#ccc";
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
            highlightScatterplot(region);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("top", `${event.pageY + 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
            resetScatterplot();
        });

    const legend = svg2.append("g")
        .attr("transform", "translate(20,20)");

    const regions = regionColors.domain();
    regions.forEach((region, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", (i * 20) - 60)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", regionColors(region));
    
        legend.append("text")
            .attr("x", 20)
            .attr("y", (i * 20) + 12 - 60)
            .text(region)
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");
    });
}).catch(error => console.error("Error loading data:", error));