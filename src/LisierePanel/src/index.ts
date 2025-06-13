/**
 * @Author: Your name
 * @Date:   2025-05-21 14:42:28
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-05-21 14:56:28
 */
import { ExtensionContext } from "@foxglove/extension";

import { initEdgeDetectionPanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "LisierePanel", initPanel: initEdgeDetectionPanel });
}
