import { merge } from "lodash";
import { NetworkOptionsType } from "./types";

const DEFAULT_OPTIONS: NetworkOptionsType = {
  objectOptions: {},
};

export default function getOptions(options: NetworkOptionsType) {
  options = merge({}, DEFAULT_OPTIONS, options);
  return options;
}
