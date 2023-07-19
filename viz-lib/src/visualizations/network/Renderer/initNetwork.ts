// @ts-expect-error
import * as d3 from "d3v7";
import { NetworkDataType } from "..";
import { NetworkOptionsType } from "../getOptions";

import { getOptionValue, color } from "./utils";
import { showNodeInfo, showOverview } from "./tooltip";

type Node = {
  label__: string
}
type Link = {
  label__: string
}

export default function initNetwork(data: NetworkDataType, options: NetworkOptionsType) {
  // TODOs
  // Directed
  // Label
  // Overview
  // Info logic for hover vs click

  let blob = data.columns[0].name == "blob" ? data.rows[0] : null;

  let nodes: Array<Node> = blob ? JSON.parse(blob.nodes) : [];
  let links: Array<Link> = blob ? JSON.parse(blob.links) : [];

  const nodeTypes: Array<string> =  [...new Set(nodes.map((x: Node) => x.label__))]
  const linkTypes: Array<string> =  [...new Set(links.map((x: any) => x.label__))]

  return (element: HTMLDivElement) => {
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

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .style("stroke", (d: Link) => getOptionValue(options, d, "color", "#000"))
      .style("stroke-width", (d: Link) => getOptionValue(options, d, "strokeWidth", 2));

    const nodeContainer = svg.append("g").selectAll("circle").data(nodes).enter();

    const node = nodeContainer
      .append("circle")
      .attr("r", (d: Node) => getOptionValue(options, d, "radius", 2))
      .style("stroke", "#fff")
      .style("stroke-width", 1.5)
      .attr("fill", (d: Node) => getOptionValue(options, d, "color", color(d.label__)));

    const nodeRing = nodeContainer
      .append("circle")
      .attr("r", (d: Node) => getOptionValue(options, d, "radius", 2))
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("fill", "none")
      .attr("opacity", 0);

    node.call(drag(simulation));
    node
      .on("mouseover", function (e: any, nodeTarget: Node) {
        showNodeInfo(options, info, nodeTarget);
      })
      .on("mouseout", function () {
        showOverview(options, info, nodeTypes, linkTypes, nodes.length, links.length);
      });

    const info = infoContainer.append("div");

    showOverview(options, info, nodeTypes, linkTypes, nodes.length, links.length);

    ////////////////////////////////////////////////////////////////////////////////////

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      nodeRing.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    }

    function handleZoom(x: any) {
      node.attr("transform", x.transform);
      nodeRing.attr("transform", x.transform);
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
  };
}
