import type { AppIconic } from "./types";

import { makeIconic as makeService } from "@iconic/iconic";
import { accessIconic } from "./store";

/**
 * Builds the iconic service over the reactive per-request container. State lives
 * in the container the store owns, so reads and writes are tracked and the sprite
 * re-renders when a set is applied or an override is written.
 */
export const makeIconic = (): AppIconic => {
  const { config } = accessIconic();
  return makeService(config.value);
};
