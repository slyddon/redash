import { NetworkOptionsType } from "../types";

// @ts-expect-error
import * as d3 from "d3v7";

const color = d3.scaleOrdinal(d3.schemeCategory10);

function getOptionValueByLabel(options: NetworkOptionsType, entity: any, key: string, defaultValue: any) {
  return getOptionValue(options, entity.label__, key, defaultValue);
}

function getOptionValue(options: NetworkOptionsType, label: any, key: string, defaultValue: any) {
  return options.objectOptions[label] ? options.objectOptions[label][key] || defaultValue : defaultValue;
}

export { getOptionValueByLabel, getOptionValue, color };
