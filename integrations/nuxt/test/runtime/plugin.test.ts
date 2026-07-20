import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, type Ref } from "vue";
import { contract } from "../fixtures";

vi.mock("#build/iconic.mjs", () => ({
  get contract() {
    return structuredClone(contract);
  },
}));

vi.mock("#app", () => ({
  defineNuxtPlugin: (def: unknown) => def,
}));

let states: Record<string, Ref<unknown>>;

vi.mock("#imports", () => ({
  useState: (key: string, init: () => unknown) => (states[key] ??= ref(init())),
}));

import plugin from "../../src/runtime/plugin";

const callHook = vi.fn();

const setup = async () => {
  const result = await plugin.setup({ callHook } as never);
  if (
    !result ||
    typeof result !== "object" ||
    !("provide" in result) ||
    !result.provide
  ) {
    throw new Error("plugin did not provide a service");
  }
  return result.provide;
};

describe("iconic plugin", () => {
  beforeEach(() => {
    states = {};
    callHook.mockClear();
  });

  it("is named iconic", () => {
    expect(plugin.name).toBe("iconic");
  });

  it("provides the iconic service", async () => {
    const provide = await setup();
    expect(provide.iconic).toBeDefined();
  });

  it("emits iconic:ready with the service", async () => {
    const provide = await setup();
    expect(callHook).toHaveBeenCalledWith("iconic:ready", provide.iconic);
  });
});
