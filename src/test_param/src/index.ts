/**
 * @Author: Your name
 * @Date:   2025-05-21 14:18:20
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-05-21 14:28:31
 */
import { ExtensionContext } from "@foxglove/extension";

import { initExamplePanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "TEST PARAM", initPanel: initExamplePanel });
}
