import type { Alias } from "#build/types/iconic.d.ts";
import type {
  Config,
  Identity,
  IconifyIcon,
  Iconic,
  Overrides,
  Set,
} from "@iconic/iconic";

/**
 * The active contract, its alias keys derived from the build-time union. Keyed
 * by the union rather than the wide `AliasMap` so `keyof` stays the union.
 */
export type AppContract = Identity & { icons: Record<Alias, IconifyIcon> };

/**
 * A switchable layer over the contract — what `apply` swaps in at runtime.
 */
export type AppSet = Set<Alias>;

/**
 * A partial override map over the contract's aliases.
 */
export type AppOverrides = Overrides<Alias>;

/**
 * The caller-owned state container the service operates on.
 */
export type AppConfig = Config<AppContract>;

/**
 * The runtime icon service bound to the app's contract.
 */
export type AppIconic = Iconic<AppContract>;

/**
 * The runtime hooks the service emits, keyed by event name. Shared with the
 * `#app` augmentation so the two never drift.
 */
export interface IconicHooks {
  "iconic:ready": (service: AppIconic) => void;
}

declare module "#app" {
  interface NuxtApp {
    $iconic: AppIconic;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RuntimeNuxtHooks extends IconicHooks {}
}
