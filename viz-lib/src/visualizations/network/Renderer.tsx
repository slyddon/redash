import React, { useState, useEffect, useMemo } from "react";
import resizeObserver from "@/services/resizeObserver";
import { RendererPropTypes } from "@/visualizations/prop-types";

import { NetworkDataType } from "./index";
import { NetworkOptionsType } from "./getOptions";
import initNetwork from "./initNetwork";
import "./renderer.less";

export default function Renderer({ data, options }: { data: NetworkDataType; options: NetworkOptionsType }) {
  const [container, setContainer] = useState<null | HTMLDivElement>(null);

  const render = useMemo(() => initNetwork(data, options), [data, options]);

  useEffect(() => {
    if (container) {
      render(container);
      const unwatch = resizeObserver(container, () => {
        render(container);
      });
      return unwatch;
    }
  }, [container, render]);

  return <div className="network-visualization-container" ref={setContainer} />;
}

Renderer.propTypes = RendererPropTypes;
