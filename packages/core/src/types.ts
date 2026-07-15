import type {
  Alias,
  Catalog,
  IconifyIcon,
  Schema,
  SetMap,
} from "@iconic/schema";

/**
 * The caller-owned live state an {@link Iconic} service reads and writes: the
 * catalog (base contract plus the set registry) and the active set. Pass a
 * plain object for inert state, or a reactive proxy to have reads and writes
 * tracked — the hook a framework integration binds runtime swapping to.
 *
 * `catalog` is carried whole, the way untheme carries `theme`, so the contract
 * type is a single value the schema is derived from rather than a shape
 * reconstructed from separate fields.
 */
export type Config<C extends Catalog> = {
  catalog: C;
  active: string;
};

/**
 * Read/write middleware over the state container. Each slot intercepts the
 * matching `config` field and transforms the value as it passes through — the
 * integration's hook for instrumenting state without the service knowing about
 * it. Omit a slot to pass the value through untouched.
 */
export type Options<C extends Catalog> = {
  get?: {
    config?: {
      catalog?: (catalog: C) => C;
      active?: (active: string) => string;
    };
  };
  set?: {
    config?: {
      catalog?: (catalog: C) => C;
      active?: (active: string) => string;
    };
  };
};

/**
 * A runtime icon service over a catalog. `resolve` looks an alias up through
 * the active set (its override if any, else the base) and returns the stored
 * icon literal; `swap` writes the active set through `config`; `register` files
 * a new set at runtime, validated against the contract — the door through which
 * a server-generated set enters. The active set is read and written through
 * `config`, never as a property of its own.
 */
export interface Iconic<C extends Catalog> {
  /**
   * The caller-owned live state, fronted by get/set middleware — the single
   * place state is read or written raw. `config.active` is the active set.
   */
  config: Config<C>;

  /** The validation bundle for the contract. */
  schema: Schema<C>;

  /** Every alias in the base contract. */
  aliases(): Alias<C>[];

  /** Every registered set name (the base is implicit, not listed). */
  sets(): string[];

  /** Selects the active set — the cheap runtime swap. Throws on an unknown set. */
  swap(set: string): void;

  /**
   * Resolve an alias to its stored icon literal under a set (default: the
   * active set): the set's override if it rebinds the alias, else the base.
   * A pure lookup — no collection, no alias tree. Throws {@link UnknownAliasError}
   * when the alias is not in the base contract.
   */
  resolve(alias: Alias<C>, set?: string): IconifyIcon;

  /** The aliases a set rebinds (empty for the base). */
  overrides(set: string): Alias<C>[];

  /**
   * Files a set in the registry, validated against the contract first — a set
   * naming an unknown alias, or carrying a malformed icon, is rejected. The
   * runtime-ingest path for a server-generated set.
   */
  register(name: string, set: SetMap<Alias<C>>): void;
}
