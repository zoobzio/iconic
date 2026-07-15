import type { Issue } from "@iconic/schema";

import { SchemaError } from "@iconic/schema";

/**
 * Raised when the catalog handed to {@link defineIconic} violates its own
 * contract. Extends {@link SchemaError}, so it carries the underlying
 * {@link Issue}s while naming which boundary rejected the value.
 */
export class InvalidCatalogError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidCatalogError";
  }
}

/**
 * Raised when a set — a seed set, or an argument to `register` — steps outside
 * the contract. Carries the {@link Issue}s of the failed {@link SchemaError}.
 */
export class InvalidSetError extends SchemaError {
  constructor(issues: Issue[]) {
    super(issues);
    this.name = "InvalidSetError";
  }
}

/**
 * Raised when `swap` is handed a name that no set is registered under. A lookup
 * miss, not a contract violation, so it extends the plain {@link Error} while
 * carrying the offending `set`.
 */
export class UnknownSetError extends Error {
  readonly set: string;

  constructor(set: string) {
    super(`iconic: no set registered under "${set}"`);
    this.name = "UnknownSetError";
    this.set = set;
  }
}

/**
 * Raised when an alias is resolved that the base contract does not declare.
 */
export class UnknownAliasError extends Error {
  readonly alias: string;

  constructor(alias: string) {
    super(`iconic: unknown alias "${alias}"`);
    this.name = "UnknownAliasError";
    this.alias = alias;
  }
}

/**
 * Runs `fn`, and if it throws a {@link SchemaError}, re-throws it as the given
 * semantic subclass carrying the same {@link Issue}s; anything else propagates
 * untouched. Lets the service speak in {@link InvalidCatalogError} /
 * {@link InvalidSetError} while the schema layer stays generic.
 */
export const reframe = <T>(
  Semantic: new (issues: Issue[]) => SchemaError,
  fn: () => T,
): T => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof SchemaError) {
      throw new Semantic(error.issues);
    }
    throw error;
  }
};
