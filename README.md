# ChibiPOS

## Local Developer Setup
### Node
* Running locally requires <a href="https://nodejs.org/en/download" target="_blank">Node and npm be installed</a>.

### Python Version
* If`node_gyp` fails when compiling binaries for Electron 35, you may need to do this:
```shell
brew install python@3.13
/opt/homebrew/opt/python@3.13/bin/python3.13 -m pip install --upgrade pip setuptools wheel --break-system-packages --user
```

### Install Dependencies

- `cd /path/to/chibipos/`
- `npm install`

## Configuration Files
### Svelte Config
- `svelte.config.js`
  - Used for configuring Svelte itself

### Vite Config for Svelte
- `vite.svelte.config.js`
  - Used for building Svelte app with Vite

### Vite Config for Electron
- `vite.electron.config.js`
  - Used for building Electron app with Electron-Vite

### Electron Builder Config
- `electron-builder.yml`
  - Used for configuring Electron Builder to create native packages

## NPM Scripts
### Dev Server
- `npm run dev`
  - Builds the Svelte app 
  - Builds the Electron app
  - Sets the `VITE_DEV_SERVER_URL` environment var
  - Starts the `electron-vite` dev server, creating the Electron app as a byproduct
  - Both Svelte and Electron apps are needed since Svelte talks to Electron api for data

### Clean Dist Folder
- `npm run clean`
  - Removes the `dist` output folder
  - Removes the `.svelte-kit` folder
  - Called automatically during `build` or `dist`

### Build
- `npm run build`
  - Runs `clean`
  - Builds the Svelte app and the Electron app
  - Combines the two builds with the `scripts/copy-files.js` script

### Build Svelte App
- `npm run build:svelte`
  - Builds the Svelte app 
  - Creates `.svelte-kit` folder as byproduct
  - Outputs to `dist/svelte`

### Build Electron App
- `npm run build:electron`
  - Builds the Electron app 
  - Automatically triggers `postbuild:electron`
  - Outputs to `dist/electron`

### Electron App Post Build
- `npm run postbuild:electron`
  - Fixes the paths in the generated `dist/svelte/index.html`
  - Triggered by completion of `build:electron`
    - Needed because 
      - Dev mode for Svelte can use relative paths because it is a web server using http://
      - Production mode (Electron app) must use absolute paths because it uses file://
  - Replaces the generated `dist/electron/renderer` with contents of `dist/svelte`

### Create Distribution Directory
- `npm run dist:dir`
  - Creates `dist/builder/[platform]/chibipos.app`
  - Good for a quick test of the packaged app for your local platform
  - You can just copy it to your desktop and run it without having to install
  - Outputs to `dist/builder`

### Create Distribution for All Platforms
- `npm run dist:all`
  - Creates `dist/builder/[mac|mac-arm64|linux|linux-arm64|win].[exe|dmg|etc...]`
  - Installers for all configured platforms in `electron-builder.yml`
  - Outputs to `dist/builder`

### Prepare
- `npm run prepare`
  - Runs automatically after `npm install`
  - Runs `svelte-kit sync` which creates `.svelte-kit` folder
  - `.svelte-kit` holds Svelte-kit's type references

### Format Code
- `npm run format`
  - Invokes `prettier` in `write` mode
  - Tidies up your code formatting

### Linter
- `npm run lint`
  - Invokes `prettier` in `check` mode
  - Reports syntax errors and code formatting issues
