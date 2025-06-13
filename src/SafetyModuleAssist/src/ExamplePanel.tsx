import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";
import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { SafetyFirstToggle } from "./SafetyFirstToggle"; // adjust the path if needed

function NotificationPopup({ message, onCancel }: { message: string; onCancel: () => void }) {
  return (
    <div style={overlayStyle}>
      <div style={popupStyle}>
        <p style={{ marginBottom: "1rem" }}>{message}</p>
        <button style={buttonStyle} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ConfirmationPopup({ onOK, onNotOK }: { onOK: () => void; onNotOK: () => void }) {
  return (
    <div style={overlayStyle}>
      <div style={popupStyle}>
        <p style={{ marginBottom: "1rem" }}>Voulez-vous contourner l'obstacle automatiquement ?</p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <button style={buttonStyle} onClick={onOK}>OUI</button>
          <button style={buttonStyle} onClick={onNotOK}>NON</button>
        </div>
      </div>
    </div>
  );
}


const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

const popupStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  width: "80%",
  maxWidth: "400px",
  textAlign: "center",
  fontSize: "clamp(0.8em, 1.2vw, 1em)",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

function EscapeNotificationPanel({ context }: { context: PanelExtensionContext }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isToggleOn, setIsToggleOn] = useState(false);

  const callTriggerService = async (service: string) => {
    if (!context.callService) return;
    try {
      await context.callService(service, {});
      console.log("Service called:", service);
    } catch (err) {
      console.error("Failed to call service", service, err);
    }
  };

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      const msg = renderState.currentFrame?.find((m) => m.topic === "/assisted_teleop/notification");
      if (msg && (msg.message as any).data === true) {
        setShowConfirm(true);
      }

      const feedbackMsg = renderState.currentFrame?.find((m) => m.topic === "/safety_first_feedback");
      if (feedbackMsg) {
        const text = (feedbackMsg.message as any).data;
        setFeedbackMessage(text);

          if (typeof text === "string" && (text.includes("annulé") || text.includes("réussi"))) {
            setTimeout(() => {
              setShowFeedback(false);
            }, 3000); // wait 3 seconds before hiding
          }
      }

      const toggleMsg = renderState.currentFrame?.find((m) => m.topic === "/cancel_assisted_teleop");

      console.log(toggleMsg);
      if (toggleMsg && typeof (toggleMsg.message as any).data === "boolean") {
        const received= !(toggleMsg.message as any).data;
        setIsToggleOn(received); // INVERT HERE

        console.log("Received cancel_assisted_teleop:", received);
      }


      done();
    };

    context.watch("topics");
    context.watch("currentFrame");
    context.subscribe([
      { topic: "/assisted_teleop/notification" },
      { topic: "/safety_first_feedback" },
      { topic: "/cancel_assisted_teleop" }
    ]);
  }, [context]);


  // ⏲️ Timeout logic for confirmation
  useEffect(() => {
    if (showConfirm) {
      timeoutRef.current = setTimeout(() => {
        setShowConfirm(false);
      }, 30_000); // 30 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [showConfirm]);

const handleToggleSwitch = async (newState: boolean) => {
  const service = newState ? "/activate_teleop_assist" : "/deactivate_teleop_assist";
  await callTriggerService(service);
  setIsToggleOn(newState);
};

  const handleOK = async () => {
    await callTriggerService("/assissted_teleop/escape_barakuda_automatically");
    setShowConfirm(false);
    setShowFeedback(true);
  };

  const handleNotOK = async () => {
    await callTriggerService("/assissted_teleop/escape_barakuda_manually");
    setShowConfirm(false);
  };

  const handleCancel = async () => {
    await callTriggerService("/assissted_teleop/cancel_escape_barakuda_automatically");
    setShowFeedback(false);
  };

return (
  <div style={{ 
    padding: "1rem", 
    fontFamily: "sans-serif", 
    width: "100%",
    height: "100%",
    overflowY: "auto",
    fontSize: "clamp(0.6em, 1.5vw, 1em)",
    display: "flex",
    flexDirection: "column", 
    boxSizing: "border-box",
    position: "relative" // add this!
  }}>
    <SafetyFirstToggle isOn={isToggleOn} onToggle={handleToggleSwitch} />
    {showConfirm && <ConfirmationPopup onOK={handleOK} onNotOK={handleNotOK} />}
    {showFeedback && <NotificationPopup message={feedbackMessage} onCancel={handleCancel} />}
  </div>
);
}

export function initEscapeNotificationPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);

  context.panelElement.style.display = "flex";
  context.panelElement.style.flexDirection = "column";
  context.panelElement.style.height = "100%";
  context.panelElement.style.width = "100%";
  context.panelElement.style.overflow = "hidden";

  root.render(<EscapeNotificationPanel context={context} />);
  return () => root.unmount();
}