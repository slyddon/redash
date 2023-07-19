import getOptions from "./getOptions";
import Renderer from "./Renderer";
import Editor from "./Editor";

export default {
  type: "NETWORK",
  name: "Network",
  getOptions,
  Renderer,
  Editor,

  defaultRows: 7,
};
