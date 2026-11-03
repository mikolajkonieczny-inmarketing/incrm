import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// `--mode artifact` bundles everything into one HTML file for sharing the prototype
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === "artifact" ? [viteSingleFile()] : [])],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: mode === "artifact" ? { outDir: "dist-artifact", assetsInlineLimit: 100_000_000 } : undefined,
}))
