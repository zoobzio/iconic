import type { Contract } from "@iconic/schema";

import type { Preset } from "./types";
import { makePreset } from "./factory";

/**
 * Creates the authoring handle for a preset from a contract — an identified pack
 * of aliases mapping to icons (a flag pack, a UI pack). `C` is inferred with
 * `const` from the contract literal, so `configure` accumulates the icon union
 * across the chain and the service `use` feeds `makeIconic` knows every alias.
 *
 * @param contract - The identified base pack: identity plus the icons map.
 * @returns The preset's `configure` / `use` authoring handle.
 */
export const defineIconicPreset = <const C extends Contract>(
  contract: C,
): Preset<C> => makePreset(contract);
