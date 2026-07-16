import type { AliasMap } from "@iconic/schema";

/**
 * A contract extension for {@link extend}: a pack of icons (`XBase`) to fold
 * into the base contract's `icons`. An extension key that already names a base
 * alias re-points it; a new key joins the contract. Every value is an icon
 * definition literal — iconic has no authored-vs-bound distinction the way
 * untheme's tokens do, so a new alias and an override carry the same shape.
 *
 * `XBase` is inferred from the `icons` keys, so a preset's `configure` widens
 * the alias union to include them. Identity is not part of an extension — the
 * root preset's identity rides through unchanged.
 */
export type Extension<XBase extends AliasMap = AliasMap> = {
  icons: XBase;
};
