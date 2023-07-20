// @ts-expect-error
import * as d3 from "d3v7";
import { NetworkDataType, NetworkOptionsType, Node, Link } from "../types";

import { getOptionValueByLabel, getOptionValue, color } from "./utils";
import { showNodeInfo, showOverview } from "./tooltip";

const WHITE = "#FFFFFF";
const BLACK = "#000000";

const DEFAULT_NODE_RADIUS = 8;

export default function initNetwork(data: NetworkDataType, options: NetworkOptionsType) {
  // TODOs
  // Label

  let blob = data.columns.length > 0 && data.columns[0].name == "blob" ? data.rows[0] : null;

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

    svg
      .append("defs")
      .selectAll("marker")
      .data(linkTypes)
      .enter()
      .append("marker")
      .attr("id", function (d: string) {
        return `arrow-${d}`;
      })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .style("fill", (d: string) => getOptionValue(options, d, "color", BLACK));

    const linkContainer = svg.append("g").selectAll("path").data(links).enter().append("g");
    const link = linkContainer
      .append("path")
      .style("fill", "none")
      .style("stroke", (d: any) => getOptionValueByLabel(options, d, "color", BLACK))
      .style("stroke-width", (d: any) => getOptionValueByLabel(options, d, "strokeWidth", 2))
      .attr("marker-end", (d: any) => `url(#arrow-${d.label__})`);

    const nodeContainer = svg.append("g").selectAll("circle").data(nodes).enter().append("g");
    const node = nodeContainer
      .append("circle")
      .attr("class", "node-circle")
      .attr("r", (d: Node) => getOptionValueByLabel(options, d, "radius", DEFAULT_NODE_RADIUS))
      .attr("fill", (d: Node) => getOptionValueByLabel(options, d, "color", color(d.label__)));
    const nodeRing = nodeContainer
      .append("circle")
      .attr("class", "node-ring")
      .attr("r", (d: Node) => getOptionValueByLabel(options, d, "radius", DEFAULT_NODE_RADIUS))
      .attr("opacity", 0);
    const nodeCaption = nodeContainer
      .append("text")
      .attr("class", "node-caption")
      .text((d: any) => {
        let key = getOptionValueByLabel(options, d, "label", null);
        return key ? d[key] : "";
      });

    const simulation = d3
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
      link.attr("d", (d: any) => `M${d.source.x},${d.source.y},${d.target.x},${d.target.y}`);
      link.attr("d", function (d: any) {
        // @ts-expect-error
        let pl = this.getTotalLength();
        let r = getOptionValueByLabel(options, d.target, "radius", DEFAULT_NODE_RADIUS) + 12;
        // @ts-expect-error
        let m = this.getPointAtLength(pl - r);
        return `M${d.source.x},${d.source.y},${m.x},${m.y}`;
      });

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      nodeRing.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      nodeCaption.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    }

    function handleZoom(x: any) {
      nodeContainer.attr("transform", x.transform);
      linkContainer.attr("transform", x.transform);
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
