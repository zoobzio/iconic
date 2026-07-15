import { keys } from "@iconic/common";
import { defineSchema } from "@iconic/schema";
import type { Alias, Catalog, IconifyIcon, SetMap } from "@iconic/schema";

import type { Config, Iconic, Options } from "./types";
import {
  InvalidCatalogError,
  InvalidSetError,
  UnknownAliasError,
  UnknownSetError,
  reframe,
} from "./error";

/**
 * Builds the runtime {@link Iconic} service over a state container.
 *
 * Every read and write goes through `proxy`, so the caller decides whether
 * state is plain (tests, node) or a reactive proxy (Vue); `options` can
 * intercept and transform each read and write on the way through. The active
 * set is read as `proxy.active` and written by `swap`, so a service inside a
 * reactive scope re-resolves when the state it read changes. Validation is
 * derived from the catalog up front via {@link defineSchema}; a malformed
 * catalog fails fast as an {@link InvalidCatalogError}.
 *
 * The catalog is a flat map of resolved icon literals — the service holds no
 * IconifyJSON collection and does no alias-tree resolution. `resolve` is a pure
 * lookup (set override → base); all Iconify source handling happened at build
 * time in `@iconic/iconify`.
 *
 * @param config - The caller-owned container: the catalog and the active set.
 * @param options - Read/write middleware over `config`.
 */
export const makeIconic = <C extends Catalog>(
  config: Config<C>,
  options: Options<C> = {},
): Iconic<C> => {
  /**
   * The active state, fronted by get/set middleware. Reads pull the raw value
   * from the container and pipe it through the matching `options.get`
   * middleware on the way out; writes pipe the incoming value through
   * `options.set` before storing it. The container stays the source of truth;
   * a missing middleware is a passthrough.
   */
  const proxy: Config<C> = {
    get catalog() {
      const through = options.get?.config?.catalog;
      return through ? through(config.catalog) : config.catalog;
    },
    set catalog(value) {
      const through = options.set?.config?.catalog;
      config.catalog = through ? through(value) : value;
    },
    get active() {
      const through = options.get?.config?.active;
      return through ? through(config.active) : config.active;
    },
    set active(value) {
      const through = options.set?.config?.active;
      config.active = through ? through(value) : value;
    },
  };

  const schema = reframe(InvalidCatalogError, () =>
    defineSchema(proxy.catalog),
  );

  const isSet = (set: string): boolean =>
    set === "base" || set in proxy.catalog.sets;

  if (!isSet(proxy.active)) {
    throw new UnknownSetError(proxy.active);
  }

  const aliases = (): Alias<C>[] => keys(proxy.catalog.base);

  const sets = (): string[] => keys(proxy.catalog.sets);

  const resolve = (
    alias: Alias<C>,
    set: string = proxy.active,
  ): IconifyIcon => {
    if (set !== "base") {
      const override = proxy.catalog.sets[set]?.[alias];
      if (override) {
        return override;
      }
    }
    const base = proxy.catalog.base[alias];
    if (!base) {
      throw new UnknownAliasError(alias);
    }
    return base;
  };

  // The aliases a set overrides — derived by testing which base aliases the
  // set carries, so each stays typed as an Alias<C> (the set's own keys erase
  // to string in the registry type).
  const overrides = (set: string): Alias<C>[] => {
    if (set === "base") {
      return [];
    }
    const entry = proxy.catalog.sets[set];
    if (!entry) {
      return [];
    }
    return aliases().filter((alias) => alias in entry);
  };

  const swap = (set: string): void => {
    if (!isSet(set)) {
      throw new UnknownSetError(set);
    }
    proxy.active = set;
  };

  const register = (name: string, set: SetMap<Alias<C>>): void => {
    reframe(InvalidSetError, () => schema.assert.set(set));
    proxy.catalog.sets[name] = set;
  };

  return {
    config: proxy,
    schema,
    aliases,
    sets,
    swap,
    resolve,
    overrides,
    register,
  };
};
