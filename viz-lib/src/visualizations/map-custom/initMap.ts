import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet-velocity/dist/leaflet-velocity.css";
import "leaflet-velocity/dist/leaflet-velocity.js";
import "beautifymarker";
import "beautifymarker/leaflet-beautify-marker-icon.css";
import "leaflet-fullscreen";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import resizeObserver from "@/services/resizeObserver";
import chroma from "chroma-js";

L.Control.Layers.include({
  getOverlays: function () {
    let layers: any = [];

    // loop thru all layers in control
    this._layers.forEach((obj: any) => {
      return layers.push(obj);
    });

    return layers;
  },
});

function createCustomChartRenderer(code: any, logErrorsToConsole = false) {
  // Create a function from custom code; catch syntax errors
  let render = () => {};
  try {
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'Function' is not assignable to type '() => v... Remove this comment to see the full error message
    render = new Function("chartData, map, layersControl, element, chroma", code); // eslint-disable-line no-new-func
  } catch (err) {
    if (logErrorsToConsole) {
      console.log(`Error while executing custom graph: ${err}`); // eslint-disable-line no-console
    }
  }

  // Return function that will invoke custom code; catch runtime errors
  return (chartData: any, map: any, layersControl: any, element: any) => {
    try {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 4.
      render(chartData, map, layersControl, element, chroma);
    } catch (err) {
      if (logErrorsToConsole) {
        console.log(`Error while executing custom graph: ${err}`); // eslint-disable-line no-console
      }
    }
  };
}

export default function initMap(container: any) {
  const _map = L.map(container, {
    center: [0.0, 0.0],
    zoom: 6,
    scrollWheelZoom: true,
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ center: [number, number]; zoom... Remove this comment to see the full error message
    fullscreenControl: true,
  });
  const _tileLayer = L.tileLayer("//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(_map);
  const _layersControl = L.control.layers().addTo(_map);

  function updateOptions(options: any) {
    _tileLayer.setUrl(options.mapTileUrl);
    _map.setView([options.centreLat, options.centreLon], options.zoom);
  }

  function draw(chartData: any, options: any) {
    _map.eachLayer((layer) => {
      if (layer !== _tileLayer) {
        _map.removeLayer(layer);
      }
    });

    // @ts-expect-error FIXME: Property 'getOverlays' does not exist... Remove this comment to see the full error message
    _layersControl.getOverlays().forEach((layer: any) => {
      _layersControl.removeLayer(layer.layer);
    });

    const renderCustomChart = createCustomChartRenderer(options.customCode, options.enableConsoleLogs);
    renderCustomChart(chartData, _map, _layersControl, container);

    // @ts-expect-error FIXME: Property 'getOverlays' does not exist... Remove this comment to see the full error message
    if (_layersControl.getOverlays().length === 0) {
      _layersControl.remove();
    }
  }

  const unwatchResize = resizeObserver(container, () => {
    _map.invalidateSize(false);
  });

  return {
    _map,
    updateOptions,
    draw,
    destroy() {
      unwatchResize();
      _map.remove();
    },
  };
}
