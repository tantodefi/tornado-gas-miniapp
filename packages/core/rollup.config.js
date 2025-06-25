import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  "viem",
  "viem/account-abstraction",
  "viem/chains",
  "@semaphore-protocol/core",
  "graphql-request",
  "permissionless",
];

const baseConfig = {
  external: (id) =>
    external.some((dep) => id === dep || id.startsWith(dep + "/")),
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      browser: false,
    }),
    commonjs(), // ✅ remove `.default()`
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
      outDir: "./dist",
    }),
  ],
};

export default defineConfig([
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
  {
    ...baseConfig,
    input: "src/client/index.ts",
    output: [
      {
        file: "dist/client/index.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: "dist/client/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
  },
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
  {
    input: "src/client/index.ts",
    output: {
      file: "dist/client/index.d.ts",
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
