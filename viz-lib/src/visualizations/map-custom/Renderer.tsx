import { isEqual, omit } from "lodash";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { RendererPropTypes } from "@/visualizations/prop-types";

import prepareData from "./prepareData";
import initMap from "./initMap";

function useMemoWithDeepCompare(create: any, inputs: any) {
  const valueRef = useRef();
  const value = useMemo(create, inputs);
  if (!isEqual(value, valueRef.current)) {
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'unknown' is not assignable to type 'undefine... Remove this comment to see the full error message
    valueRef.current = value;
  }
  return valueRef.current;
}

export default function Renderer({ data, options }: any) {
  const [container, setContainer] = useState(null);

  const optionsWithoutBounds = useMemoWithDeepCompare(() => omit(options, ["bounds"]), [options]);
  const chartData = useMemo(() => prepareData(data, optionsWithoutBounds), [data, optionsWithoutBounds]);

  const [map, setMap] = useState(null);

  useEffect(() => {
    if (container) {
      const map = initMap(container);
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ onBoundsChange: () => void; up... Remove this comment to see the full error message
      setMap(map);
      return () => {
        map.destroy();
      };
    }
  }, [container]);

  useEffect(() => {
    if (map) {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      map.updateOptions(optionsWithoutBounds);
    }
  }, [map, optionsWithoutBounds]);

  useEffect(() => {
    if (map) {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      map.draw(chartData, optionsWithoutBounds);
    }
  }, [map, chartData, optionsWithoutBounds]);

  return (
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'Dispatch<SetStateAction<null>>' is not assig... Remove this comment to see the full error message
    <div className="map-visualization-container" style={{ zIndex: 1 }} ref={setContainer}>
      <style>{options.customCss}</style>
    </div>
  );
}

Renderer.propTypes = RendererPropTypes;
