/**
 * @Author: Iheb Soula
 * @Date:   2025-05-20 14:07:24
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-05-20 14:22:06
 */
import { ExtensionContext } from "@foxglove/extension";

import { initExamplePanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "BatteryViewer", initPanel: initExamplePanel });
}
