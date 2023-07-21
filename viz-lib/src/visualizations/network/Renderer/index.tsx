import React, { useState, useEffect, useMemo } from "react";
import resizeObserver from "@/services/resizeObserver";
import { RendererPropTypes } from "@/visualizations/prop-types";

import { NetworkDataType, NetworkOptionsType } from "../types";
import initNetwork from "./initNetwork";
import prepareData from "./prepareData";
import "./renderer.less";

export default function Renderer({ data, options }: { data: NetworkDataType; options: NetworkOptionsType }) {
  const [container, setContainer] = useState<null | HTMLDivElement>(null);

  const networkData = useMemo(() => prepareData(data, options), [data, options]);
  const render = useMemo(() => initNetwork(networkData, options), [networkData, options]);

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
