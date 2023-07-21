import { NetworkOptionsType } from "../types";
import { getOptionValue, color, getOptionValueByLabel } from "./utils";
import { DEFAULT_LINK_COLOUR } from "./constants";

function clearInfo(info: any) {
  info.selectAll("*").remove();
}

function showNodeInfo(options: NetworkOptionsType, info: any, nodeTarget: any) {
  showObjectInfo(options, info, nodeTarget, "Node Properties", (x: any) => color(x));
}

function showLinkInfo(options: NetworkOptionsType, info: any, linkTarget: any) {
  showObjectInfo(options, info, linkTarget, "Link Properties", () => DEFAULT_LINK_COLOUR);
}

function showObjectInfo(
  options: NetworkOptionsType,
  info: any,
  target: any,
  title: string,
  defaultColor: CallableFunction
) {
  clearInfo(info);

  info.append("div").attr("class", "info-title-container").text(title);

  info
    .append("div")
    .style("padding", "2px 5px 5px")
    .append("div")
    .attr("class", "label-pill-container")
    .selectAll("span")
    .data(target.labels ? target.labels : [target.label])
    .enter()
    .append("span")
    .attr("class", "info-header label-pill")
    .style("background-color", (x: any) => getOptionValue(options, x, "color", defaultColor(x)))
    .text((x: string) => x);

  let body = info
    .append("div")
    .attr("class", "info-body")
    .selectAll("div")
    .data(() => {
      let data: any = [];
      const keys = Object.keys(target.properties);
      keys.forEach((key) => {
        data.push({ key: key, val: target.properties[key] });
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
  nodeTypeCount: { label: string; count: number }[],
  linkTypeCount: { label: string; count: number }[],
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
    .data(nodeTypeCount)
    .enter()
    .append("span")
    .attr("class", "info-header label-pill")
    .style("background-color", (x: any) => getOptionValueByLabel(options, x, "color", color(x)))
    .text((x: any) => `${x.label} (${x.count})`);

  // show relationship types
  const linkLabel = body.append("div").attr("class", "info-body-container");
  linkLabel.append("div").text("Relationship Labels");
  linkLabel
    .append("div")
    .attr("class", "label-pill-container")
    .selectAll("div")
    .data(linkTypeCount)
    .enter()
    .append("span")
    .attr("class", "info-header label-pill")
    .style("background-color", (x: any) => getOptionValueByLabel(options, x, "color", DEFAULT_LINK_COLOUR))
    .text((x: any) => `${x.label} (${x.count})`);

  // show count
  const overview = body.append("div").attr("class", "info-body-container");
  overview.append("span").text(`Displaying ${nodeCount} nodes, ${linkCount} relationships.`);
}

export { showOverview, showNodeInfo, showLinkInfo };
