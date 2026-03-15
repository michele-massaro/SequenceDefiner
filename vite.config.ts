import path from "path"
import { readFileSync } from "fs"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

let version = "0.0.0"
try {
  const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as { version: string }
  version = pkg.version
} catch (err) {
  console.warn("[vite] Could not read version from package.json:", err)
}

// https://vite.dev/config/
export default defineConfig({
  base: "/SequenceDefiner/",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
})
