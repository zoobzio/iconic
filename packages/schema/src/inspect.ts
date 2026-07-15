import type { Catalog, Domain, Inspect, Kind, Parse, Result } from "./types";

import { SchemaError } from "./error";

/**
 * Builds the {@link Inspect} bundle: each kind captures the parse outcome as a
 * {@link Result} — success with the narrowed value, or failure with the issues
 * — rather than throwing.
 */
export const defineInspect = <C extends Catalog>(
  parse: Parse<C>,
): Inspect<C> => {
  const inspect =
    <K extends Kind>(fn: (v: unknown) => Domain<C>[K]) =>
    (v: unknown): Result<Domain<C>[K]> => {
      try {
        return { success: true, data: fn(v) };
      } catch (error) {
        if (error instanceof SchemaError) {
          return { success: false, issues: error.issues };
        }
        throw error;
      }
    };
  return {
    icon: inspect<"icon">(parse.icon),
    alias: inspect<"alias">(parse.alias),
    set: inspect<"set">(parse.set),
    catalog: inspect<"catalog">(parse.catalog),
  };
};
