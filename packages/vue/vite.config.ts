import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GGTermVue',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@ggterm/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@ggterm/core': 'GGTermCore',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@ggterm/core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
})
