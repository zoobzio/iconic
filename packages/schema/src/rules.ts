import { isObject } from "@iconic/common";

import type { Contract, Enum, Issue, Rule, Rules } from "./types";

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
 * A value carries a well-formed {@link Identity}: required string `id`/`name`,
 * and — where present — a string `description` and a `tags` array of strings.
 * The metadata every document (contract or set) is held to; a failure names the
 * offending field.
 */
const identityRule: Rule = (v) => {
  if (!isObject(v)) {
    return issue("not_object", "expected an identified document", {
      received: v,
    });
  }
  if (typeof v.id !== "string") {
    return issue("not_string", 'identity "id" must be a string', {
      path: ["id"],
      received: v.id,
    });
  }
  if (typeof v.name !== "string") {
    return issue("not_string", 'identity "name" must be a string', {
      path: ["name"],
      received: v.name,
    });
  }
  if (v.description !== undefined && typeof v.description !== "string") {
    return issue("not_string", 'identity "description" must be a string', {
      path: ["description"],
      received: v.description,
    });
  }
  if (v.tags !== undefined) {
    if (!Array.isArray(v.tags)) {
      return issue("not_array", 'identity "tags" must be an array', {
        path: ["tags"],
        received: v.tags,
      });
    }
    for (let index = 0; index < v.tags.length; index++) {
      if (typeof v.tags[index] !== "string") {
        return issue("not_string", 'identity "tags" entries must be strings', {
          path: ["tags", String(index)],
          received: v.tags[index],
        });
      }
    }
  }
  return undefined;
};

/**
 * Builds the {@link Rules} for a contract. The membership rules close over the
 * contract's {@link Enum}; `overrides` and `set` prove known-alias membership,
 * while `contract` does not — the contract is what *defines* the aliases.
 */
export const defineRules = <C extends Contract>(enums: Enum<C>): Rules => {
  // The membership helper takes a ReadonlySet<string>, so the contract's
  // ReadonlySet<Alias<C>> is accepted by covariance — no cast at the call site.
  const member =
    (set: ReadonlySet<string>) =>
    (v: unknown): boolean =>
      typeof v === "string" && set.has(v);
  const isAlias = member(enums.aliases);

  const membershipRule: Rule = (v) =>
    isAlias(v)
      ? undefined
      : issue("unknown_alias", `unknown alias "${String(v)}"`, { received: v });

  const overridesRule: Rule = (v) => {
    if (!isObject(v)) {
      return issue("not_object", "expected a map of overrides", {
        received: v,
      });
    }
    for (const [alias, icon] of Object.entries(v)) {
      if (!isAlias(alias)) {
        return issue("unknown_alias", `overrides unknown alias "${alias}"`, {
          path: [alias],
        });
      }
      const bad = iconRule(icon);
      if (bad) {
        return { ...bad, path: [alias, ...(bad.path ?? [])] };
      }
    }
    return undefined;
  };

  const setRule: Rule = (v) => {
    const bad = identityRule(v);
    if (bad) {
      return bad;
    }
    if (isObject(v) && v.icons !== undefined) {
      const badIcons = overridesRule(v.icons);
      if (badIcons) {
        return { ...badIcons, path: ["icons", ...(badIcons.path ?? [])] };
      }
    }
    return undefined;
  };

  const contractRule: Rule = (v) => {
    const bad = identityRule(v);
    if (bad) {
      return bad;
    }
    if (!isObject(v)) {
      return issue("not_object", "expected a contract", { received: v });
    }
    if (!isObject(v.icons)) {
      return issue("missing_key", "contract is missing an icons map", {
        path: ["icons"],
      });
    }
    for (const [alias, icon] of Object.entries(v.icons)) {
      const badIcon = iconRule(icon);
      if (badIcon) {
        return { ...badIcon, path: ["icons", alias, ...(badIcon.path ?? [])] };
      }
    }
    return undefined;
  };

  return {
    icon: [iconRule],
    alias: [stringRule, membershipRule],
    overrides: [overridesRule],
    set: [setRule],
    contract: [contractRule],
  };
};
