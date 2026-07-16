import type { Assert, Contract, Schema } from "./types";

import { defineAssert } from "./assert";
import { defineCheck } from "./check";
import { defineEnum } from "./enum";
import { defineInspect } from "./inspect";
import { defineParse } from "./parse";
import { defineRules } from "./rules";

/**
 * Builds the runtime validation {@link Schema} for a contract.
 *
 * `enums` reads the alias names off the contract; `rules` derives the per-kind
 * checks (each icon-bearing kind holding values to the Iconify icon-literal
 * shape); `check` runs them as boolean predicates, `assert` throws a
 * {@link SchemaError} carrying every issue, `parse` asserts and narrows, and
 * `inspect` captures the outcome as a {@link Result}.
 *
 * The contract is validated against the `contract` kind before the schema is
 * returned, so a malformed contract fails fast at construction. The passed
 * value is kept as `base` — the construction-time baseline the runtime's `apply`
 * and `delta` resolve against.
 *
 * @param base - The contract whose identity and icons define the contract.
 */
export const defineSchema = <const C extends Contract>(base: C): Schema<C> => {
  const enums = defineEnum(base);
  const rules = defineRules<C>(enums);
  const check = defineCheck<C>(rules);
  const assert: Assert<C> = defineAssert<C>(rules);
  const parse = defineParse<C>(assert);
  const inspect = defineInspect<C>(parse);

  assert.contract(base);

  return { base, enums, check, assert, parse, inspect };
};
