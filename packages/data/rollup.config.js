import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const external = [...Object.keys(pkg.dependencies || {}), "graphql-request"];

const baseConfig = {
  external: (id) =>
    external.some((dep) => id === dep || id.startsWith(dep + "/")),
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      browser: false,
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
      outDir: "./dist",
    }),
  ],
};

export default defineConfig([
  // Main build
  {
    ...baseConfig,
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
  },
  // Types build
  {
    input: "src/index.ts",
    output: {
      file: pkg.types,
      format: "esm",
    },
    plugins: [
      dts({
        tsconfig: "./tsconfig.json",
      }),
    ],
    external,
  },
]);
