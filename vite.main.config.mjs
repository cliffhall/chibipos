// /Users/cliffhall/Projects/chibipos/vite.main.config.mjs
import {defineConfig} from 'vite';
import {builtinModules} from 'node:module';

export default defineConfig({
  // Optional: Set the root if your main process source is not in the project root
  // root: 'src', // Or wherever your main.js and other main process files are relative to this config

  // Configure the build for the main process
  build: {
    // Output directory for the main process build (matches your package.json "main" field)
    outDir: '.vite/build',
    // Build as a library because Electron's main process is essentially a Node.js module
    lib: {
      entry: 'src/main.js', // Path to your main process entry point
      formats: ['cjs'],     // Electron main process requires CommonJS
      fileName: () => 'main.js', // Output filename
    },
    rollupOptions: {
      // Tell Rollup (used by Vite) to treat these modules as external
      // They are available in the Node.js/Electron environment and shouldn't be bundled
      external: [
        'electron', // Electron itself
        ...builtinModules, // All Node.js built-in modules (e.g., fs, path, child_process)
        ...builtinModules.map(mod => `node:${mod}`), // Handles "node:" prefixed imports
        // Add any other native dependencies that are used in the main process
        // and should not be bundled (e.g., 'sqlite3', 'escpos', etc. if they are true native modules)
        'sqlite3',
        'serialport',
        'escpos',
        'escpos-network',
        'escpos-usb',
        'wait-on', // This was imported in your main.js snippet
      ],
    },
    // Optional: Disable minification for easier debugging during development
    // For production, you'd typically want this enabled.
    // minify: process.env.NODE_ENV === 'production',
    minify: false, // Or true for production builds
    // Ensure Vite knows we are building for Node.js.
    // The target should ideally match the Node.js version in your Electron version.
    // For Electron 35.x, Node.js is likely v20.x.
    // The Electron Forge Vite plugin often sets this automatically.
    // target: 'node20', // Example, adjust if needed
  },
  // This section is crucial for telling Vite it's building for a server-side (Node.js) environment.
  ssr: {
    // This ensures that Vite processes dependencies correctly for a Node.js environment
    // and correctly externalizes Node.js built-ins.
    target: 'node',
    // You can list packages here that you want to force Vite to bundle,
    // even if they are CJS. For Node built-ins, `rollupOptions.external` is preferred.
    // noExternal: [
    //   // Example: 'some-cjs-dependency-to-bundle'
    // ],
  },
  // Optional: If you have specific resolve aliases or conditions for the main process
  resolve: {
    // conditions: ['node'], // Prioritize Node.js resolution conditions
  },
});
