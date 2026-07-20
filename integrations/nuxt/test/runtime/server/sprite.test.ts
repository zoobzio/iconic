import { describe, it, expect, vi } from "vitest";
import { contract } from "../../fixtures";

vi.mock("#build/iconic.mjs", () => ({ contract }));

vi.mock("#imports", () => ({
  defineNitroPlugin: (plugin: unknown) => plugin,
}));

import plugin from "../../../src/runtime/server/sprite";

/** Runs the plugin and returns the HTML the `render:html` hook prepended. */
const render = (): string => {
  let handler: ((html: { bodyPrepend: string[] }) => void) | undefined;
  const nitroApp = {
    hooks: {
      hook: (_name: string, fn: typeof handler) => {
        handler = fn;
      },
    },
  };
  (plugin as unknown as (app: typeof nitroApp) => void)(nitroApp);
  if (!handler) throw new Error("plugin did not register render:html");
  const html = { bodyPrepend: [] as string[] };
  handler(html);
  return html.bodyPrepend.join("");
};

describe("sprite server plugin", () => {
  it("inlines the base sprite into the sprite container", () => {
    const markup = render();
    expect(markup).toContain('id="iconic-sprite"');
    expect(markup).toContain('<symbol id="home"');
    expect(markup).toContain('<symbol id="save"');
  });
});
