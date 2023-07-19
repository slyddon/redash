// @ts-expect-error
import * as d3 from "d3v7";
import { NetworkDataType, NetworkOptionsType, Node, Link } from "../types";

import { getOptionValue, color } from "./utils";
import { showNodeInfo, showOverview } from "./tooltip";

const BRIGHT_GREEN = "#52EE94";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

export default function initNetwork(data: NetworkDataType, options: NetworkOptionsType) {
  // TODOs
  // Directed
  // Label

  let blob = data.columns[0].name == "blob" ? data.rows[0] : null;

  let nodes: Array<Node> = blob ? JSON.parse(blob.nodes) : [];
  let links: Array<Link> = blob ? JSON.parse(blob.links) : [];

  const nodeTypes: Array<string> = [...new Set(nodes.map((x: Node) => x.label__))];
  const linkTypes: Array<string> = [...new Set(links.map((x: any) => x.label__))];

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
      .style("stroke", (d: Link) => getOptionValue(options, d, "color", BLACK))
      .style("stroke-width", (d: Link) => getOptionValue(options, d, "strokeWidth", 2));

    const nodeContainer = svg.append("g").selectAll("circle").data(nodes).enter().append("g");

    const node = nodeContainer
      .append("circle")
      .attr("class", "node-circle")
      .attr("r", (d: Node) => getOptionValue(options, d, "radius", 2))
      .style("stroke", WHITE)
      .style("stroke-width", 1.5)
      .attr("fill", (d: Node) => getOptionValue(options, d, "color", color(d.label__)));

    const nodeRing = nodeContainer
      .append("circle")
      .attr("class", "node-ring")
      .attr("r", (d: Node) => getOptionValue(options, d, "radius", 2))
      .style("stroke", BRIGHT_GREEN)
      .style("stroke-width", 8)
      .attr("fill", "none")
      .attr("opacity", 0);

    const nodeCaption = nodeContainer
      .append("text")
      .attr("class", "node-caption")
      .attr("text-anchor", "middle")
      .attr("font-size", "7px")
      .attr("fill", WHITE)
      .text((d: any) => {
        let key = getOptionValue(options, d, "label", null);
        return key ? d[key] : "";
      });

    node.call(drag(simulation));

    ////////////////////////////////////////////////////////////////////////////////////

    const info = infoContainer.append("div");
    showOverview(options, info, nodeTypes, linkTypes, nodes.length, links.length);

    let selectedNode: Node | undefined;
    nodeContainer
      .on("click", function (e: any, nodeTarget: Node) {
        if (selectedNode === undefined || selectedNode.id !== nodeTarget.id) {
          // deselect
          d3.selectAll(".node-ring").attr("opacity", 0);

          // select
          selectedNode = nodeTarget;
          // @ts-expect-error
          d3.select(this).select(".node-ring").attr("opacity", 1);
        } else {
          // deselect
          selectedNode = undefined;
          d3.selectAll(".node-ring").attr("opacity", 0);
        }
      })
      .on("mouseover", function (e: any, nodeTarget: Node) {
        showNodeInfo(options, info, nodeTarget);
      })
      .on("mouseout", function () {
        if (selectedNode !== undefined) {
          showNodeInfo(options, info, selectedNode);
        } else {
          showOverview(options, info, nodeTypes, linkTypes, nodes.length, links.length);
        }
      });

    networkContainer.on("click", function (e: any) {
      function clickedOnNode() {
        // @ts-expect-error
        return this == e.target;
      }

      let notOnNode = node.filter(clickedOnNode).empty();
      if (notOnNode) {
        selectedNode = undefined;
        d3.selectAll(".node-ring").attr("opacity", 0);

        showOverview(options, info, nodeTypes, linkTypes, nodes.length, links.length);
      }
    });

    ////////////////////////////////////////////////////////////////////////////////////

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      nodeRing.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      nodeCaption.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    }

    function handleZoom(x: any) {
      nodeContainer.attr("transform", x.transform);
      link.attr("transform", x.transform);
    }

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        // @ts-expect-error
        d3.select(this).style("stroke", BLACK);
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
        d3.select(this).style("stroke", WHITE);
      }

      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
  };
}
