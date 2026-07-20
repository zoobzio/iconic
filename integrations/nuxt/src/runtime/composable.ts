import type { AppIconic } from "./types";

import { useNuxtApp } from "#app";

/**
 * Composable for the icon service: the active contract, the applied set, and the
 * user override layer. Every read and write flows through the reactive container
 * the plugin built, so a component that resolves an alias re-renders when the set
 * or an override changes.
 */
export const useIconic = (): AppIconic => {
  const { $iconic } = useNuxtApp();
  return $iconic;
};
