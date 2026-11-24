import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Deploy under a subpath (GitHub Pages: GH_PAGES_BASE=LEARNING-OS) or at root
// (local/dev). Read WITHOUT a leading slash so no shell mangles it.
const rawBase = process.env.GH_PAGES_BASE || '';
const base = rawBase ? `/${rawBase.replace(/^\/+|\/+$/g, '')}/` : '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
