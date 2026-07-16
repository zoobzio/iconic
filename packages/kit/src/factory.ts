import type { AliasMap, Contract } from "@iconic/schema";
import type { Config } from "@iconic/core";
import type { Extension } from "@iconic/utils";
import { clone, extend } from "@iconic/utils";

import type { Preset } from "./types";

/**
 * Builds the authoring handle over a contract — the base pack at the root, a
 * widened contract after any `configure`.
 *
 * `configure` widens the contract by the extension and re-roots, so the next
 * preset accumulates over the union alias set; the type argument is carried by
 * `extend`'s inferred return, so the widened alias union stays precise without a
 * cast. `use` clones the contract into a fresh {@link Config} so service-side
 * mutation (an `apply` / `update`) never reaches the preset.
 *
 * @param contract - The contract the preset ships as its accumulated content.
 */
export const makePreset = <C extends Contract>(contract: C): Preset<C> => {
  const configure = <const XBase extends AliasMap>(
    extension: Extension<XBase>,
  ) => {
    const widened = extend(contract, extension);
    return makePreset(widened);
  };

  const use = (): Config<C> => ({ contract: clone(contract), override: {} });

  return { contract, configure, use };
};
