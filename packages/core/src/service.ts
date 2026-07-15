import type { AliasMap, SetMap } from "@iconic/schema";

import type { Iconic } from "./types";
import { makeIconic } from "./factory";

/**
 * Creates a runtime {@link Iconic} service from a base alias contract and
 * optional override sets — the front door for defining an icon set inline.
 * `Base` is inferred from the alias keys, so `resolve` autocompletes the
 * contract's aliases and a typo fails to compile. Sets are a `string`-keyed
 * registry rather than a fixed union, since new ones can be registered at
 * runtime.
 *
 * @param config - The base contract, seed sets, and (optional) active set.
 * @returns An {@link Iconic} service over the assembled catalog.
 * @throws InvalidCatalogError when the base or a seed set violates the contract.
 */
export const defineIconic = <const Base extends AliasMap>({
  base,
  sets = {},
  active = "base",
}: {
  base: Base;
  sets?: Record<string, SetMap<Extract<keyof Base, string>>>;
  active?: string;
}): Iconic<{
  base: Base;
  sets: Record<string, SetMap<Extract<keyof Base, string>>>;
}> => makeIconic({ catalog: { base, sets }, active });
