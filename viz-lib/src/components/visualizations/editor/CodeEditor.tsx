import React from "react";
import MonacoEditor from "@monaco-editor/react";
import withControlLabel from "./withControlLabel";

type OwnProps = {};

type Props = OwnProps & typeof CodeEditor.defaultProps;

function CodeEditor({ ...props }: Props) {
  const options = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    readOnly: false,
    scrollBeyondLastLine: false,
  };

  return <MonacoEditor options={options} {...props} />;
}

CodeEditor.defaultProps = {};

export default withControlLabel(CodeEditor);
