// @ts-expect-error
import * as d3 from "d3v7";
import { NetworkDataType, NetworkOptionsType, Node, Link } from "../types";

import { getOptionValueByLabel, getOptionValue, color } from "./utils";
import { showNodeInfo, showOverview } from "./tooltip";
import {
  BLACK,
  WHITE,
  LINK_DISTANCE,
  FORCE_CENTER_X,
  FORCE_CENTER_Y,
  FORCE_CHARGE,
  FORCE_COLLIDE_RADIUS,
  FORCE_LINK_DISTANCE,
  DEFAULT_NODE_RADIUS,
  DEFAULT_ALPHA_MIN,
  PRECOMPUTED_TICKS,
  VELOCITY_DECAY,
  ZOOM_MIN_SCALE,
  ZOOM_MAX_SCALE,
} from "./constants";

export default function initNetwork(data: NetworkDataType, options: NetworkOptionsType) {
  let blob = data.columns.length > 0 && data.columns[0].name == "blob" ? data.rows[0] : null;

  let nodes: Array<Node> = blob ? JSON.parse(blob.nodes) : [];
  let links: Array<Link> = blob ? JSON.parse(blob.links) : [];

  const nodeTypes: Array<string> = [...new Set(nodes.map((x: Node) => x.label__))];
  const linkTypes: Array<string> = [...new Set(links.map((x: any) => x.label__))];

  // initialise circular layout
  const radius = (nodes.length * LINK_DISTANCE) / (Math.PI * 2);
  const center = { x: 0, y: 0 };
  nodes.forEach((node, i) => {
    node.x = center.x + radius * Math.sin((2 * Math.PI * i) / nodes.length);

    node.y = center.y + radius * Math.cos((2 * Math.PI * i) / nodes.length);
  });

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
      .call(d3.zoom().scaleExtent([ZOOM_MIN_SCALE, ZOOM_MAX_SCALE]).on("zoom", handleZoom));

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
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .style("fill", (d: string) => getOptionValue(options, d, "color", BLACK));

    const linkContainer = svg.append("g").selectAll("path").data(links).enter().append("g");
    const link = linkContainer
      .append("path")
      .attr("class", "link-path")
      .style("stroke", (d: any) => getOptionValueByLabel(options, d, "color", BLACK))
      .style("stroke-width", (d: any) => getOptionValueByLabel(options, d, "strokeWidth", 2))
      .attr("marker-end", (d: any) => `url(#arrow-${d.label__})`);

    const linkLabelContainer = linkContainer.append("g");
    linkLabelContainer
      .append("text")
      .attr("class", "link-caption")
      .attr("y", 1)
      .text((d: any) => d.label__);
    linkLabelContainer
      .call(getBB)
      .insert("rect", "text")
      .attr("width", (d: any) => d.bbox.width)
      .attr("height", (d: any) => d.bbox.height)
      .attr("x", (d: any) => -d.bbox.width / 2)
      .attr("y", (d: any) => -d.bbox.height / 2)
      .style("fill", "#FFFFFF");

    function getBB(selection: any) {
      selection.each(function (d: any) {
        // @ts-expect-error
        d.bbox = this.getBBox();
      });
    }

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
      .velocityDecay(VELOCITY_DECAY)
      .force("charge", d3.forceManyBody().strength(FORCE_CHARGE))
      .force("centerX", d3.forceX(0).strength(FORCE_CENTER_X))
      .force("centerY", d3.forceY(0).strength(FORCE_CENTER_Y))
      .alphaMin(DEFAULT_ALPHA_MIN)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(FORCE_LINK_DISTANCE)
      )
      .force("collision", d3.forceCollide().radius(FORCE_COLLIDE_RADIUS))
      .on("tick", ticked);

    simulation.tick(PRECOMPUTED_TICKS).restart();
    node.call(drag(simulation));

    linkContainer.exit().remove();
    nodeContainer.exit().remove();

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
        let r = getOptionValueByLabel(options, d.target, "radius", DEFAULT_NODE_RADIUS) + 8;
        // @ts-expect-error
        let m = this.getPointAtLength(pl - r);
        return `M${d.source.x},${d.source.y},${m.x},${m.y}`;
      });

      linkLabelContainer.attr("transform", function (d: any) {
        let angle = (Math.atan((d.source.y - d.target.y) / (d.source.x - d.target.x)) * 180) / Math.PI;
        return "translate(" + [(d.source.x + d.target.x) / 2, (d.source.y + d.target.y) / 2] + ")rotate(" + angle + ")";
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
