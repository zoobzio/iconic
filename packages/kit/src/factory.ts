import type { AliasMap, Catalog } from "@iconic/schema";
import type { Config } from "@iconic/core";
import type { Extension } from "@iconic/utils";
import { clone, extend } from "@iconic/utils";

import type { Preset } from "./types";

/**
 * Builds the authoring handle over a catalog — the base pack at the root, a
 * widened catalog after any `configure`.
 *
 * `configure` widens the catalog by the extension and re-roots, so the next
 * preset accumulates over the union alias set; the type argument is carried by
 * `extend`'s inferred return, so the widened alias union stays precise without
 * a cast. `use` snapshots the catalog into a {@link Config} so service-side
 * mutation (a `register`) never reaches the preset.
 *
 * @param catalog - The catalog the preset ships as its accumulated contract.
 */
export const makePreset = <C extends Catalog>(catalog: C): Preset<C> => {
  const configure = <const XBase extends AliasMap>(
    extension: Extension<XBase>,
  ) => {
    const widened = extend(catalog, extension);
    return makePreset(widened);
  };

  const use = (active: string = "base"): Config<C> => ({
    catalog: clone(catalog),
    active,
  });

  return { catalog, configure, use };
};
