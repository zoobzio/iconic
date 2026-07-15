import type { AliasMap, SetMap } from "@iconic/schema";

/**
 * A catalog extension for {@link extend}: new aliases (`XBase`) to fold into
 * the base contract, plus optional override sets. An extension key that already
 * names a base alias re-points it; a new key joins the contract. Every value is
 * an icon definition literal — iconic has no authored-vs-bound distinction the
 * way untheme's tokens do, so a new alias and an override carry the same shape.
 *
 * `XBase` is inferred from the `base` keys, so a preset's `configure` widens the
 * alias union to include them.
 */
export type Extension<XBase extends AliasMap = AliasMap> = {
  base: XBase;
  sets?: Record<string, SetMap>;
};
