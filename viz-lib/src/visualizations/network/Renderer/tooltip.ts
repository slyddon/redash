import { NetworkOptionsType } from "../getOptions";
import { getOptionValue, color } from "./utils";

function clearInfo(info: any) {
  info.transition().duration(50).selectAll("*").remove();
}

function showNodeInfo(options: NetworkOptionsType, info: any, nodeTarget: any) {
  clearInfo(info);

  info
    .append("div")
    .attr("class", "info-header-container")
    .append("span")
    .attr("class", "info-header")
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
    .attr("class", "info-key-container");

  body
    .append("div")
    .attr("class", "info-key-header")
    .text((x: any) => x.key);

  body
    .append("div")
    .attr("class", "info-key-body")
    .text((x: any) => x.val);
}

function showOverview(options: NetworkOptionsType, info: any, nodeTarget: any) {
  clearInfo(info);
}

export { showOverview, showNodeInfo };
