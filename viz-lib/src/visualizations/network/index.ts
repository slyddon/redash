import getOptions from "./getOptions";
import Renderer from "./Renderer";
import Editor from "./Editor";

export interface NetworkDataType {
  columns: {
    name: string;
    friendly_name: string;
  }[];

  rows: any[];
}

export default {
  type: "NETWORK",
  name: "Network",
  getOptions,
  Renderer,
  Editor,

  defaultRows: 7,
};
