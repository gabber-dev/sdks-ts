import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  globalName: "Gabber",
  target: 'esnext',
  external: ["eventemitter3", "axios", "livekit-client"], // Keep dependencies external for import maps
  treeshake: true, // Remove unused code
});
