import { defineConfig } from 'vite'

export default defineConfig({
  base: '/my-vite-site/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
})
