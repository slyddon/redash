import { merge } from "lodash";
import { NetworkOptionsType } from "./types";

const DEFAULT_OPTIONS: NetworkOptionsType = {
  centreAttraction: 0.03,
  chargeStrength: -250,
  linkStrength: 0.8,
  collisionRadius: 3,
  objectOptions: {},
};

export default function getOptions(options: NetworkOptionsType) {
  options = merge({}, DEFAULT_OPTIONS, options);
  return options;
}
