import { describe, it, expect, vi } from "vitest";

const service = { marker: "iconic" };
const nuxtApp = { $iconic: service };

vi.mock("#app", () => ({
  useNuxtApp: () => nuxtApp,
}));

import { useIconic } from "../../src/runtime/composable";

describe("useIconic", () => {
  it("returns the $iconic service from the nuxt app", () => {
    expect(useIconic()).toBe(service);
  });
});
