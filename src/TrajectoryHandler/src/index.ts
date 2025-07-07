import { ExtensionContext } from "@foxglove/extension";

import { initZoneScenarioPanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "TrajectoryMissionHandler", initPanel: initZoneScenarioPanel });
}
