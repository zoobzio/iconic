import { isEqual } from "@iconic/common";

import type { Catalog } from "@iconic/schema";

/**
 * Structural copy of a catalog: the base map and the sets registry are each
 * rebuilt as fresh records, so filing a set into the copy (a service's
 * `register`) never reaches the source. The icon definition literals themselves
 * are shared by reference: they are immutable inputs, not state to detach.
 * Copying a reactive container this way yields an inert, plain snapshot.
 *
 * The rebuilt catalog is proven equal to the source before it is returned,
 * which also narrows it back to the source type without a cast.
 */
export const clone = <C extends Catalog>(catalog: C): C => {
  const result = {
    base: { ...catalog.base },
    sets: { ...catalog.sets },
  };

  if (!isEqual(catalog, result)) {
    throw new TypeError("unable to clone a catalog");
  }

  return result;
};
