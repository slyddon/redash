import { NetworkOptionsType } from "../getOptions";

// @ts-expect-error
import * as d3 from "d3v7";

const color = d3.scaleOrdinal(d3.schemeCategory10);

function getOptionValue(options: NetworkOptionsType, entity: any, key: string, defaultValue: any) {
  return options.objectOptions[entity.label__]
    ? options.objectOptions[entity.label__][key] || defaultValue
    : defaultValue;
}

export { getOptionValue, color };
