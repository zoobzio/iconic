import { isObject } from "@iconic/common";

import type { Catalog, Enum, Issue, Rule, Rules } from "./types";

const issue = (
  code: Issue["code"],
  message: string,
  extra: Partial<Issue> = {},
): Issue => ({ code, message, ...extra });

/** A value is a string. */
const stringRule: Rule = (v) =>
  typeof v === "string"
    ? undefined
    : issue("not_string", "expected a string", { received: v });

// The numeric and boolean properties the Iconify spec defines on an icon
// literal, checked only when present — the spec makes them all optional, with
// collection-root defaults baked in at build time.
const NUMERIC = ["width", "height", "left", "top", "rotate"] as const;
const BOOLEAN = ["hFlip", "vFlip"] as const;

/**
 * A value is a resolved icon definition literal in Iconify format: an object
 * with a required string `body`, and — where present — numeric geometry
 * (`width`/`height`/`left`/`top`/`rotate`) and boolean flips (`hFlip`/`vFlip`).
 * Extra keys pass: the spec carries extended props, and the runtime stores the
 * literal whole. A failure names the offending property so a bad emission from
 * the build layer points at exactly what is malformed.
 */
const iconRule: Rule = (v) => {
  if (!isObject(v)) {
    return issue("not_icon", "expected an icon definition literal", {
      received: v,
    });
  }
  if (typeof v.body !== "string") {
    return issue("not_icon", 'icon "body" must be a string', {
      path: ["body"],
      received: v.body,
    });
  }
  for (const prop of NUMERIC) {
    if (prop in v && typeof v[prop] !== "number") {
      return issue("not_icon", `icon "${prop}" must be a number`, {
        path: [prop],
        received: v[prop],
      });
    }
  }
  for (const prop of BOOLEAN) {
    if (prop in v && typeof v[prop] !== "boolean") {
      return issue("not_icon", `icon "${prop}" must be a boolean`, {
        path: [prop],
        received: v[prop],
      });
    }
  }
  return undefined;
};

/**
 * Builds the {@link Rules} for a catalog. The membership rules close over the
 * catalog's {@link Enum}; every icon-bearing kind defers to {@link iconRule},
 * so a base entry, a set override, and a runtime-registered icon are all held
 * to the exact same shape.
 */
export const defineRules = <C extends Catalog>(enums: Enum<C>): Rules => {
  // The membership helper takes a Set<string>, so the catalog's Set<Alias<C>>
  // is accepted by method bivariance — no cast at the call site.
  const member =
    (set: Set<string>) =>
    (v: unknown): boolean =>
      typeof v === "string" && set.has(v);
  const isAlias = member(enums.aliases);

  const membershipRule: Rule = (v) =>
    isAlias(v)
      ? undefined
      : issue("unknown_alias", `unknown alias "${String(v)}"`, { received: v });

  const setRule: Rule = (v) => {
    if (!isObject(v)) {
      return issue("not_object", "expected a set of overrides", {
        received: v,
      });
    }
    for (const [alias, icon] of Object.entries(v)) {
      if (!isAlias(alias)) {
        return issue(
          "unknown_alias",
          `set overrides unknown alias "${alias}"`,
          {
            path: [alias],
          },
        );
      }
      const bad = iconRule(icon);
      if (bad) {
        return { ...bad, path: [alias, ...(bad.path ?? [])] };
      }
    }
    return undefined;
  };

  const catalogRule: Rule = (v) => {
    if (!isObject(v)) {
      return issue("not_object", "expected a catalog", { received: v });
    }
    if (!isObject(v.base)) {
      return issue("missing_key", "catalog is missing a base map", {
        path: ["base"],
      });
    }
    for (const [alias, icon] of Object.entries(v.base)) {
      const bad = iconRule(icon);
      if (bad) {
        return { ...bad, path: ["base", alias, ...(bad.path ?? [])] };
      }
    }
    if (v.sets !== undefined) {
      if (!isObject(v.sets)) {
        return issue("not_object", "catalog sets must be an object", {
          path: ["sets"],
        });
      }
      for (const [name, set] of Object.entries(v.sets)) {
        const bad = setRule(set);
        if (bad) {
          return { ...bad, path: ["sets", name, ...(bad.path ?? [])] };
        }
      }
    }
    return undefined;
  };

  return {
    icon: [iconRule],
    alias: [stringRule, membershipRule],
    set: [setRule],
    catalog: [catalogRule],
  };
};
