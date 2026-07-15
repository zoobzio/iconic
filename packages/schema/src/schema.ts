import type { Assert, Catalog, Schema } from "./types";

import { defineAssert } from "./assert";
import { defineCheck } from "./check";
import { defineEnum } from "./enum";
import { defineInspect } from "./inspect";
import { defineParse } from "./parse";
import { defineRules } from "./rules";

/**
 * Builds the runtime validation {@link Schema} for a catalog.
 *
 * `enums` reads the alias names off the catalog; `rules` derives the per-kind
 * checks (each icon-bearing kind holding values to the Iconify icon-literal
 * shape); `check` runs them as boolean predicates, `assert` throws a
 * {@link SchemaError} carrying every issue, `parse` asserts and narrows, and
 * `inspect` captures the outcome as a {@link Result}.
 *
 * The catalog is validated against the `catalog` kind before the schema is
 * returned, so a malformed contract fails fast at construction.
 *
 * @param base - The catalog whose base and sets define the contract.
 */
export const defineSchema = <const C extends Catalog>(base: C): Schema<C> => {
  const enums = defineEnum(base);
  const rules = defineRules<C>(enums);
  const check = defineCheck<C>(rules);
  const assert: Assert<C> = defineAssert<C>(rules);
  const parse = defineParse<C>(assert);
  const inspect = defineInspect<C>(parse);

  assert.catalog(base);

  return { base, enums, check, assert, parse, inspect };
};
