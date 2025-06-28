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
  "@semaphore-protocol/proof",
  "@semaphore-protocol/identity",
  "@semaphore-protocol/group",
  "graphql-request",
  "permissionless",
  "@workspace/data",
];

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
  // Main bundle - CJS and ESM
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
  // TypeScript declarations
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