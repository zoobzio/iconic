import type { Assert, Catalog, Parse } from "./types";

/**
 * Builds the {@link Parse} bundle: each kind asserts the value and returns it
 * narrowed to the kind type, or lets the {@link SchemaError} from
 * {@link Assert} propagate.
 */
export const defineParse = <C extends Catalog>(
  assert: Assert<C>,
): Parse<C> => ({
  icon: (v) => {
    assert.icon(v);
    return v;
  },
  alias: (v) => {
    assert.alias(v);
    return v;
  },
  set: (v) => {
    assert.set(v);
    return v;
  },
  catalog: (v) => {
    assert.catalog(v);
    return v;
  },
});
