import { keys } from "@iconic/common";

import type { Catalog, Enum } from "./types";

/**
 * Reads the {@link Enum} off a catalog: the alias names from the base map. The
 * membership rules consult these. The set registry is not read — it is not
 * type-bearing and goes stale after a runtime `register`, so the live catalog
 * stays its own source of truth.
 */
export const defineEnum = <C extends Catalog>(base: C): Enum<C> => ({
  aliases: new Set(keys(base.base)),
});
