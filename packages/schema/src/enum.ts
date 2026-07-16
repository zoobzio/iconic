import { keys } from "@iconic/common";

import type { Contract, Enum } from "./types";

/**
 * Reads the {@link Enum} off a contract: the alias names from its `icons` map.
 * The membership rules consult these to prove that a set or overrides map
 * rebinds only aliases the contract declares.
 */
export const defineEnum = <C extends Contract>(base: C): Enum<C> => ({
  aliases: new Set(keys(base.icons)),
});
