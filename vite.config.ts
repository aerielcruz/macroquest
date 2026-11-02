import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/** The built app lives at /macroquest/ (e.g. gainskage.com/macroquest/). Dev stays at /. */
const BASE = '/macroquest/'

/** Writes dist/index.html, which sends anyone opening the site root on to the app. */
function rootRedirect(): Plugin {
  return {
    name: 'root-redirect',
    apply: 'build',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      mkdirSync(dist, { recursive: true })
      writeFileSync(
        resolve(dist, 'index.html'),
        `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>MacroQuest</title>
    <meta http-equiv="refresh" content="0; url=${BASE}" />
    <script>location.replace('${BASE}' + location.search + location.hash)</script>
  </head>
  <body><a href="${BASE}">Open MacroQuest</a></body>
</html>
`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  build: { outDir: 'dist/macroquest', emptyOutDir: true },
  plugins: [react(), tailwindcss(), rootRedirect()],
  server: {
    // The Express API (server/index.ts) runs on 3001 during development.
    proxy: { '/api': 'http://localhost:3001' },
  },
}))
