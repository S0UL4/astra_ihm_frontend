import { PanelExtensionContext } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { IoIosSpeedometer } from "react-icons/io";

const BUFFER_SIZE = 80; // Adjust this to make it more/less smooth

function OdomVelocityPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [linearX, setLinearX] = useState(0);
  const [angularZ, setAngularZ] = useState(0);
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  const linearXBuffer = useRef<number[]>([]);
  const angularZBuffer = useRef<number[]>([]);

  const updateAveragedValues = (newLinear: number, newAngular: number) => {
    // Update linear buffer
    linearXBuffer.current.push(newLinear);
    if (linearXBuffer.current.length > BUFFER_SIZE) {
      linearXBuffer.current.shift();
    }

    // Update angular buffer
    angularZBuffer.current.push(newAngular);
    if (angularZBuffer.current.length > BUFFER_SIZE) {
      angularZBuffer.current.shift();
    }

    // Compute averages
    const linearAvg =
      linearXBuffer.current.reduce((sum, val) => sum + val, 0) / linearXBuffer.current.length;
    const angularAvg =
      angularZBuffer.current.reduce((sum, val) => sum + val, 0) / angularZBuffer.current.length;

    setLinearX(parseFloat(linearAvg.toFixed(3)));
    setAngularZ(parseFloat(angularAvg.toFixed(4)));
  };

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);

      const msg = renderState.currentFrame?.find(
        (m) => m.topic === "/hardware_interface/odom"
      );

      if (msg) {
        const message = msg.message as any;
        const linear = message?.twist?.twist?.linear?.x ?? 0;
        const angular = message?.twist?.twist?.angular?.z ?? 0;

        updateAveragedValues(linear, angular);
      }
    };

    context.watch("topics");
    context.watch("currentFrame");
    context.subscribe([{ topic: "/hardware_interface/odom" }]);
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        <IoIosSpeedometer size={20} />
        Vitesse du Robot
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <div style={{ padding: "1rem", fontWeight: "bold", fontSize: "1.2rem" }}>
          Angulaire : {angularZ} rad/s
        </div>
        <div style={{ padding: "1rem", fontWeight: "bold", fontSize: "1.2rem" }}>
          Linéaire : {linearX} m/s
        </div>
      </div>
    </div>
  );
}

export function initOdomVelocityPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<OdomVelocityPanel context={context} />);

  return () => {
    root.unmount();
  };
}
