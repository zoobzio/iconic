import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImports,
} from "@nuxt/kit";

/**
 * Nuxt module for iconic.
 *
 * At build time it will resolve the configured collections and included icons
 * into an SVG sprite sheet, inject it, and register the runtime plugin plus the
 * `useIcon` auto-import.
 *
 * Scaffold — the build-time sprite generation is not yet wired.
 */
export interface IconicModuleOptions {
  /** Iconify collections to source icons from. */
  collections?: string[];
  /** Explicit icon names to include in the sprite. */
  include?: string[];
}

export default defineNuxtModule<IconicModuleOptions>({
  meta: {
    name: "iconic",
    configKey: "iconic",
  },
  setup: () => {
    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("./runtime/plugin"));
    addImports({
      name: "useIcon",
      from: resolver.resolve("./runtime/composable"),
    });
  },
});
