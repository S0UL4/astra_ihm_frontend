import { PanelExtensionContext } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const SENSOR_TOPICS = [
  { topic: "/sensor/lidar_av/state", label: "LIDAR AV" },
  { topic: "/sensor/lidar_ar/state", label: "LIDAR AR" },
  { topic: "/sensor/lidar_left/state", label: "LIDAR G" },
  { topic: "/sensor/lidar_right/state", label: "LIDAR D" },
  { topic: "/sensor/lidar_middle/state", label: "LIDAR C" },
  { topic: "/sensor/camera_front/state", label: "CAM AV" },
  { topic: "/sensor/cam_ar_2/state", label: "CAM AR" },
  { topic: "/sensor/imu/state", label: "IMU" },
  { topic: "/sensor/gps/state", label: "GNSS" },
  { topic: "/sensor/rtk/state", label: "RTK" },
  { topic: "/sensor/nav/state", label: "NAV" },
  { topic: "/sensor/motor/state", label: "MOTOR" },
];


function SensorBlock({ label, state }: { label: string; state: boolean | undefined }): ReactElement {
  const backgroundColor =
    state === undefined ? "orange" : state ? "limegreen" : "red";

  return (
    <div
      style={{
        backgroundColor,
        padding: "0.5rem 1rem",
        margin: "0.25rem",
        borderRadius: "0.5rem",
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
        minWidth: "6rem",
      }}
    >
      {label}
    </div>
  );
}


function ExamplePanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [sensorStates, setSensorStates] = useState<Record<string, boolean | undefined>>({});
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);

      const newStates = { ...sensorStates };
      for (const event of renderState.currentFrame ?? []) {
        const topic = event.topic;
        const value = (event.message as { data?: boolean })?.data;
        if (typeof value === "boolean") {
          newStates[topic] = value;
        }
      }

      setSensorStates(newStates);
    };

    context.watch("currentFrame");
    context.subscribe(SENSOR_TOPICS.map(({ topic }) => ({ topic })));
  }, [context, sensorStates]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", padding: "1rem" }}>
      {SENSOR_TOPICS.map(({ topic, label }) => (
        <SensorBlock key={topic} label={label} state={sensorStates[topic]} />
      ))}
    </div>
  );
}

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
  root.render(<ExamplePanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
