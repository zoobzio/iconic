import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/module",
    // The runtime is shipped unbundled: Nuxt resolves these files by path and
    // compiles them in the app, where the #app/#imports/#build virtuals exist.
    { input: "src/runtime/", outDir: ".dist/runtime", builder: "mkdist" },
  ],
  outDir: ".dist",
  declaration: true,
  externals: ["#app", "#imports", "@nuxt/kit", "@nuxt/schema", "nuxt", "vue"],
  rollup: {
    emitCJS: false,
  },
});
