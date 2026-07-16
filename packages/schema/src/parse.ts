import type { Assert, Contract, Parse } from "./types";

/**
 * Builds the {@link Parse} bundle: each kind asserts the value and returns it
 * narrowed to the kind type, or lets the {@link SchemaError} from
 * {@link Assert} propagate.
 */
export const defineParse = <C extends Contract>(
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
  overrides: (v) => {
    assert.overrides(v);
    return v;
  },
  set: (v) => {
    assert.set(v);
    return v;
  },
  contract: (v) => {
    assert.contract(v);
    return v;
  },
});
