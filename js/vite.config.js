import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'MyLibrary',
      fileName: (format) => `my-library.${format}.js`
    },
    rollupOptions: {
      // If you have any external dependencies, list them here
      external: [],
      output: {
        // Global variable name for UMD build
        globals: {}
      }
    }
  }
})
