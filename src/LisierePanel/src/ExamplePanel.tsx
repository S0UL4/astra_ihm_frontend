import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";
import { useEffect, useState, useLayoutEffect} from "react";


// const buttons_states = [
//   "/LEFT/edge_tracking_control/active",
//   "/RIGHT/edge_tracking_control/active"
// ];


interface ParameterValue {
  type: number;
  bool_value?: boolean;
}

interface GetParametersResponse {
  values: ParameterValue[];
}

function ToggleSwitch({
  state,
  onToggle,
}: {
  state: boolean | undefined;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: "50px",
        height: "25px",
        borderRadius: "999px",
        backgroundColor:
          state === undefined
            ? "orange"
            : state
              ? "limegreen"
              : "red",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        boxShadow: "0 0 4px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: state === true ? "26px" : state === false ? "2px" : "12px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
        }}
      />
    </div>
  );
}


function EdgeDetectionPanel({ context }: { context: PanelExtensionContext }) {
  const [leftDetected, setLeftDetected] = useState(false);
  const [rightDetected, setRightDetected] = useState(false);
  const [leftTracking, setLeftTracking] = useState(false);
  const [rightTracking, setRightTracking] = useState(false);
  const [etat, setEtat] = useState("..................");
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const checkParam = async (node: string, setFn: (val: boolean) => void) => {
    try {
      if(!context.callService)
      {
        return;
      }
      const result = (await context.callService(
        `${node}/get_parameters`,
        { names: ["lisiere_detected"] }
      )) as GetParametersResponse;

      const val = result?.values?.[0];
      setFn(val?.bool_value ?? false);
    } catch (err) {
      console.error(`Failed to get param from ${node}:`, err);
      setFn(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkParam("/LEFT/detection_lisiere_node", setLeftDetected);
      checkParam("/RIGHT/detection_lisiere_node", setRightDetected);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    const topic = "/edge_tracking_control/feedback";

    if (!topic) return;

    context.onRender = (renderState, done) => {
      setRenderDone(() => done);

      const msg = renderState.currentFrame?.find((m) => m.topic === topic);
      if (msg) {
        const message = msg.message as { data: string };
        if (message?.data) {
          setEtat(message.data);
        }
      }
    };

    context.watch("topics");
    context.watch("currentFrame");
    context.subscribe([{ topic:topic }]);
  }, [context, leftTracking, rightTracking]);

    useEffect(() => {
    renderDone?.();
  }, [renderDone]);


useEffect(() => {
  const activeTopics = [
    { topic: "/LEFT/edge_tracking_control/active", setFn: setLeftTracking },
    { topic: "/RIGHT/edge_tracking_control/active", setFn: setRightTracking },
  ];

  context.onRender = (renderState, done) => {
    setRenderDone(() => done);

    if (!renderState?.currentFrame) return;

    for (const { topic, setFn } of activeTopics) {
      const msg = renderState.currentFrame.find((m) => m.topic === topic);
      if (msg && typeof (msg.message as any).data === "boolean") {
        setFn((msg.message as any).data);
      }
    }
  };

  context.watch("topics");
  context.watch("currentFrame");

  context.subscribe(
    activeTopics.map(({ topic }) => ({ topic }))
  );
}, [context]);


const callEdgeTrackingService = async (side: "LEFT" | "RIGHT", newState: boolean) => {
  const serviceName = `/edge_tracking/control`;
  try {
    if (!context.callService) {
      console.warn("context.callService is not available");
      return;
    }

    await context.callService(serviceName, { side:side, state: newState });
    console.log(`Called ${serviceName} with state: ${newState}`);
  } catch (err) {
    console.error(`Failed to call ${serviceName}:`, err);
  }
};


  const ledStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? "green" : "red",
    width: "3em",
    height: "3em",
    borderRadius: "50%",
    margin: "0.5rem auto"
  });

  const toggleStyle: React.CSSProperties = {
    marginTop: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    justifyContent: "center"
  };

  const sectionStyle: React.CSSProperties = {
    flex: "1 1 250px",
    padding: "1rem",
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    margin: "0.5rem",
    flexWrap: "wrap",
    boxShadow: "0 0 6px rgba(0,0,0,0.1)"
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", width: "100%",height: "100%",overflowY: "auto",fontSize: "clamp(0.6em, 1.5vw, 1em)",display: "flex",flexDirection: "column", boxSizing: "border-box" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Détection et Suivie lisière</h2>
      <div style={containerStyle}>
        <div style={sectionStyle} >
          <div style={ledStyle(leftDetected)}></div>
          <div>Gauche : <strong>{leftDetected ? "Disponible" : "Non Disponible"}</strong></div>
          
          <div style={toggleStyle}>
            Suivre:
            <ToggleSwitch
              state={leftTracking}
              onToggle={() => {
              const newState = !leftTracking;
              setLeftTracking(newState);
              setRightTracking(false);
              callEdgeTrackingService("RIGHT", false);
              callEdgeTrackingService("LEFT", newState);

              }}
            />
          </div>
        </div>
        <div style={sectionStyle} >
          <div style={ledStyle(rightDetected)}></div>
          <div style={{ textAlign: "center" }}>Droite : {rightDetected ? "Disponible" : "Non Disponible"}</div>
          <div style={toggleStyle}>
            Suivre:
            <ToggleSwitch
              state={rightTracking}
              onToggle={() => {
              const newState = !rightTracking;
              setRightTracking(newState);
              setLeftTracking(false);
              callEdgeTrackingService("LEFT", false);
              callEdgeTrackingService("RIGHT", newState);
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <strong>Etat :</strong> {etat}
      </div>
    </div>
  );

}

export function initEdgeDetectionPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);

  context.panelElement.style.display = "flex";
  context.panelElement.style.flexDirection = "column";
  context.panelElement.style.height = "100%";
  context.panelElement.style.width = "100%";
  context.panelElement.style.overflow = "hidden";

  root.render(<EdgeDetectionPanel context={context} />);
  return () => root.unmount();
}
