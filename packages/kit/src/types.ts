import type { AliasMap, Catalog } from "@iconic/schema";
import type { Config } from "@iconic/core";
import type { Extension, extend } from "@iconic/utils";

/**
 * The authoring handle for a preset over a catalog `C`. `configure` strings
 * another pack of aliases onto the base, widening `C`'s alias union; `use`
 * produces a ready {@link Config} for `makeIconic`, so the resulting service
 * knows every alias accumulated across the chain.
 */
export interface Preset<C extends Catalog> {
  /**
   * The accumulated catalog. It is also `Extension`-shaped (`{ base, sets }`),
   * so it doubles as the input to another preset's `configure` — the way two
   * separately-defined presets chain: `a.configure(b.catalog)`.
   */
  readonly catalog: C;

  /**
   * Widens the preset by an extension: its aliases fold into the base (new keys
   * join the contract, existing keys re-point) and its sets merge into the
   * registry. A preset's own `catalog` is a valid extension, so passing one here
   * composes two presets. Returns a preset over the widened catalog, itself
   * configurable — so packs chain, and the accumulated alias union rides along
   * at the type level.
   */
  configure: <const XBase extends AliasMap>(
    extension: Extension<XBase>,
  ) => Preset<ReturnType<typeof extend<C, XBase>>>;

  /**
   * Builds a ready service config for `makeIconic`: a detached copy of the
   * accumulated catalog and the given active set (default `"base"`).
   */
  use: (active?: string) => Config<C>;
}
