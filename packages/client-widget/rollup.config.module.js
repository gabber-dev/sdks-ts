const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const postcss = require("rollup-plugin-postcss");
const { default: replace } = require("@rollup/plugin-replace");

module.exports = {
  input: ["src/index.tsx"],
  output: { file: "dist/index.mjs", format: "es", name: "Gabber" },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }),
    terser(),
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
  ],
};
