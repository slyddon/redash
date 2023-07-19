import { NetworkOptionsType } from "../types";
import { getOptionValue, color } from "./utils";

function clearInfo(info: any) {
  info.selectAll("*").remove();
}

function showNodeInfo(options: NetworkOptionsType, info: any, nodeTarget: any) {
  clearInfo(info);

  info.append("div").attr("class", "info-title-container").text("Node Properties");

  info
    .append("div")
    .style("padding", "2px 5px 5px")
    .append("div")
    .attr("class", "label-pill-container")
    .append("span")
    .attr("class", "info-header label-pill")
    .style("background-color", getOptionValue(options, nodeTarget, "color", color(nodeTarget.label__)))
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
    .attr("class", "info-body-container info-key-container");

  body
    .append("div")
    .attr("class", "info-key-header")
    .text((x: any) => x.key);

  body
    .append("div")
    .attr("class", "info-key-body")
    .text((x: any) => x.val);
}

function showOverview(
  options: NetworkOptionsType,
  info: any,
  nodeTypes: Array<string>,
  linkTypes: Array<string>,
  nodeCount: number,
  linkCount: number
) {
  clearInfo(info);

  info.append("div").attr("class", "info-title-container").text("Overview");

  const body = info.append("div").attr("class", "info-body");

  // show labels
  const nodeLabel = body.append("div").attr("class", "info-body-container");
  nodeLabel.append("div").text("Node Labels");
  nodeLabel
    .append("div")
    .attr("class", "label-pill-container")
    .selectAll("div")
    .data(nodeTypes)
    .enter()
    .append("span")
    .attr("class", "info-header label-pill")
    .style("background-color", (x: any) => options.objectOptions[x].color || color(x))
    .text((x: string) => x);

  // show relationship types
  const linkLabel = body.append("div").attr("class", "info-body-container");
  linkLabel.append("div").text("Relationship Labels");
  linkLabel
    .append("div")
    .attr("class", "label-pill-container")
    .selectAll("div")
    .data(linkTypes)
    .enter()
    .append("span")
    .attr("class", "info-header label-pill")
    .style("background-color", (x: any) => options.objectOptions[x].color || color(x))
    .text((x: string) => x);

  // show count
  const overview = body.append("div").attr("class", "info-body-container");
  overview.append("span").text(`Displaying ${nodeCount} nodes, ${linkCount} relationships.`);
}

export { showOverview, showNodeInfo };
