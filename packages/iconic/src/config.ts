// iconic/config — the configuration type and the defineIconicConfig helper.
import type { AliasMap, SetMap } from "@iconic/schema";

/**
 * An application's iconic configuration: the base alias map — every semantic
 * alias mapped to its resolved icon definition literal — plus the switchable
 * override sets and the set to boot with. Exactly {@link defineIconic}'s input,
 * and the canonical shape the `@iconic/iconify` build layer emits into an
 * `iconic.config.ts`.
 */
export interface IconicConfig<Base extends AliasMap = AliasMap> {
  /** The base contract: each alias mapped to its resolved icon literal. */
  base: Base;

  /**
   * The switchable override sets, keyed by name; each set rebinds only the base
   * aliases it diverges on.
   */
  sets?: Record<string, SetMap<Extract<keyof Base, string>>>;

  /** The set to boot with; defaults to the base. */
  active?: string;
}

/**
 * Identity helper that types an iconic configuration and infers the alias union
 * from `base`, so a consumer of the generated `iconic.config.ts` gets the exact
 * contract back without restating it. Mirrors untheme's `defineUnthemeConfig`:
 * it does nothing at runtime but carry the inferred types.
 *
 * @param config - The iconic configuration.
 * @returns The same config, narrowed to its inferred types.
 */
export const defineIconicConfig = <const Base extends AliasMap>(
  config: IconicConfig<Base>,
): IconicConfig<Base> => config;
