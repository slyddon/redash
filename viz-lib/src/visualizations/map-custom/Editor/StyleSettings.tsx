import { useDebouncedCallback } from "use-debounce";
import { isNil, trimStart } from "lodash";
import React from "react";
import { Section, TextArea } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

const defaultCustomCss = trimStart(`
/* Inject custom CSS for styling
.leaflet-popup-tip { height: 0px }
.leaflet-popup-content-wrapper { border-radius: 0px}
.leaflet-popup-content-wrapper { background: #fbfcfd }
*/
`);

export default function StyleSettings({ options, onOptionsChange }: any) {
  const [debouncedOnOptionsChange] = useDebouncedCallback(onOptionsChange, 200);

  return (
    <React.Fragment>
      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        <TextArea
          label="Custom CSS"
          data-test="Chart.Custom.CSS"
          rows="10"
          defaultValue={isNil(options.customCss) ? defaultCustomCss : options.customCss}
          onChange={(event: any) => debouncedOnOptionsChange({ customCss: event.target.value })}
        />
      </Section>
    </React.Fragment>
  );
}

StyleSettings.propTypes = EditorPropTypes;
