import createTabbedEditor from "@/components/visualizations/editor/createTabbedEditor";

import GeneralSettings from "./GeneralSettings";
import ConfigurationSettings from "./ConfigurationSettings";
import StyleSettings from "./StyleSettings";

export default createTabbedEditor([
  { key: "General", title: "General", component: GeneralSettings },
  { key: "Configuration", title: "Configuration", component: ConfigurationSettings },
  { key: "Style", title: "Style", component: StyleSettings },
]);
