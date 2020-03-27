import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { stats, stats20200322, StatsEntry } from "./stats";

//Create the work space
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

//creating the map of Spain (ESPAÑA ostias con la Ñ)
const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);

//Buttons
document
  .getElementById("stats")
  .addEventListener("click", function handleOriginalStats() {
    updateCircles(stats);
  });

document
  .getElementById("stats20200322")
  .addEventListener("click", function handleMarStats() {
    updateCircles(stats20200322);
  });
//this part is just because I wanted to print the numbers over the circles START
// Tooltip
const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//this part is just because I wanted to print the numbers over the circles STOP

/*Update buttons (each time i press a button it will reexecute the functin
  called update circles)
*/
const updateCircles = (data: StatsEntry[]) => {
  const maxAffected = data.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );//first problem TODO. SOLVED 

  const affectedRadiusScale = d3
    .scaleLinear()
    .domain([0, maxAffected])
    .range([0, 50]); // 50 pixel max radius, we could calculate it relative to width and height

  const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
    const entry = data.find(item => item.name === comunidad);
    return entry ? affectedRadiusScale(entry.value) : 0;
  };
//now as I saw in class example:
  const circles = svg
    .selectAll("circle")    ;

  circles
    .data(latLongCommunities)
    .enter()
//it creates a circle
    .append("circle")

    .attr("class", "affected-marker")
//calculates the radius of the circle
    .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name))
//puts the center of my circle in position inside of already created map
    .attr("cx", d => aProjection([d.long, d.lat])[0])
    .attr("cy", d => aProjection([d.long, d.lat])[1])

  .merge(circles as any)
  //this part is just because I wanted to print the numbers over the circles START
  .on("mouseover", function(d, i) {
    div
      .transition()
      .style("opacity", 1);

    const tooltipContent = `
      <span>
      ${data.find(entry => entry.name === d.name).name} : ${data.find(entry => entry.name === d.name).value}
      </span>`;

    div
      .html(tooltipContent)
      .style("left", `${d3.event.pageX}px`)
      .style("top", `${d3.event.pageY - 28}px`);
  })
  .on("mouseout", function(d, i) {
    div
      .transition()
      .style("opacity", 0);
  })
//this part is just because I wanted to print the numbers over the circles STOP
  .transition()
  .duration(300)
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name));
};
//With this I will start allways on my recent data.
updateCircles(stats20200322);