import type { AliasMap, Contract } from "@iconic/schema";
import type { Config } from "@iconic/core";
import type { Extension, extend } from "@iconic/utils";

/**
 * The authoring handle for a preset over a contract `C`. `configure` strings
 * another pack of icons onto the contract, widening `C`'s alias union while
 * keeping the root preset's identity; `use` produces a ready {@link Config} for
 * `makeIconic`, so the resulting service knows every alias accumulated across
 * the chain.
 */
export interface Preset<C extends Contract> {
  /**
   * The accumulated contract. Its `icons` also make it `Extension`-compatible,
   * so it doubles as the input to another preset's `configure` — the way two
   * separately-defined presets chain: `a.configure(b.contract)`.
   */
  readonly contract: C;

  /**
   * Widens the preset by an extension: its icons fold into the contract (new
   * keys join, existing keys re-point), the root identity unchanged. Returns a
   * preset over the widened contract, itself configurable — so packs chain, and
   * the accumulated alias union rides along at the type level.
   */
  configure: <const XBase extends AliasMap>(
    extension: Extension<XBase>,
  ) => Preset<ReturnType<typeof extend<C, XBase>>>;

  /**
   * Builds a ready service config for `makeIconic`: a detached clone of the
   * accumulated contract and an empty user override.
   */
  use: () => Config<C>;
}
