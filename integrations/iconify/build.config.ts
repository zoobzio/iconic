import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  outDir: ".dist",
  declaration: true,
  externals: ["@iconify/utils", "@iconify/types", "@iconic/schema"],
  rollup: {
    emitCJS: false,
  },
});
