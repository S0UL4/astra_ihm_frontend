/**
 * @Author: Iheb Soula
 * @Date:   2025-06-06 18:21:45
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-06-06 18:40:57
 */
import { ExtensionContext } from "@foxglove/extension";

import { initEscapeNotificationPanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "SafetyFirstAssist", initPanel: initEscapeNotificationPanel });
}
