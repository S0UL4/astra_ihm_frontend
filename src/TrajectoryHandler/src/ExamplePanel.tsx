import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";
import { useRef, useState, useEffect, useLayoutEffect } from "react";

// const scenarioList = [
//   "scenario_1_ep1",
//   "scenario_1_ep2",
//   "scenario_1_ep3",
//   "scenario_2",
//   "scenario_3_ep1",
//   "scenario_3_ep2",
//   "scenario_mixte",
// ];

const scenarioList = [
  "scenario_1_epreuve_1",
  "scenario_2_epreuve_1",
  "scenario_3_epreuve_1"
];


const buttonBaseStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  fontSize: "clamp(0.7em, 1.2vw, 1em)",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.1s ease, background-color 0.2s",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
};

const greenButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: "limegreen",
  color: "white",
};

const redButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: "red",
  color: "white",
};

function PressableButton({
  children,
  style,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  style: React.CSSProperties;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      style={{
        ...style,
        transform: isPressed ? "scale(0.96)" : "scale(1)",
        opacity: disabled ? 0.5 : 1,
      }}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ToggleSwitch({
  state,
  onToggle,
}: {
  state: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: "50px",
        height: "25px",
        borderRadius: "999px",
        backgroundColor: state ? "limegreen" : "#ccc",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        boxShadow: "inset 0 0 4px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: state ? "26px" : "2px",
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

type PanelState = {
  nearest_point_start?: boolean;
  reverse_gear?: boolean;
  last_status?: string;
};

function ZoneScenarioPanel({ context }: { context: PanelExtensionContext }) {
  const [panelState, setPanelState] = useState<PanelState>(() => {
    return context.initialState as PanelState;
  });

  const [selectedScenario, setSelectedScenario] = useState("");
  const [trajectoryName, setTrajectoryName] = useState("");

  const [statusMessage, setStatusMessage] = useState("Status ....");
  const hasRendered = useRef(false);

  const [startFromNearest, setStartFromNearest] = useState<boolean>(panelState.nearest_point_start ?? false);
  const [reverseGear, setReverseGear] = useState<boolean>(panelState.reverse_gear ?? false);
  const advertisedRef = useRef({ nearest: false, reverse: false });

  useEffect(() => {
    if (!hasRendered.current) {
      hasRendered.current = true;
      const last = (context.initialState as PanelState)?.last_status;
      if (last) {
        setStatusMessage(`Dernière etat: ${last}`);
      }
    }
  }, [context]);


  const callService = async (serviceName: string, args: any) => {
    if (!context.callService) return;
    try {
      const result = (await context.callService(serviceName, args)) as { status: string; message?: string };

      const msg = result.status || result.message || " Succès";
      setStatusMessage(msg);
      setPanelState((prev) => {
        const updated = { ...prev, last_status: msg };
        context.saveState(updated);
        return updated;
      });


    } catch (err) {
      console.error("Service call failed:", err);
      const failMsg = "❌ Vérifier le service";
      setStatusMessage(failMsg);
      setPanelState((prev) => {
        const updated = { ...prev, last_status: failMsg };
        context.saveState(updated);
        return updated;
      });
    }

  };

  const advertiseIfNeeded = (key: "nearest" | "reverse", topic: string) => {
    if (!advertisedRef.current[key] && context.advertise) {
      context.advertise(topic, "std_msgs/Bool");
      advertisedRef.current[key] = true;
    }
  };

  const publishBoolTopic = (topic: string, value: boolean) => {
    if (!context.publish) return;
    context.publish(topic, { data: value });
  };

  useEffect(() => {
    advertiseIfNeeded("nearest", "/mission_handler/param/start_from_nearest_point");
    advertiseIfNeeded("reverse", "/mission_handler/trajectory_handler/backtracking/reverse_gear");
  }, [context]);

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      const nearestMsg = renderState.currentFrame?.find(
        (m) => m.topic === "/mission_handler/param/start_from_nearest_point"
      );
      if (nearestMsg && typeof (nearestMsg.message as any).data === "boolean") {
        const val = (nearestMsg.message as any).data;
        setStartFromNearest(val);
        setPanelState((prev) => {
          const updated = { ...prev, nearest_point_start: val };
          context.saveState(updated);
          return updated;
        });
      }
      done();
    };

    context.watch("topics");
    context.watch("currentFrame");
    context.subscribe([
      { topic: "/mission_handler/param/start_from_nearest_point" },
    ]);
  }, [context]);

  return (
    <div
      style={{
        padding: "1rem",
        fontFamily: "sans-serif",
        width: "100%",
        height: "100%",
        fontSize: "clamp(0.6em, 1.5vw, 1em)",
        boxSizing: "border-box",
        display: "flex",
        flexWrap: "wrap",
        gap: "2rem",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {/* Zone scenarios */}
      <div
        style={{
          border: "2px solid black",
          borderRadius: "1rem",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          minWidth: "250px",
        }}
      >
        <h3 style={{ textAlign: "center", fontWeight: "bold" }}>
          Zone scenarios
        </h3>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option value="">--Choisir un scenario--</option>
          {scenarioList.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <PressableButton
            style={greenButtonStyle}
            onClick={() => callService("/mission_handler/scenario_handler/load_zones", { scenario_name: selectedScenario })}
            disabled={!selectedScenario}
          >
            Charger la zone
          </PressableButton>

          <PressableButton
            style={greenButtonStyle}
            onClick={() => callService("/mission_handler/scenario_handler/load_wps", { scenario_name: selectedScenario })}
            disabled={!selectedScenario}
          >
            Charger les WPs
          </PressableButton>
        </div>

        <PressableButton style={redButtonStyle} onClick={() => callService("/mission_handler/scenario_handler/load_wps/cancel_task", {})}>
          Annuler Mission
        </PressableButton>
      </div>

      {/* Commencer par le point le plus proche */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: "bold" }}>
          Commencer par le point le plus proche
        </p>
        <ToggleSwitch
          state={startFromNearest}
          onToggle={() => {
            const newValue = !startFromNearest;
            setStartFromNearest(newValue);
            setPanelState((prev) => {
              const updated = { ...prev, nearest_point_start: newValue };
              context.saveState(updated);
              return updated;
            });
            publishBoolTopic("/mission_handler/param/start_from_nearest_point", newValue);
          }}
        />
      </div>

      {/* Gestionnaire du trajectoire */}
      <div
        style={{
          border: "2px solid black",
          borderRadius: "1rem",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          minWidth: "280px",
        }}
      >
        <h3 style={{ textAlign: "center", fontWeight: "bold" }}>
          Gestionnaire du trajectoire
        </h3>

        <input
          type="text"
          placeholder="Nom de la trajectoire ( csv file name )"
          value={trajectoryName}
          onChange={(e) => setTrajectoryName(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <PressableButton
            style={greenButtonStyle}
            onClick={() => callService("/mission_handler/trajectory_handler/saver", { start_stop: true, traj_name: trajectoryName })}
            disabled={!trajectoryName}
          >
            Lancer l'enregistrement
          </PressableButton>

          <PressableButton
            style={greenButtonStyle}
            onClick={() => callService("/mission_handler/trajectory_handler/saver", { start_stop: false, traj_name: trajectoryName })}
            disabled={!trajectoryName}
          >
            Arrêter l'enregistrement
          </PressableButton>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <PressableButton
            style={greenButtonStyle}
            onClick={() => callService("/mission_handler/trajectory_handler/start_replay", { traj_name: trajectoryName })}
            disabled={!trajectoryName}
          >
            Lancer le rejeu
          </PressableButton>

          <PressableButton
            style={redButtonStyle}
            onClick={() => callService("/mission_handler/trajectory_handler/start_replay/cancel_task", {})}
          >
            Arrêter le rejeu
          </PressableButton>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <PressableButton
            style={greenButtonStyle}
            onClick={() => callService("/mission_handler/trajectory_handler/backtracking/start", {})}
          >
            Lancer le retour sur trace
          </PressableButton>

          <PressableButton
            style={redButtonStyle}
            onClick={() => callService("/mission_handler/trajectory_handler/backtracking/cancel_task", {})}
          >
            Arrêter le retour sur trace
          </PressableButton>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <PressableButton
            style={{ ...buttonBaseStyle, backgroundColor: "lightblue" }}
            onClick={() => callService("/mission_handler/trajectory_handler/backtracking/reset", {})}
          >
            RAZ le retour sur trace
          </PressableButton>
          <span style={{ fontWeight: "bold" }}>Activer marche arrière</span>
          <ToggleSwitch
            state={reverseGear}
            onToggle={() => {
              const newValue = !reverseGear;
              setReverseGear(newValue);
              setPanelState((prev) => {
                const updated = { ...prev, reverse_gear: newValue };
                context.saveState(updated);
                return updated;
              });
              publishBoolTopic("/mission_handler/trajectory_handler/backtracking/reverse_gear", newValue);
            }}
          />
        </div>
      </div>

      {/* Status display */}
      <div
        style={{
          border: "2px solid #ccc",
          borderRadius: "0.75rem",
          padding: "0.75rem 1.25rem",
          minWidth: "260px",
          backgroundColor: "#f9f9f9",
          fontWeight: "bold",
          textAlign: "center",
          color: "#333",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          alignSelf: "center",
        }}
      >
        {statusMessage}
      </div>
    </div>
  );
}

export function initZoneScenarioPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  context.panelElement.style.display = "flex";
  context.panelElement.style.flexDirection = "column";
  context.panelElement.style.height = "100%";
  context.panelElement.style.width = "100%";
  context.panelElement.style.overflow = "hidden";
  root.render(<ZoneScenarioPanel context={context} />);
  return () => root.unmount();
}
