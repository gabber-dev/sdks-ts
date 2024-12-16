const typescript = require("@rollup/plugin-typescript");
const node_resolve = require("@rollup/plugin-node-resolve");
const common_resolve = require("@rollup/plugin-commonjs");
const postcss = require("rollup-plugin-postcss");
const json = require("@rollup/plugin-json");
const { default: replace } = require("@rollup/plugin-replace");

module.exports = {
  input: ["src/index.tsx"],
  output: { dir: "dist", format: "iife", name: "Gabber" },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }),
    json(),
    node_resolve({ browser: true, preferBuiltins: false }),
    common_resolve(),
    replace({ "use client": "" }),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    postcss({
      config: { path: "./postcss.config.js" },
      extensions: [".css"],
      inject: {
        insertAt: "top",
      },
    }),
    // terser(),
  ],
};
