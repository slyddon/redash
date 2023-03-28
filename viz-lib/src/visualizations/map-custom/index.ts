import getOptions from "./getOptions";
import Renderer from "./Renderer";
import Editor from "./Editor";

export default {
  type: "MAP-CUSTOM",
  name: "Map (Custom)",
  getOptions,
  Renderer,
  Editor,

  defaultColumns: 3,
  defaultRows: 8,
  minColumns: 2,
};
