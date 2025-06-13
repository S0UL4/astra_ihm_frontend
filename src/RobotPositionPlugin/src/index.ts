/**
 * @Author: Iheb Soula
 * @Date:   2025-05-20 15:05:15
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-05-20 15:07:47
 */
import { ExtensionContext } from "@foxglove/extension";

import { initUTMPanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "RobotPositionPanel", initPanel: initUTMPanel });
}
