import { stringToIcon } from "@iconify/utils";

import type { ParsedRef, RefConfig, RefEntry } from "./types";

/** The URL scheme sigil: `$/host/path` fetches a single icon from a URL. */
const URL_SIGIL = "$/";

/**
 * Parses one authored ref string into a {@link ParsedRef}. Two schemes:
 * `$/host/path` targets `https://host/path` (a single-icon JSON endpoint), and
 * `prefix:name` parses through Iconify's own `stringToIcon` into a collection
 * reference. An unparseable string throws, naming the alias and the ref, so a
 * typo in the config points at exactly where.
 *
 * @param alias - The alias the ref binds, for error attribution.
 * @param raw - The authored ref string.
 */
export const parseRef = (alias: string, raw: string): ParsedRef => {
  if (raw.startsWith(URL_SIGIL)) {
    const rest = raw.slice(URL_SIGIL.length);
    try {
      return { scheme: "url", url: new URL(`https://${rest}`) };
    } catch {
      throw new Error(
        `@iconic/iconify: alias "${alias}" has an unparseable URL ref "${raw}"`,
      );
    }
  }
  const parsed = stringToIcon(raw);
  if (!parsed || !parsed.prefix || !parsed.name) {
    throw new Error(
      `@iconic/iconify: alias "${alias}" has an unparseable ref "${raw}" — expected "prefix:name" or "$/host/path"`,
    );
  }
  return {
    scheme: "iconify",
    provider: parsed.provider,
    prefix: parsed.prefix,
    name: parsed.name,
  };
};

/**
 * Flattens a {@link RefConfig} into the list of {@link RefEntry} work items,
 * parsing every ref up front so a bad ref fails before any acquisition. Each
 * entry carries its path in the emitted catalog (`["base", alias]` or
 * `["sets", set, alias]`), so resolution can place the resolved icon back.
 */
export const plan = (config: RefConfig): RefEntry[] => {
  const entries: RefEntry[] = [];
  for (const [alias, raw] of Object.entries(config.base)) {
    entries.push({
      path: ["base", alias],
      alias,
      raw,
      parsed: parseRef(alias, raw),
    });
  }
  for (const [set, overrides] of Object.entries(config.sets ?? {})) {
    for (const [alias, raw] of Object.entries(overrides)) {
      entries.push({
        path: ["sets", set, alias],
        alias,
        raw,
        parsed: parseRef(alias, raw),
      });
    }
  }
  return entries;
};
