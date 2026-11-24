import { defineConfig } from 'vite'

export default defineConfig({
  base: '/meth_3js/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        numogram: 'numogram.html',
      },
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      },
      external: ['three']
    }
  }
})