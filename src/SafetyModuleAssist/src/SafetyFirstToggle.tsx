type SafetyFirstToggleProps = {
  isOn: boolean;
  onToggle: (newState: boolean) => void;
};

export function SafetyFirstToggle({ isOn, onToggle }: SafetyFirstToggleProps) {
  return (
    <div
      onClick={() => onToggle(!isOn)}
      style={{
        width: "240px",
        height: "80px",
        borderRadius: "40px",
        background: isOn
          ? "linear-gradient(to right, #32CD32, #00cc00)" // lush green
          : "linear-gradient(to right, #cc0000, #ff3333)", // rich red
        border: "3px solid #222",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.3s ease",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "900",
        fontSize: "1.4rem",
        color: "#ffffff",
        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
        userSelect: "none",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      }}
    >
      SAFETY FIRST
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          position: "absolute",
          top: "8px",
          left: isOn ? "calc(100% - 72px)" : "8px",
          transition: "left 0.3s ease",
          boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}
