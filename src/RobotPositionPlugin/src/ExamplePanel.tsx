import { PanelExtensionContext } from "@foxglove/extension";
import { useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import * as utm from "utm";

function UTMPositionPanel({ context }: { context: PanelExtensionContext }) {
  const [utmX, setUtmX] = useState<number | null>(null);
  const [utmY, setUtmY] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [zoneNumRobot, setzoneNumRobot] = useState<number | null>(null);
  const [zoneLetterRobot, setzoneLetter] = useState<string | null>(null);

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      const gpsMsg = renderState.currentFrame?.find((msg) => msg.topic === "/loc/gps_filtered");

      if (gpsMsg) {
        const message = gpsMsg.message as any;
        const lat = message.latitude;
        const lon = message.longitude;
        const alt = message.altitude;
        //console.log(lat);
        
        try {
          const { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(lat, lon);
          if ((zoneNum > 0 && zoneLetter != null)) {
            setUtmX(parseFloat(easting.toFixed(3)));
            setUtmY(parseFloat(northing.toFixed(3)));
            setAltitude(parseFloat(alt.toFixed(2)));
            setzoneNumRobot(zoneNum);
            setzoneLetter(zoneLetter);
          } else {
            setUtmX(null);
            setUtmY(null);
            setAltitude(null);
          }
        } catch (err) {
          //console.warn("UTM conversion failed:", err);
        }
      }

      done();
    };

    context.watch("topics");
    context.watch("currentFrame");
    context.subscribe([{ topic: "/loc/gps_filtered" }]);
  }, [context]);
  

  return (
    <div style={{ padding: "1rem", textAlign: "center", color: "#ffffff", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#000000",fontWeight: "bold", marginBottom: "1rem" }}>📍 Position Absolue Robot - {zoneNumRobot}{zoneLetterRobot}</h2>
      <div style={boxStyle}>
        <label style={labelStyle}>Easting (X):</label>
        <div style={valueStyle}>{utmX !== null ? `${utmX} m` : "—"}</div>
      </div>
      <div style={boxStyle}>
        <label style={labelStyle}>Northing (Y):</label>
        <div style={valueStyle}>{utmY !== null ? `${utmY} m` : "—"}</div>
      </div>
      <div style={boxStyle}>
        <label style={labelStyle}>Altitude (Z):</label>
        <div style={valueStyle}>{altitude !== null ? `${altitude} m` : "—"}</div>
      </div>
    </div>
  );
}

const boxStyle: React.CSSProperties = {
  backgroundColor: "#2e2e2e",
  borderRadius: "8px",
  padding: "0.75rem 1rem",
  marginBottom: "0.75rem",
  boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
  display: "flex",
  justifyContent: "space-between",
};

const labelStyle: React.CSSProperties = {
  fontWeight: "600",
};

const valueStyle: React.CSSProperties = {
  fontWeight: "bold",
};

export function initUTMPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<UTMPositionPanel context={context} />);
  return () => root.unmount();
}
