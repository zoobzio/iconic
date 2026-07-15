import { keys } from "@iconic/common";

import type { AliasMap, Catalog, SetMap } from "@iconic/schema";

import type { Extension } from "./types";

/**
 * Widens a base catalog with an {@link Extension} into a fresh catalog over the
 * union alias set. Neither input is mutated; icon definition literals are shared
 * by reference.
 *
 * Aliases compose by spread — an extension key that already names a base alias
 * re-points it, a new key joins the contract. Sets spread the new registry over
 * the base's, deep-merging each set the two share so an extension can override
 * some of a base set's entries without restating the rest.
 *
 * The return type is left to inference: the base spread carries the accumulated
 * alias keys, which a preset's `configure` reads back as the widened contract.
 */
export const extend = <C extends Catalog, const XBase extends AliasMap>(
  base: C,
  extension: Extension<XBase>,
) => {
  const merged = { ...base.base, ...extension.base };

  const sets: Record<string, SetMap> = { ...base.sets };
  if (extension.sets) {
    for (const name of keys(extension.sets)) {
      sets[name] = { ...(sets[name] ?? {}), ...extension.sets[name] };
    }
  }

  return { base: merged, sets };
};
