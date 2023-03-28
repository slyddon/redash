import { useDebouncedCallback } from "use-debounce";
import { map } from "lodash";
import React from "react";
import { Section, Select, InputNumber } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";
import * as Grid from "antd/lib/grid";

const mapTiles = [
  {
    name: "OpenStreetMap",
    url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  {
    name: "OpenStreetMap BW",
    url: "//{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
  },
  {
    name: "OpenStreetMap DE",
    url: "//{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png",
  },
  {
    name: "OpenStreetMap FR",
    url: "//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
  },
  {
    name: "OpenStreetMap Hot",
    url: "//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  },
  {
    name: "Thunderforest",
    url: "//{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png",
  },
  {
    name: "Thunderforest Spinal",
    url: "//{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png",
  },
  {
    name: "OpenMapSurfer",
    url: "//korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}",
  },
  {
    name: "Stamen Toner",
    url: "//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  },
  {
    name: "Stamen Toner Background",
    url: "//stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png",
  },
  {
    name: "Stamen Toner Lite",
    url: "//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
  },
  {
    name: "OpenTopoMap",
    url: "//{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  },
  {
    name: "Carto Dark",
    url: "//{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  },
  {
    name: "Carto Light",
    url: "//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  },
];

export default function ConfigurationSettings({ options, onOptionsChange }: any) {
  const [debouncedOnOptionsChange] = useDebouncedCallback(onOptionsChange, 200);

  return (
    <React.Fragment>
      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        <Select
          label="Map Tiles"
          data-test="Map.Editor.Tiles"
          value={options.mapTileUrl}
          onChange={(mapTileUrl: any) => onOptionsChange({ mapTileUrl })}
        >
          {map(mapTiles, ({ name, url }) => (
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message
            <Select.Option key={url} data-test={"Map.Editor.Tiles." + name}>
              {name}
              {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message */}
            </Select.Option>
          ))}
        </Select>
      </Section>

      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        <Grid.Row gutter={15}>
          <Grid.Col span={12}>
            <InputNumber
              label="Centre Latitude"
              data-test="Map.Editor.centreLatitude"
              value={options.centreLat}
              onChange={(centreLat: any) => debouncedOnOptionsChange({ centreLat })}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <InputNumber
              label="Centre Longitude"
              data-test="Map.Editor.centreLongitude"
              value={options.centreLon}
              onChange={(centreLon: any) => debouncedOnOptionsChange({ centreLon })}
            />
          </Grid.Col>
        </Grid.Row>
      </Section>

      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        <Grid.Row gutter={15}>
          <Grid.Col span={12}>
            <InputNumber
              label="Zoom Level"
              data-test="Map.Editor.zoom"
              value={options.zoom}
              onChange={(zoom: any) => debouncedOnOptionsChange({ zoom })}
            />
          </Grid.Col>
        </Grid.Row>
      </Section>
    </React.Fragment>
  );
}

ConfigurationSettings.propTypes = EditorPropTypes;
