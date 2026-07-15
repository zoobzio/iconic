import type { AliasMap, Catalog, SetMap } from "@iconic/schema";

import type { RefEntry, SchemeResolver } from "./types";

/**
 * Resolves every planned ref into its icon literal and assembles the flat
 * catalog. Each entry's parsed scheme selects its resolver; the resolved icon
 * is placed at the entry's catalog path. Misses (a resolver returning `null`)
 * are collected across the whole config and thrown once, listing every failing
 * `path → ref` — the same all-at-once ethos as the schema's issue list, so a
 * config with several bad refs surfaces them together, not one per run.
 *
 * @param entries - The planned refs across base and sets.
 * @param resolvers - Scheme-keyed resolvers (`iconify`, `url`, and overrides).
 */
export const assemble = async (
  entries: RefEntry[],
  resolvers: Record<string, SchemeResolver>,
): Promise<Catalog> => {
  const base: AliasMap = {};
  const sets: Record<string, SetMap> = {};
  const misses: RefEntry[] = [];

  for (const entry of entries) {
    const resolver = resolvers[entry.parsed.scheme];
    if (!resolver) {
      throw new Error(
        `@iconic/iconify: no resolver for scheme "${entry.parsed.scheme}" (alias "${entry.alias}")`,
      );
    }
    const icon = await resolver(entry.parsed);
    if (!icon) {
      misses.push(entry);
      continue;
    }
    if (entry.path[0] === "base") {
      base[entry.alias] = icon;
    } else {
      const set = entry.path[1];
      (sets[set] ??= {})[entry.alias] = icon;
    }
  }

  if (misses.length > 0) {
    const lines = misses
      .map((miss) => `  ${miss.path.join(".")} → ${miss.raw}`)
      .join("\n");
    throw new Error(
      `@iconic/iconify: ${misses.length} icon(s) could not be resolved —\n${lines}`,
    );
  }

  return { base, sets };
};
