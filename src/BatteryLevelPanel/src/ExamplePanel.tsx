import {  PanelExtensionContext } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function BatteryPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [battery, setBattery] = useState(0);
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      const msg = renderState.currentFrame?.find((m) => m.topic === "/astra_arduino/roof_box_state");

      if (msg) {
        const message = msg.message as any;
        const rawBattery = message?.roof_box_battery ?? 0;
        const clampedBattery = Math.max(0, Math.min(100, 100*rawBattery));
        setBattery(parseFloat(clampedBattery.toFixed(2)));
      }
    };

    context.watch("topics");
    context.watch("currentFrame");
    context.subscribe([{ topic: "/astra_arduino/roof_box_state" }]);
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      <div style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
        Pourcentage Batterie
      </div>
      <div
        style={{
          width: "100%",
          height: "30px",
          borderRadius: "6px",
          backgroundColor: "#3c3c3c",
          overflow: "hidden",
          border: "1px solid #3c3c3c",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${battery}%`,
            height: "100%",
            backgroundColor: "#32CD32",
            transition: "width 0.3s ease-in-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "bold",
          }}
        >
          {battery.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

export function initExamplePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<BatteryPanel context={context} />);
  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
