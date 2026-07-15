import type { Alias, Catalog, IconifyIcon } from "@iconic/schema";

/**
 * The subset of the core service a sprite reads: pass the service itself —
 * `defineSprite(icons)` — or any structurally matching container. Reads stay
 * lazy: each render pulls the active set through the config getter, so a
 * reactive container tracks every read and re-runs the scope on change.
 */
export type Source<C extends Catalog> = {
  /* The state container; the active set is read from it. */
  config: { readonly active: string };

  /* Every alias in the base contract. */
  aliases(): Alias<C>[];

  /* Every registered set name. */
  sets(): string[];

  /* The aliases a set overrides. */
  overrides(set: string): Alias<C>[];

  /* An alias resolved to its stored icon literal under a set. */
  resolve(alias: Alias<C>, set?: string): IconifyIcon;
};

/**
 * An SVG sprite service over a catalog. Base symbols are keyed by alias
 * (`id="home"`); a set's overrides are namespaced (`id="sharp/home"`), so
 * swapping the active set at runtime is a matter of recomputing `<use href>`.
 */
export type Sprite<C extends Catalog> = {
  /* The `#id` an alias resolves to under a set (default: the active set). */
  href(alias: Alias<C>, set?: string): string;

  /* The `<symbol>` markup for an alias under a set. */
  symbol(alias: Alias<C>, set?: string): string;

  /* The full sprite: base symbols plus per-set override symbols, namespaced. */
  sheet(): string;

  /* Which aliases each set overrides — the runtime href-resolution map. */
  manifest(): Record<string, Alias<C>[]>;
};
