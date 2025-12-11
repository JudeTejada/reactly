import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "ReactlyWidget",
      formats: ["es", "umd"],
      fileName: (format) => `widget.${format}.js`,
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
