import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: '.vite', // Forge expects .vite folder
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      formats: ['cjs'], // main process must be CommonJS
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        dir: '.vite/build', // Output everything into the `.vite` folder
      },
      external: [
        'serialport',
        'sqlite3',
        'sequelize'
      ]
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'src/dist'),
          dest: 'build'
        }
      ]
    })
  ]
});
