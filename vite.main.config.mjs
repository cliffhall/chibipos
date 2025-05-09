// /Users/cliffhall/Projects/chibipos/vite.main.config.mjs
import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';
import commonjs from '@rollup/plugin-commonjs'; // You may still need this for other CJS dependencies

export default defineConfig({
  // ... other Vite configurations ...
  build: {
    outDir: '.vite/build', // Ensure this matches your setup
    lib: { // Ensure this is correctly configured for your main process entry
      entry: 'src/main/index.js',
      formats: ['es'],
      fileName: (format) => `main.${format === 'es' ? 'js' : format}`,
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map(mod => `node:${mod}`),
        'electron-squirrel-startup',
        'sqlite3',
        'serialport',
        'escpos',
        'escpos-network',
        'escpos-usb',
        'wait-on',
        'sequelize',
        'crypto-js',
      ],
      plugins: [
        commonjs({
          // With sequelize and crypto-js now external, the commonjs plugin's
          // primary role here is for any *other* CJS dependencies you might
          // have that are *not* external and need processing.
          extensions: ['.js', '.cjs'],
          // This can be helpful for other non-external CJS modules
          // that might use dynamic requires.
          ignoreDynamicRequires: true,
          // transformMixedEsModules: true, // Generally good for CJS/ESM mixed modules
          // interop: 'default', // Less critical for 'require' if the module is external
        }),
      ],
    },
    minify: false,
  },
  ssr: {
    target: 'node',
  },
  resolve: {
    // conditions: ['node'],
  },
});
