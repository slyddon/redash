import { useDebouncedCallback } from "use-debounce";
import React from "react";
import { Section, InputNumber } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";
import * as Grid from "antd/lib/grid";

export default function SimulationSettings({ options, onOptionsChange }: any) {
  const [debouncedOnOptionsChange] = useDebouncedCallback(onOptionsChange, 200);

  return (
    <React.Fragment>
      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        <Grid.Row gutter={15} type="flex" align="middle">
          <Grid.Col span={12}>
            <InputNumber
              label="Charge Strength"
              data-test="Network.Editor.chargeStrength"
              value={options.chargeStrength}
              onChange={(chargeStrength: any) => debouncedOnOptionsChange({ chargeStrength })}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <InputNumber
              label="Collision Strength"
              data-test="Network.Editor.collisionRadius"
              value={options.collisionRadius}
              onChange={(collisionRadius: any) => debouncedOnOptionsChange({ collisionRadius })}
            />
          </Grid.Col>
        </Grid.Row>

        <Grid.Row gutter={15} type="flex" align="middle">
          <Grid.Col span={12}>
            <InputNumber
              label="Link Strength"
              data-test="Network.Editor.linkStrength"
              value={options.linkStrength}
              onChange={(linkStrength: any) => debouncedOnOptionsChange({ linkStrength })}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <InputNumber
              label="Centre Attraction"
              data-test="Network.Editor.collisionRadius"
              value={options.centreAttraction}
              onChange={(centreAttraction: any) => debouncedOnOptionsChange({ centreAttraction })}
            />
          </Grid.Col>
        </Grid.Row>
      </Section>
    </React.Fragment>
  );
}

SimulationSettings.propTypes = EditorPropTypes;
