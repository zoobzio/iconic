import type { Catalog, Check, Domain, Kind, Rule, Rules } from "./types";

/**
 * Builds the {@link Check} bundle: one boolean type predicate per kind. A kind
 * passes when every rule in its list returns no issue.
 */
export const defineCheck = <C extends Catalog>(rules: Rules): Check<C> => {
  const check =
    <K extends Kind>(list: Rule[]) =>
    (v: unknown): v is Domain<C>[K] =>
      list.every((rule) => rule(v) === undefined);
  return {
    icon: check<"icon">(rules.icon),
    alias: check<"alias">(rules.alias),
    set: check<"set">(rules.set),
    catalog: check<"catalog">(rules.catalog),
  };
};
