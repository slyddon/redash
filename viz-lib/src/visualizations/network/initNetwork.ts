// @ts-expect-error
import * as d3 from "d3v7";
import { NetworkDataType } from ".";
import { NetworkOptionsType } from "./getOptions";

export default function initNetwork(data: NetworkDataType, options: NetworkOptionsType) {
  return (element: HTMLDivElement) => {
    let blob = data.rows[0] || null;

    let nodes = blob ? JSON.parse(blob.nodes) : [];
    let links = blob ? JSON.parse(blob.links) : [];

    ////////////////////////////////////////////////////////////////////////////////////

    d3.select(element).selectAll("*").remove();

    const containerBounds = d3.select(element).node().getBoundingClientRect();
    const width = Math.floor(containerBounds.width);
    const height = Math.floor(containerBounds.height);

    if (width <= 0 || height <= 0) {
      return;
    }

    let container = d3.select(element).append("div").attr("class", "network-split-container");
    let networkContainer = container.append("div").attr("class", "network-container");
    let infoContainer = container.append("div").attr("class", "info-container");

    ////////////////////////////////////////////////////////////////////////////////////

    const svg: d3.Selection<SVGGElement, any, any, any> = networkContainer
      .append("svg")
      .attr("class", "network")
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom().on("zoom", handleZoom));

    var simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(options.chargeStrength))
      .force("centerX", d3.forceX(width / 2).strength(options.centreAttraction))
      .force("centerY", d3.forceY(height / 2).strength(options.centreAttraction))
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(0)
          .strength(options.linkStrength)
      )
      .force("collision", d3.forceCollide().radius(options.collisionRadius))
      .on("tick", ticked);

    simulation.tick(100).restart();

    ////////////////////////////////////////////////////////////////////////////////////

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // TODO: Directed
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .style("stroke", (d: any) => getOptionValue(d, "color", "#000"))
      .style("stroke-width", (d: any) => getOptionValue(d, "strokeWidth", 2));

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: any) => getOptionValue(d, "radius", 2))
      .style("stroke", "#fff")
      .style("stroke-width", 1.5)
      .attr("fill", (d: any) => getOptionValue(d, "color", color(d.label__)));

    node.call(drag(simulation));
    node.on("mouseover", function (e: any, nodeTarget: any) {
      showInfo(nodeTarget);
    });

    const info = infoContainer.append("div");

    ////////////////////////////////////////////////////////////////////////////////////

    function getOptionValue(entity: any, key: string, defaultValue: any) {
      return options.objectOptions[entity.label__]
        ? options.objectOptions[entity.label__][key] || defaultValue
        : defaultValue;
    }

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    }

    function handleZoom(x: any) {
      node.attr("transform", x.transform);
      link.attr("transform", x.transform);
    }

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        // @ts-expect-error
        d3.select(this).style("stroke", "#000000");
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        // @ts-expect-error
        d3.select(this).style("stroke", "#fff");
      }

      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

    function showInfo(nodeTarget: any) {
      info.transition().duration(50).selectAll("*").remove();

      info
        .append("div")
        .attr("class", "info-header-container")
        .append("span")
        .attr("class", "info-header")
        .style("background-color", getOptionValue(nodeTarget, "color", color(nodeTarget.label__)))
        .text(nodeTarget.label__);

      let body = info
        .append("div")
        .attr("class", "info-body")
        .selectAll("div")
        .data(() => {
          let data: any = [];
          const keysToIgnore = ["fx", "fy", "vx", "vy", "x", "y", "index", "label__"];
          const keys = Object.keys(nodeTarget).filter((x) => !keysToIgnore.includes(x));
          keys.forEach((key) => {
            data.push({ key: key, val: nodeTarget[key] });
          });
          return data;
        })
        .enter()
        .append("div")
        .attr("class", "info-key-container");

      body
        .append("div")
        .attr("class", "info-key-header")
        .text((x: any) => x.key);

      body
        .append("div")
        .attr("class", "info-key-body")
        .text((x: any) => x.val);

      info.style("visibility", "visible");
      infoContainer.style("visibility", "visible");
    }
  };
}
