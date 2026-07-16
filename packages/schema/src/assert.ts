import type {
  Alias,
  Assert,
  Contract,
  IconifyIcon,
  Issue,
  Overrides,
  Rule,
  Rules,
  Set,
} from "./types";

import { SchemaError } from "./error";

/**
 * Builds the {@link Assert} bundle: each kind runs every rule, collects all the
 * {@link Issue}s, and throws a {@link SchemaError} if any were found — reporting
 * every failure in one pass rather than stopping at the first.
 */
export const defineAssert = <C extends Contract>(rules: Rules): Assert<C> => {
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
    overrides: (v): asserts v is Overrides<Alias<C>> => run(v, rules.overrides),
    set: (v): asserts v is Set<Alias<C>> => run(v, rules.set),
    contract: (v): asserts v is C => run(v, rules.contract),
  };
};
