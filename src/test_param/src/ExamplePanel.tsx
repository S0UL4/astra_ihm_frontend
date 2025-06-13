import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";
import { ReactElement, useState } from "react";

interface ParameterValue {
  type: number;
  bool_value?: boolean;
  integer_value?: string;
  double_value?: number;
  string_value?: string;
  // Optional: Add array types if needed
}

interface GetParametersResponse {
  values: ParameterValue[];
}

function ParamQueryPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [node, setNode] = useState("/LEFT/detection_lisiere_node");
  const [paramName, setParamName] = useState("lisiere_detected");
  const [paramValue, setParamValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    setError(null);
    setParamValue(null);

    if (!context.callService) {
      //console.error("callService is not available in this context.");
      return;
    }
    try {
      const result = (await context.callService(
        `${node}/get_parameters`,
        { names: [paramName] }
      )) as GetParametersResponse;

      const values = result?.values;
      
      if (values && values.length > 0) {
        const val = values[0]; // assuming single param
        if(val)
        {
        const type = val.type;
        const value = val.bool_value
        setParamValue(`${value} (type: ${type})`);
        }
      } else {
        setError("No parameter value returned.");
      }
    } catch (err) {
      setError(`Service call failed: ${(err as Error).message}`);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>🔍 ROS 2 Parameter Viewer</h2>
      <div>
        <label>Node name:</label>
        <input
          style={{ width: "100%", marginBottom: "0.5rem" }}
          value={node}
          onChange={(e) => setNode(e.target.value)}
        />
        <label>Parameter name:</label>
        <input
          style={{ width: "100%", marginBottom: "0.5rem" }}
          value={paramName}
          onChange={(e) => setParamName(e.target.value)}
        />
        <button onClick={handleQuery}>Query Parameter</button>
      </div>
      {paramValue && (
        <div style={{ marginTop: "1rem", color: "green" }}>
          <strong>Value:</strong> {paramValue}
        </div>
      )}
      {error && (
        <div style={{ marginTop: "1rem", color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export function initExamplePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<ParamQueryPanel context={context} />);
  return () => root.unmount();
}