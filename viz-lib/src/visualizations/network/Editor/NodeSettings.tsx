import React, { useMemo, useCallback } from "react";
import Table from "antd/lib/table";
import ColorPicker from "@/components/ColorPicker";
import { EditorPropTypes } from "@/visualizations/prop-types";
import ColorPalette from "@/visualizations/ColorPalette";
import { InputNumber } from "@/components/visualizations/editor";

export default function NodeSettings({ options, data, onOptionsChange }: any) {
  const colors = useMemo(
    () => ({
      Automatic: null,
      ...ColorPalette,
    }),
    []
  );

  const getNodeLabels = (data: any) => {
    let blob = data.rows[0] || null;
    let nodes = blob ? JSON.parse(blob.nodes) : [];
    return [...new Set(nodes.map((x: any) => x.label__))];
  };

  const getDefaultOptions = (options: any, data: any) => {
    return getNodeLabels(data).map((name: any) => {
      return {
        key: name,
        radius: (options.objectOptions[name] || {}).radius || 20,
        color: (options.objectOptions[name] || {}).color || null,
      };
    });
  };

  const series = useMemo(() => getDefaultOptions(options, data), [options, data]);

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

  return <Table showHeader={false} dataSource={series} columns={columns} pagination={false} />;
}

NodeSettings.propTypes = EditorPropTypes;
