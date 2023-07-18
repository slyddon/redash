import createTabbedEditor from "@/components/visualizations/editor/createTabbedEditor";

import SimulationSettings from "./SimulationSettings";
import NodeSettings from "./NodeSettings";
import EdgeSettings from "./EdgeSettings";

export default createTabbedEditor([
  { key: "Simulation", title: "Simulation", component: SimulationSettings },
  { key: "Nodes", title: "Nodes", component: NodeSettings },
  { key: "Edges", title: "Edges", component: EdgeSettings },
]);
