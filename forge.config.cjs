const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path')
const fs = require('fs-extra')

module.exports = {
  packagerConfig: {
    asar: {
      unpack: "node_modules/sqlite3/**"
    },
    extraResource: [
      './database.sqlite'
    ],
    files: [
      ".vite/build/**/*",
      ".vite/preload.js",
      ".vite/renderer/**/*",
      "package.json",
      "index.html"
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main/index.js',
            config: 'vite.main.config.mjs', // Correctly points to your main process Vite config
            target: 'main', // Likely an internal identifier for the plugin
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs', // Points to a Vite config for your preload script
            target: 'preload', // Likely an internal identifier for the plugin
          },
        ],
        renderer: [
          {
            name: 'main_window', // Name of your renderer process
            config: 'vite.renderer.config.mjs', // Points to a Vite config for your Svelte frontend
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
