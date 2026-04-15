import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.tsx"],
  format: ["esm"],
  outDir: "dist",
  fixedExtension: false,
  minify: true,
  treeshake: true,
  clean: true,
  sourcemap: false,
});
