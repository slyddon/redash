// @ts-expect-error
import * as d3 from "d3v7";

import { NetworkOptionsType } from "../types";
import { BaseColors } from "@/visualizations/ColorPalette";

const color = d3.scaleOrdinal(Object.values(BaseColors));

function getOptionValueByLabel(options: NetworkOptionsType, entity: any, key: string, defaultValue: any) {
  return getOptionValue(options, entity.label, key, defaultValue);
}

function getOptionValue(options: NetworkOptionsType, label: any, key: string, defaultValue: any) {
  return options.objectOptions[label] ? options.objectOptions[label][key] || defaultValue : defaultValue;
}

export { getOptionValueByLabel, getOptionValue, color };
