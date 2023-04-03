import { useDebouncedCallback } from "use-debounce";
import { isNil, trimStart } from "lodash";
import React from "react";
import { Section, TextArea, Switch } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

const defaultCustomCode = trimStart(`
// Available variables are chartData, map, element, chroma
// Type console.log(chartData); for more info about the data
// Leaflet examples and docs: https://leafletjs.com/
`);

export default function GeneralSettings({ options, onOptionsChange }: any) {
  const [debouncedOnOptionsChange] = useDebouncedCallback(onOptionsChange, 200);

  return (
    <React.Fragment>
      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        <TextArea
          label="Custom code"
          data-test="Chart.Custom.Code"
          rows="10"
          defaultValue={isNil(options.customCode) ? defaultCustomCode : options.customCode}
          onChange={(event: any) => debouncedOnOptionsChange({ customCode: event.target.value })}
        />
      </Section>

      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
        <Switch
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          defaultChecked={options.enableConsoleLogs}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '(enableConsoleLogs: any) => any' is not assi... Remove this comment to see the full error message
          onChange={(enableConsoleLogs: any) => onOptionsChange({ enableConsoleLogs })}
        >
          Show errors in the console
        </Switch>
      </Section>
    </React.Fragment>
  );
}

GeneralSettings.propTypes = EditorPropTypes;
