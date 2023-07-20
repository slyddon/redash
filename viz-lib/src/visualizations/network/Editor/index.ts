import createTabbedEditor from "@/components/visualizations/editor/createTabbedEditor";

import NodeSettings from "./NodeSettings";
import EdgeSettings from "./EdgeSettings";

export default createTabbedEditor([
  { key: "Nodes", title: "Nodes", component: NodeSettings },
  { key: "Edges", title: "Edges", component: EdgeSettings },
]);
