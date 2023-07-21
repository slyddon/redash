import React, { useMemo, useCallback } from "react";
import Table from "antd/lib/table";
import ColorPicker from "@/components/ColorPicker";
import { EditorPropTypes } from "@/visualizations/prop-types";
import ColorPalette from "@/visualizations/ColorPalette";
import { InputNumber } from "@/components/visualizations/editor";

export default function EdgeSettings({ options, data, onOptionsChange }: any) {
  const colors = useMemo(
    () => ({
      Automatic: null,
      ...ColorPalette,
    }),
    []
  );

  const getEdgeLabels = (data: any) => {
    let blob = data.rows[0] || null;
    let nodes = blob ? JSON.parse(blob.links) : [];
    return [...new Set(nodes.map((x: any) => x.label))];
  };

  const getDefaultOptions = (options: any, data: any) => {
    return getEdgeLabels(data).map((name: any) => {
      return {
        key: name,
        strokeWidth: (options.objectOptions[name] || {}).strokeWidth || 2,
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
      title: "Edge",
      dataIndex: "key",
    },
    {
      title: "Width",
      dataIndex: "width",
      width: "20%",
      render: (unused: any, item: any) => (
        <InputNumber
          data-test={`Chart.Series.${item.key}.Width`}
          value={item.strokeWidth}
          onChange={(value: any) => updateObjectOption(item.key, "strokeWidth", value)}
        />
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      width: "1%",
      render: (unused: any, item: any) => (
        <ColorPicker
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
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

EdgeSettings.propTypes = EditorPropTypes;
