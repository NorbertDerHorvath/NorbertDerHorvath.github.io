import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages almappa
  base: "/apps/cashhub-app/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
