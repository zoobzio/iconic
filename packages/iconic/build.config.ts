import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/common", "src/config", "src/svg", "src/kit"],
  outDir: ".dist",
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
