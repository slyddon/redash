import { NetworkDataType, NetworkOptionsType, NodeType, LinkType, GraphType } from "../types";
import { fitCaptionIntoCircle } from "./captions";
import { DEFAULT_LINK_COLOUR, LINK_DISTANCE, DEFAULT_NODE_RADIUS } from "./constants";
import { getOptionValueByLabel, color } from "./utils";

export default function prepareData(data: NetworkDataType, options: NetworkOptionsType): GraphType {
  let blob = data.columns.length > 0 && data.columns[0].name == "blob" ? data.rows[0] : null;

  let nodes: Array<NodeType> = blob ? JSON.parse(blob.nodes) : [];
  let links: Array<LinkType> = blob ? JSON.parse(blob.links) : [];

  // initialise circular layout
  circularLayout(nodes);
  addNodeAttributes(nodes, options);
  addLinkAttributes(links, options);

  return { nodes: nodes, links: links };
}

function circularLayout(nodes: Array<NodeType>) {
  const radius = (nodes.length * LINK_DISTANCE) / (Math.PI * 2);
  const center = { x: 0, y: 0 };
  nodes.forEach((node, i) => {
    node.x = center.x + radius * Math.sin((2 * Math.PI * i) / nodes.length);
    node.y = center.y + radius * Math.cos((2 * Math.PI * i) / nodes.length);
  });
}

function addNodeAttributes(nodes: Array<NodeType>, options: NetworkOptionsType) {
  const canvas = document.createElement("canvas");
  canvas.style.display = "none";
  const canvas2DContext = canvas.getContext("2d");

  nodes.forEach((node) => {
    node.color = getOptionValueByLabel(options, node, "color", color(node.label));
    node.radius = getOptionValueByLabel(options, node, "radius", DEFAULT_NODE_RADIUS);
    node.captionKey = getOptionValueByLabel(options, node, "label", null);

    if (canvas2DContext) {
      node.caption = fitCaptionIntoCircle(node, canvas2DContext);
    }
  });
}

function addLinkAttributes(links: Array<LinkType>, options: NetworkOptionsType) {
  links.forEach((link) => {
    link.color = getOptionValueByLabel(options, link, "color", DEFAULT_LINK_COLOUR);
    link.strokeWidth = getOptionValueByLabel(options, link, "strokeWidth", 2);
  });
}
