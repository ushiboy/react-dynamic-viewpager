import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: "lib",
      insertTypesEntry: true,
      exclude: ["**/*.test.*", "**/*.spec.*"],
      tsconfigPath: "./tsconfig.app.json",
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
        noEmit: false,
      },
    }),
  ],
  build: {
    outDir: "lib",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        ViewPager: resolve(__dirname, "src/ViewPager.tsx"),
        useViewPager: resolve(__dirname, "src/useViewPager.ts"),
        type: resolve(__dirname, "src/type.ts"),
      },
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: [
        {
          format: "es",
          entryFileNames: "[name].js",
          dir: "lib",
          exports: "named",
        },
        {
          format: "cjs",
          entryFileNames: "[name].cjs",
          dir: "lib",
          exports: "named",
        },
      ],
    },
  },
});
