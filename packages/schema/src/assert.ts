import type {
  Alias,
  Assert,
  Catalog,
  IconifyIcon,
  Issue,
  Rule,
  Rules,
  SetMap,
} from "./types";

import { SchemaError } from "./error";

/**
 * Builds the {@link Assert} bundle: each kind runs every rule, collects all the
 * {@link Issue}s, and throws a {@link SchemaError} if any were found — reporting
 * every failure in one pass rather than stopping at the first.
 */
export const defineAssert = <C extends Catalog>(rules: Rules): Assert<C> => {
  const run = (v: unknown, list: Rule[]) => {
    const issues = list.reduce<Issue[]>((acc, rule) => {
      const found = rule(v);
      if (found) {
        acc.push(found);
      }
      return acc;
    }, []);
    if (issues.length > 0) {
      throw new SchemaError(issues);
    }
  };
  return {
    icon: (v): asserts v is IconifyIcon => run(v, rules.icon),
    alias: (v): asserts v is Alias<C> => run(v, rules.alias),
    set: (v): asserts v is SetMap<Alias<C>> => run(v, rules.set),
    catalog: (v): asserts v is C => run(v, rules.catalog),
  };
};
