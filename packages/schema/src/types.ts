import type { IconifyIcon } from "@iconify/types";

// The Iconify spec's single-icon type is re-exported as-is: iconic's catalog is
// a flat map of resolved icon definition literals in Iconify format, so this is
// the one spec type the runtime contract is built from. The IconifyJSON
// collection format — the *source* documents — belongs to the build layer
// (`@iconic/iconify`), never the runtime, so it is not re-exported here.
export type { IconifyIcon };

/**
 * The base alias map — iconic's contract. Keys are the semantic aliases, values
 * are resolved icon definition literals (`{ body, width, ... }`). No collection
 * or reference is carried: the catalog holds the icon data itself.
 */
export type AliasMap = Record<string, IconifyIcon>;

/**
 * A set: a partial override of the base alias map. A set may only rebind
 * aliases that already exist in the base (a known-alias partial override), and
 * each override is itself a resolved icon literal.
 */
export type SetMap<Alias extends string = string> = Partial<
  Record<Alias, IconifyIcon>
>;

/**
 * The contract a schema validates against: the base alias map plus a registry
 * of override sets. Sets are a `string`-keyed registry, not a fixed union —
 * they can be registered at runtime (server-generated sets), so only the base
 * aliases are type-bearing. The active selection is runtime state on the core
 * service, not part of the static contract.
 */
export type Catalog = { base: AliasMap; sets: Record<string, SetMap> };

/** Any alias name declared by a catalog's base — the one type-bearing union. */
export type Alias<C extends Catalog> = keyof C["base"] & string;

/**
 * The closed set of failure kinds a validation rule can emit. A stable
 * discriminant callers branch on, rather than a free-text string.
 */
export type Code =
  "not_string" | "not_object" | "not_icon" | "unknown_alias" | "missing_key";

/**
 * A validation failure. `code` is the stable discriminant, `message` is
 * human-readable, `path` is filled in as composite rules descend, and
 * `received` carries the offending value.
 */
export type Issue = {
  code: Code;
  message: string;
  path?: string[];
  received?: unknown;
};

/**
 * A validation rule: returns an {@link Issue} describing what is wrong, or
 * `undefined` when the value satisfies the rule.
 */
export type Rule = (v: unknown) => Issue | undefined;

/**
 * The validation vocabulary for a catalog: each kind mapped to the type a
 * value of that kind narrows to. `icon` is a resolved icon definition literal,
 * `alias` a known alias name, `set` a partial override, `catalog` the whole
 * contract.
 */
export type Domain<C extends Catalog> = {
  icon: IconifyIcon;
  alias: Alias<C>;
  set: SetMap<Alias<C>>;
  catalog: C;
};

/** The name of a kind — a key of {@link Domain}. */
export type Kind = keyof Domain<Catalog>;

/** A list of {@link Rule}s per kind; a value passes a kind when all return no issue. */
export type Rules = { [K in Kind]: Rule[] };

/**
 * The sets a schema reads off a catalog: its declared alias names. The
 * membership checks draw on these. The set *registry* is intentionally not
 * captured — it goes stale after a runtime `register`, and the live catalog is
 * the only source of truth for which sets exist.
 */
export type Enum<C extends Catalog> = {
  aliases: Set<Alias<C>>;
};

/** The outcome of an {@link Inspect}: the narrowed value, or the issues. */
export type Result<V> =
  { success: true; data: V } | { success: false; issues: Issue[] };

/** Boolean type predicates per kind. */
export type Check<C extends Catalog> = {
  [K in Kind]: (v: unknown) => v is Domain<C>[K];
};

/**
 * Assertion functions per kind: return when the value satisfies the kind, or
 * throw a {@link SchemaError}. Spelled out per kind since `asserts` predicates
 * cannot be produced by a mapped type.
 */
export type Assert<C extends Catalog> = {
  icon: (v: unknown) => asserts v is IconifyIcon;
  alias: (v: unknown) => asserts v is Alias<C>;
  set: (v: unknown) => asserts v is SetMap<Alias<C>>;
  catalog: (v: unknown) => asserts v is C;
};

/** Parse functions per kind: assert and return the value narrowed. */
export type Parse<C extends Catalog> = {
  [K in Kind]: (v: unknown) => Domain<C>[K];
};

/** Inspect functions per kind: return a {@link Result} rather than throwing. */
export type Inspect<C extends Catalog> = {
  [K in Kind]: (v: unknown) => Result<Domain<C>[K]>;
};

/**
 * The bundle {@link defineSchema} returns for a catalog: the source catalog,
 * the sets read off it, and the check / assert / parse / inspect families
 * built from the rules.
 */
export type Schema<C extends Catalog> = {
  base: C;
  enums: Enum<C>;
  check: Check<C>;
  assert: Assert<C>;
  parse: Parse<C>;
  inspect: Inspect<C>;
};
