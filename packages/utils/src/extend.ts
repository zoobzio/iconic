import type { AliasMap, Contract } from "@iconic/schema";

import type { Extension } from "./types";

/**
 * Widens a base contract with an {@link Extension} into a fresh contract over
 * the union icon set, preserving the base's identity. Neither input is mutated;
 * icon definition literals are shared by reference (a later `clone` detaches
 * them).
 *
 * Icons compose by spread — an extension key that already names a base alias
 * re-points it, a new key joins the contract. The return type is left to
 * inference: the icons spread carries the accumulated alias keys, which a
 * preset's `configure` reads back as the widened contract.
 */
export const extend = <C extends Contract, const XBase extends AliasMap>(
  base: C,
  extension: Extension<XBase>,
) => {
  return {
    ...base,
    icons: { ...base.icons, ...extension.icons },
  };
};
