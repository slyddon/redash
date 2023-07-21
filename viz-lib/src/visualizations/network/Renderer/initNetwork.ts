// @ts-expect-error
import * as d3 from "d3v7";
import { GraphType, NetworkOptionsType, NodeType, LinkType } from "../types";

import { getOptionValueByLabel, getOptionValue } from "./utils";
import { showNodeInfo, showLinkInfo, showOverview } from "./tooltip";
import {
  BLACK,
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
  DEFAULT_ALPHA_TARGET,
  DRAGGING_ALPHA_TARGET,
  DRAGGING_ALPHA,
  EXTRA_TICKS_PER_RENDER,
  ARROW_SIZE,
} from "./constants";

export default function initNetwork({ nodes, links }: GraphType, options: NetworkOptionsType) {
  const nodeTypes: Array<string> = [...new Set(nodes.map((x: NodeType) => x.label))];
  const linkTypes: Array<string> = [...new Set(links.map((x: LinkType) => x.label))];

  return (element: HTMLDivElement) => {
    ////////////////////////////////////////////////////////////////////////////////////

    const root = d3.select(element);
    root.selectAll("*").remove();

    const containerBounds = d3.select(element).node().getBoundingClientRect();
    const width = Math.floor(containerBounds.width);
    const height = Math.floor(containerBounds.height);

    if (width <= 0 || height <= 0) {
      return;
    }

    const container = root.append("div").attr("class", "network-split-container");
    const networkContainer = container.append("div").attr("class", "network-container");
    const infoContainer = container.append("div").attr("class", "info-container");

    ////////////////////////////////////////////////////////////////////////////////////

    const svg: d3.Selection<SVGGElement, any, any, any> = networkContainer
      .append("svg")
      .attr("class", "network")
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom().scaleExtent([ZOOM_MIN_SCALE, ZOOM_MAX_SCALE]).on("zoom", handleZoom));

    const baseContainer = svg.append("g");

    ////////////////////////////////////////////////////////////////////////////////////

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
      .attr("markerWidth", ARROW_SIZE)
      .attr("markerHeight", ARROW_SIZE)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .style("fill", (d: string) => getOptionValue(options, d, "color", BLACK));

    const linkContainer = baseContainer
      .append("g")
      .selectAll("g.link-container")
      .data(links)
      .enter()
      .append("g")
      .classed("link-container", true);
    const link = linkContainer
      .append("path")
      .attr("class", "link-path")
      .style("stroke", (d: any) => d.color)
      .style("stroke-width", (d: any) => d.strokeWidth)
      .attr("marker-end", (d: any) => `url(#arrow-${d.label})`);

    const linkLabelContainer = linkContainer.append("g");
    linkLabelContainer
      .append("text")
      .attr("class", "link-caption")
      .attr("y", 1)
      .text((d: any) => d.label);
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

    const linkOverlay = linkContainer
      .append("path")
      .attr("class", "link-overlay")
      .attr("stroke-width", (d: LinkType) => d.strokeWidth + ARROW_SIZE * 2)
      .attr("opacity", 0);

    ////////////////////////////////////////////////////////////////////////////////////

    const nodeContainer = baseContainer
      .append("g")
      .selectAll("g.node-container")
      .data(nodes)
      .enter()
      .append("g")
      .classed("node-container", true);
    const node = nodeContainer
      .append("circle")
      .attr("class", "node-circle")
      .attr("r", (d: NodeType) => d.radius)
      .attr("fill", (d: NodeType) => d.color);
    nodeContainer
      .append("circle")
      .attr("class", "node-ring")
      .attr("r", (d: NodeType) => d.radius + 1)
      .attr("opacity", 0);
    nodeContainer
      .selectAll("text.caption")
      .data((node: NodeType) => node.caption)
      .join("text")
      // Classed element ensures duplicated data will be removed before adding
      .classed("caption", true)
      .attr("class", "node-caption")
      .attr("x", 0)
      .attr("y", (line: any) => line.baseline)
      .text((line: any) => line.text);

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
      .on("tick", () => {
        simulation.tick(EXTRA_TICKS_PER_RENDER);
        ticked();
      });

    linkContainer.exit().remove();
    nodeContainer.exit().remove();

    nodeContainer.call(drag(simulation));

    // start
    simulation.stop();
    let precomputeTicks = 0;
    const start = performance.now();
    while (performance.now() - start < 250 && precomputeTicks < PRECOMPUTED_TICKS) {
      simulation.tick(1);
      precomputeTicks += 1;
      if (simulation.alpha() <= simulation.alphaMin()) {
        break;
      }
    }
    simulation.restart();

    ////////////////////////////////////////////////////////////////////////////////////

    const info = infoContainer.append("div");

    const showOverviewPane = () => showOverview(options, info, nodeTypes, linkTypes, nodes.length, links.length);
    showOverviewPane();

    // node selection
    let selectedNode: NodeType | undefined;
    const deselectNodes = () => {
      selectedNode = undefined;
      d3.selectAll(".node-ring").attr("opacity", 0);
    };
    const selectNode = (currentTarget: any, nodeTarget: NodeType) => {
      selectedNode = nodeTarget;
      d3.select(currentTarget).select(".node-ring").attr("opacity", 0.75);
    };
    const hoverNode = (currentTarget: any) => {
      d3.select(currentTarget).select(".node-ring").attr("opacity", 0.3);
    };
    const showNodePane = (nodeTarget: NodeType) => showNodeInfo(options, info, nodeTarget);

    nodeContainer
      .on("click", function (e: any, nodeTarget: NodeType) {
        if (selectedNode?.id !== nodeTarget.id) {
          deselectNodes();
          selectNode(e.currentTarget, nodeTarget);
        } else {
          deselectNodes();
        }
      })
      .on("mouseover", function (e: any, nodeTarget: NodeType) {
        hoverNode(e.currentTarget);
        showNodePane(nodeTarget);
      })
      .on("mouseout", function (e: any, nodeTarget: NodeType) {
        if (selectedNode?.id !== nodeTarget.id) {
          d3.select(e.currentTarget).select(".node-ring").attr("opacity", 0);
        } else {
          d3.select(e.currentTarget).select(".node-ring").attr("opacity", 0.75);
        }

        if (selectedNode !== undefined) {
          showNodePane(selectedNode);
        } else if (selectedLink !== undefined) {
          showLinkPane(selectedLink);
        } else {
          showOverviewPane();
        }
      });

    // link selection
    let selectedLink: LinkType | undefined;
    const deselectLinks = () => {
      selectedLink = undefined;
      d3.selectAll(".link-overlay").attr("opacity", 0);
    };
    const selectLink = (currentTarget: any, linkTarget: LinkType) => {
      selectedLink = linkTarget;
      d3.select(currentTarget).select(".link-overlay").attr("opacity", 0.6);
    };
    const hoverLink = (currentTarget: any) => {
      d3.select(currentTarget).select(".link-overlay").attr("opacity", 0.3);
    };
    const showLinkPane = (linkTarget: LinkType) => showLinkInfo(options, info, linkTarget);

    linkContainer
      .on("click", function (e: any, linkTarget: LinkType) {
        if (selectedLink?.id !== linkTarget.id) {
          deselectLinks();
          selectLink(e.currentTarget, linkTarget);
        } else {
          deselectLinks();
        }
      })
      .on("mouseover", function (e: any, linkTarget: LinkType) {
        hoverLink(e.currentTarget);
        showLinkPane(linkTarget);
      })
      .on("mouseout", function (e: any, linkTarget: LinkType) {
        if (selectedLink?.id !== linkTarget.id) {
          d3.select(e.currentTarget).select(".link-overlay").attr("opacity", 0);
        } else {
          d3.select(e.currentTarget).select(".link-overlay").attr("opacity", 0.6);
        }

        if (selectedLink !== undefined) {
          showLinkPane(selectedLink);
        } else if (selectedNode !== undefined) {
          showNodePane(selectedNode);
        } else {
          showOverviewPane();
        }
      });
    networkContainer.on("click", function (e: any) {
      function clickedOnEntity() {
        //@ts-expect-error
        return this == e.target;
      }

      let notOnEntity = node.filter(clickedOnEntity).empty() && linkOverlay.filter(clickedOnEntity).empty();
      if (notOnEntity) {
        deselectNodes();
        deselectLinks();

        showOverview(options, info, nodeTypes, linkTypes, nodes.length, links.length);
      }
    });

    ////////////////////////////////////////////////////////////////////////////////////

    function ticked() {
      link.attr("d", (d: any) => `M${d.source.x},${d.source.y},${d.target.x},${d.target.y}`);
      linkOverlay.attr("d", (d: any) => `M${d.source.x},${d.source.y},${d.target.x},${d.target.y}`);
      link.attr("d", function (d: any) {
        // @ts-expect-error
        let pl = this.getTotalLength();
        let r =
          getOptionValueByLabel(options, d.target, "radius", DEFAULT_NODE_RADIUS) + d.strokeWidth * ARROW_SIZE + 1;
        // @ts-expect-error
        let m = this.getPointAtLength(pl - r);
        return `M${d.source.x},${d.source.y},${m.x},${m.y}`;
      });

      linkLabelContainer.attr("transform", function (d: any) {
        let angle = (Math.atan((d.source.y - d.target.y) / (d.source.x - d.target.x)) * 180) / Math.PI;
        return "translate(" + [(d.source.x + d.target.x) / 2, (d.source.y + d.target.y) / 2] + ")rotate(" + angle + ")";
      });

      nodeContainer.attr("transform", function (d: any) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }

    function handleZoom(e: any) {
      baseContainer.transition().duration(50).attr("transform", String(e.transform));
    }

    function drag(simulation: any) {
      let initialDragPosition: [number, number];
      let restartedSimulation = false;
      const tolerance = 25;

      function dragstarted(event: any) {
        initialDragPosition = [event.x, event.y];
        restartedSimulation = false;
      }

      function dragged(event: any) {
        const dist = Math.pow(initialDragPosition[0] - event.x, 2) + Math.pow(initialDragPosition[1] - event.y, 2);

        // This is to prevent clicks/double clicks from restarting the simulation
        if (dist > tolerance && !restartedSimulation) {
          // Set alphaTarget to a value higher than alphaMin so the simulation
          // isn't stopped while nodes are being dragged.
          simulation.alphaTarget(DRAGGING_ALPHA_TARGET).alpha(DRAGGING_ALPHA).restart();
          restartedSimulation = true;
        }

        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (restartedSimulation) {
          // Reset alphaTarget so the simulation cools down and stops.
          simulation.alphaTarget(DEFAULT_ALPHA_TARGET);
        }
      }

      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
  };
}
