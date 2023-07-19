import React, { useMemo, useCallback } from "react";
import Table from "antd/lib/table";
import ColorPicker from "@/components/ColorPicker";
import { EditorPropTypes } from "@/visualizations/prop-types";
import ColorPalette from "@/visualizations/ColorPalette";
import { InputNumber, Select } from "@/components/visualizations/editor";
import { NetworkDataType, NetworkOptionsType, Node } from "../types";

export default function NodeSettings({ options, data, onOptionsChange }: any) {
  const colors = useMemo(
    () => ({
      Automatic: null,
      ...ColorPalette,
    }),
    []
  );

  const parseNodes = (data: NetworkDataType) => {
    let blob = data.rows[0] || null;
    let nodes = blob ? JSON.parse(blob.nodes) : [];
    return nodes;
  };

  const getNodeLabels = (nodes: Array<Node>) => {
    return [...new Set(nodes.map((x: Node) => x.label__))];
  };

  const getNodeProperties = (nodes: any, labels: Array<string>) => {
    let properties: { [index: string]: Array<string> } = {};
    labels.forEach((label: string) => (properties[label] = []));

    // unique keys
    const keysToIgnore = ["fx", "fy", "vx", "vy", "x", "y", "index", "label__"];
    nodes.forEach((node: any) => {
      const keys = Object.keys(node).filter((x) => !keysToIgnore.includes(x));
      properties[node.label__] = [...new Set(properties[node.label__].concat(keys))];
    });

    // transform for select
    let out: { [index: string]: Array<{ value: string | null; label: string }> } = {};
    labels.map((label: string) => {
      out[label] = properties[label].map((key) => {
        return {
          value: key,
          label: key,
        };
      });
    });

    labels.forEach((label: string) =>
      out[label].unshift({
        value: null,
        label: "(None)",
      })
    );

    return out;
  };

  const getDefaultOptions = (labels: Array<string>, options: NetworkOptionsType) => {
    return labels.map((name: string) => {
      return {
        key: name,
        radius: (options.objectOptions[name] || {}).radius || 20,
        color: (options.objectOptions[name] || {}).color || null,
        label: null,
      };
    });
  };

  let nodes = parseNodes(data);
  let labels = getNodeLabels(nodes);
  let nodeProperties = getNodeProperties(nodes, labels);

  const series = useMemo(() => getDefaultOptions(labels, options), [options, data]);

  const updateObjectOption = useCallback(
    (key, prop, value) => {
      onOptionsChange({
        objectOptions: {
          [key]: {
            [prop]: value,
          },
        },
      });
    },
    [onOptionsChange]
  );

  const columns = [
    {
      title: "Series",
      dataIndex: "key",
    },
    {
      title: "Label",
      dataIndex: "label",
      width: "20%",
      render: (unused: any, item: any) => (
        <Select
          data-test={`Chart.Series.${item.key}.Label`}
          defaultValue="(None)"
          onChange={(value: any) => updateObjectOption(item.key, "label", value)}
        >
          {nodeProperties[item.key].map(({ value, label }) => (
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message
            <Select.Option key={value} data-test={`Chart.Series.${item.key}.${label}`}>
              {label}
              {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message */}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Radius",
      dataIndex: "radius",
      width: "20%",
      render: (unused: any, item: any) => (
        <InputNumber
          data-test={`Chart.Series.${item.key}.Radius`}
          value={item.radius}
          onChange={(value: any) => updateObjectOption(item.key, "radius", value)}
        />
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      width: "1%",
      render: (unused: any, item: any) => (
        <ColorPicker
          data-test={`Chart.Series.${item.key}.Color`}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'boolean' is not assignable to type 'never'.
          interactive
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ "Indian Red": string; "Green 2": string; "... Remove this comment to see the full error message
          presetColors={colors}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
          placement="topRight"
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          color={item.color}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '(value: any) => void' is not assignable to t... Remove this comment to see the full error message
          onChange={(value: any) => updateObjectOption(item.key, "color", value)}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'Element' is not assignable to type 'never'.
          addonAfter={<ColorPicker.Label color={item.color} presetColors={colors} />}
        />
      ),
    },
  ];

  return <Table showHeader={true} dataSource={series} columns={columns} pagination={false} />;
}

NodeSettings.propTypes = EditorPropTypes;
