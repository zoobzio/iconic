import type { AliasMap, SetMap } from "@iconic/schema";

import type { Preset } from "./types";
import { makePreset } from "./factory";

/**
 * Creates the authoring handle for a preset from a base pack — a set of aliases
 * mapping to icons (a flag pack, a UI pack), plus optional seed sets. `Base` is
 * inferred from the alias keys, so `configure` accumulates their union across
 * the chain and the service `use` feeds `makeIconic` knows every one of them.
 *
 * @param config - The base alias pack and optional seed sets.
 * @returns The preset's `configure` / `use` authoring handle.
 */
export const defineIconicPreset = <const Base extends AliasMap>({
  base,
  sets = {},
}: {
  base: Base;
  sets?: Record<string, SetMap<Extract<keyof Base, string>>>;
}): Preset<{
  base: Base;
  sets: Record<string, SetMap<Extract<keyof Base, string>>>;
}> => makePreset({ base, sets });
