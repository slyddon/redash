import { merge } from "lodash";

export interface NetworkOptionsType {
  centreAttraction: number;
  chargeStrength: number;
  linkStrength: number;
  collisionRadius: number;
  objectOptions: any;
}

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
