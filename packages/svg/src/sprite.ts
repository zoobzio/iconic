import { iconToSVG } from "@iconify/utils";

import type { Alias, Catalog } from "@iconic/schema";

import type { Source, Sprite } from "./types";

/**
 * Builds an SVG sprite from an iconic service (or any structural {@link Source}).
 *
 * Base symbols are keyed by their alias; a set's overrides are namespaced under
 * the set name, and only the aliases a set actually rebinds are emitted — a set
 * rebinding 10 of 120 aliases adds 10 symbols, not 120. `href` resolves an
 * alias to the namespaced symbol when the set overrides it, else the base
 * symbol, so swapping the active set recomputes `<use href>` with no refetch.
 *
 * @param source - The service the sprite reads aliases, sets, and resolved
 *   icon data from.
 */
export const defineSprite = <C extends Catalog>(
  source: Source<C>,
): Sprite<C> => {
  const symbolId = (alias: Alias<C>, set: string): string =>
    set !== "base" && source.overrides(set).includes(alias)
      ? `${set}/${alias}`
      : alias;

  const symbol = (alias: Alias<C>, set: string = "base"): string => {
    const { attributes, body } = iconToSVG(source.resolve(alias, set));
    return `<symbol id="${symbolId(alias, set)}" viewBox="${attributes.viewBox}">${body}</symbol>`;
  };

  const href = (alias: Alias<C>, set: string = source.config.active): string =>
    `#${symbolId(alias, set)}`;

  const sheet = (): string => {
    const symbols: string[] = [];
    for (const alias of source.aliases()) {
      symbols.push(symbol(alias, "base"));
    }
    for (const set of source.sets()) {
      for (const alias of source.overrides(set)) {
        symbols.push(symbol(alias, set));
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join("")}</svg>`;
  };

  const manifest = (): Record<string, Alias<C>[]> => {
    const map: Record<string, Alias<C>[]> = {};
    for (const set of source.sets()) {
      map[set] = source.overrides(set);
    }
    return map;
  };

  return { href, symbol, sheet, manifest };
};
