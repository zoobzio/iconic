// iconic/config — the configuration type and the config helpers.
import type { Contract } from "@iconic/schema";
import type { Config } from "@iconic/core";
import { clone } from "@iconic/utils";

/**
 * An application's iconic configuration: the base contract — identity plus every
 * semantic alias mapped to its resolved icon definition literal. The canonical
 * shape the `@iconic/iconify` build layer emits into an `iconic.config.ts`, and
 * the input {@link useIconicConfig} seeds a runtime container from.
 */
export interface IconicConfig<C extends Contract = Contract> {
  /** The base contract: identity plus the icons map. */
  contract: C;
}

/**
 * Identity helper that types an iconic configuration and infers the alias union
 * from `contract`, so a consumer of the generated `iconic.config.ts` gets the
 * exact contract back without restating it. It does nothing at runtime but carry
 * the inferred types.
 *
 * @param config - The iconic configuration.
 * @returns The same config, narrowed to its inferred types.
 */
export const defineIconicConfig = <const C extends Contract>(
  config: IconicConfig<C>,
): IconicConfig<C> => config;

/**
 * Seeds a fresh runtime state container from an authored configuration: a
 * detached clone of the contract as the active state, and an empty user
 * override. Nothing is held by reference, so every call yields an independent
 * container — containers seeded for concurrent sessions (SSR requests, previews)
 * cannot reach each other's state through the shared config.
 *
 * @param config - The iconic configuration.
 * @returns A fresh {@link Config} container, ready for `makeIconic`.
 */
export const useIconicConfig = <C extends Contract>(
  config: IconicConfig<C>,
): Config<C> => {
  return {
    contract: clone(config.contract),
    override: {},
  };
};
