import { merge } from "lodash";

export interface MapOptionsType {
  centreLat: number;
  centreLon: number;
  zoom: number;
  mapTileUrl: string;
  enableConsoleLogs: boolean;
}

const DEFAULT_OPTIONS: MapOptionsType = {
  centreLat: 0,
  centreLon: 0,
  zoom: 1,
  mapTileUrl: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  enableConsoleLogs: true,
};

export default function getOptions(options: MapOptionsType) {
  options = merge({}, DEFAULT_OPTIONS, options);
  options.mapTileUrl = options.mapTileUrl || DEFAULT_OPTIONS.mapTileUrl;
  return options;
}
