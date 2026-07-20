import type { AppConfig } from "./types";

import { useIconicConfig } from "iconic/config";
import { useState } from "#imports";
import { contract } from "#build/iconic.mjs";

/**
 * The per-request state the plugin and composable share. The build module's
 * contract is a process-wide singleton, so every seed is a detached clone —
 * never a reference SSR writes could reach across requests.
 */
export const accessIconic = () => {
  const config = useState<AppConfig>("iconic:config", () =>
    useIconicConfig({ contract }),
  );

  return { config };
};
