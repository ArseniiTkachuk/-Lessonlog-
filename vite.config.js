import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',            // відносні шляхи, щоб працювало з підпапки репозиторію
  build: {
    outDir: 'docs',      // збирати одразу в docs
  },
})