import { PanelExtensionContext } from "@foxglove/extension";
import { ReactElement, useState , useRef, useLayoutEffect, useEffect } from "react";
import { createRoot } from "react-dom/client";


const SENSOR_TOPICS = [
  "/sensor/lidar_av/state",
  "/sensor/lidar_ar/state",
  "/sensor/lidar_left/state",
  "/sensor/lidar_right/state",
  "/sensor/lidar_middle/state",
  "/sensor/camera_front/state",
  "/sensor/cam_ar_2/state",
  "/sensor/imu/state",
  "/sensor/gnss/state",
  "/sensor/rtk/state",
  "/sensor/nav/state",
  "/sensor/motor/state",
];

function topicToSensorName(topic: string | undefined): string {
  if (typeof topic !== "string") {
    //console.warn("Invalid topic:", topic);
    return "unknown";
  }

  const parts = topic.split("/");
  if (parts.length >= 3 && parts[2]) {
    return parts[2];
  }

  //console.warn("Unexpected topic format:", topic);
  return topic; // fallback to original string if format is weird
}

async function callSensorService(
  context: PanelExtensionContext,
  sensorName: string,
  state: boolean
) {
  try {
    
    if (!context.callService) {
      //console.error("callService is not available in this context.");
      return;
    }

    await context.callService("/sensor/set_sensor_state", {
      sensor_name: sensorName,
      state: state,
    });
    //console.log(`Service called for ${sensorName} => ${state}`);
  } catch (err) {
    //console.error("Service call failed:", err);
  }
}


function SensorToggle({ context }: { context: PanelExtensionContext }) : ReactElement  {
  const [sensorStates, setSensorStates] = useState<Record<string, boolean>>({});
  const lastKnownState = useRef<Record<string, boolean>>({});
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  

  // === Subscribing and Handling Updates ===
  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setSensorStates((prevStates) => {
        const updatedStates = { ...prevStates };

        for (const msg of renderState.currentFrame ?? []) {
          if (SENSOR_TOPICS.includes(msg.topic)) {
            const boolValue = (msg.message as any).data as boolean;

            updatedStates[msg.topic] = boolValue;
            lastKnownState.current[msg.topic] = boolValue;
          }
        }

        return updatedStates;
      });

      setRenderDone(() => done);
    };

    // context.watch("topics");
    context.watch("currentFrame");
    context.subscribe(SENSOR_TOPICS.map((topic) => ({ topic })));
  }, [context,sensorStates]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  useEffect(() => {
    // Cache the last known states on component unmount
    return () => {
      // Logic to retain the last value (this is optional, depends on your needs)
      setSensorStates(lastKnownState.current);
    };
  }, []);

  const handleToggle = async (topic: string) => {
    const current = sensorStates[topic];
    const newState = !current;

    setSensorStates((prev) => ({ ...prev, [topic]: newState }));
    lastKnownState.current[topic] = newState;

    const sensorName = topicToSensorName(topic);

    await callSensorService(context, sensorName, newState);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "1rem", padding: "1rem" }}>
      {SENSOR_TOPICS.map((topic) => {
        const state = sensorStates[topic];
        const sensorName = topicToSensorName(topic);
        return (
          <div key={topic} style={{ textAlign: "center" }}>
            <div><strong>{sensorName.toUpperCase()}</strong></div>
            <div
              onClick={() => handleToggle(topic)}
              style={{
                width: "50px",
                height: "25px",
                borderRadius: "999px",
                backgroundColor: state === undefined ? "orange" : state ? "limegreen" : "red",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: state ? "26px" : "2px",
                  width: "21px",
                  height: "21px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  transition: "left 0.2s",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// function SensorToggle({
//   label,
//   sensorName,
//   initialState,
//   context,
// }: {
//   label: string;
//   sensorName: string;
//   initialState?: boolean;
//   context: PanelExtensionContext;
// }): ReactElement {
//   const [state, setState] = useState<boolean>(initialState ?? false);

//   const toggle = async () => {
//     const newState = !state;
//     setState(newState);
//     await callSensorService(context, sensorName, newState);
//   };

//   const color = state ? "limegreen" : "red";

//   return (
//     <div style={{ textAlign: "center", margin: "0.5rem" }}>
//       <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>{label}</div>
//       <div
//         onClick={toggle}
//         style={{
//           width: "3rem",
//           height: "1.5rem",
//           borderRadius: "1rem",
//           backgroundColor: color,
//           display: "flex",
//           justifyContent: state ? "flex-end" : "flex-start",
//           alignItems: "center",
//           padding: "0.2rem",
//           cursor: "pointer",
//         }}
//       >
//         <div
//           style={{
//             backgroundColor: "white",
//             width: "1.2rem",
//             height: "1.2rem",
//             borderRadius: "50%",
//           }}
//         />
//       </div>
//     </div>
//   );
// }


// function SensorControlPanel({ context }: { context: PanelExtensionContext }): ReactElement {
//   return (
//     <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", padding: "1rem" }}>
//       {SENSOR_TOPICS.map((topic) => {
//         const label = topicToSensorName(topic).replace(/_/g, " ").toUpperCase();
//         const sensorName = topicToSensorName(topic);

//         return (
//           <SensorToggle
//             key={sensorName}
//             label={label}
//             sensorName={sensorName}
//             context={context}
//           />
//         );
//       })}
//     </div>
//   );
// }


// function ExamplePanel({ context }: { context: PanelExtensionContext }): ReactElement {
//   const [topics, setTopics] = useState<undefined | Immutable<Topic[]>>();
//   const [messages, setMessages] = useState<undefined | Immutable<MessageEvent[]>>();

//   const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

//   // We use a layout effect to setup render handling for our panel. We also setup some topic subscriptions.
//   useLayoutEffect(() => {
//     // The render handler is run by the broader studio system during playback when your panel
//     // needs to render because the fields it is watching have changed. How you handle rendering depends on your framework.
//     // You can only setup one render handler - usually early on in setting up your panel.
//     //
//     // Without a render handler your panel will never receive updates.
//     //
//     // The render handler could be invoked as often as 60hz during playback if fields are changing often.
//     context.onRender = (renderState, done) => {
//       // render functions receive a _done_ callback. You MUST call this callback to indicate your panel has finished rendering.
//       // Your panel will not receive another render callback until _done_ is called from a prior render. If your panel is not done
//       // rendering before the next render call, studio shows a notification to the user that your panel is delayed.
//       //
//       // Set the done callback into a state variable to trigger a re-render.
//       setRenderDone(() => done);

//       // We may have new topics - since we are also watching for messages in the current frame, topics may not have changed
//       // It is up to you to determine the correct action when state has not changed.
//       setTopics(renderState.topics);

//       // currentFrame has messages on subscribed topics since the last render call
//       setMessages(renderState.currentFrame);
//     };

//     // After adding a render handler, you must indicate which fields from RenderState will trigger updates.
//     // If you do not watch any fields then your panel will never render since the panel context will assume you do not want any updates.

//     // tell the panel context that we care about any update to the _topic_ field of RenderState
//     context.watch("topics");

//     // tell the panel context we want messages for the current frame for topics we've subscribed to
//     // This corresponds to the _currentFrame_ field of render state.
//     context.watch("currentFrame");

//     // subscribe to some topics, you could do this within other effects, based on input fields, etc
//     // Once you subscribe to topics, currentFrame will contain message events from those topics (assuming there are messages).
//     context.subscribe([{ topic: "/some/topic" }]);
//   }, [context]);

//   // invoke the done callback once the render is complete
//   useEffect(() => {
//     renderDone?.();
//   }, [renderDone]);

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>Welcome to your new extension panel!</h2>
//       <p>
//         Check the{" "}
//         <a href="https://foxglove.dev/docs/studio/extensions/getting-started">documentation</a> for
//         more details on building extension panels for Foxglove Studio.
//       </p>
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "0.2rem" }}>
//         <b style={{ borderBottom: "1px solid" }}>Topic</b>
//         <b style={{ borderBottom: "1px solid" }}>Schema name</b>
//         {(topics ?? []).map((topic) => (
//           <>
//             <div key={topic.name}>{topic.name}</div>
//             <div key={topic.schemaName}>{topic.schemaName}</div>
//           </>
//         ))}
//       </div>
//       <div>{messages?.length}</div>
//     </div>
//   );
// }

export function initExamplePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<SensorToggle context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
