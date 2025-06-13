import { ExtensionContext } from "@foxglove/extension";

import { initOdomVelocityPanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "Vitesse Barakuda", initPanel: initOdomVelocityPanel });
}
