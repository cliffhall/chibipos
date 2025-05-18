# ChibiPOS

## Local Developer Setup
* Running locally requires <a href="https://nodejs.org/en/download" target="_blank">Node and npm be installed</a>. 
* To fix the issue of `node_gyp` failing when compiling binaries for Electron 35, you may need to do this:
```shell
/opt/homebrew/opt/python@3.13/bin/python3.13 -m pip install --upgrade pip setuptools wheel --break-system-packages --user
```

### Install Dependencies

- `cd /path/to/chibipos/`
- `npm install`

## Development Mode
- `npm run dev`
  - Builds the Svelte app 
  - Sets the `VITE_DEV_SERVER_URL` environment var
  - Starts the electron-vite dev server

### Build
- `npm run build`
  - Builds the Svelte app and the electron app
  - Combines the two builds with the `scripts/copy-files.js` script

### Build Svelte
- `npm run build:svelte`
  - Builds the Svelte app 

### Build Electron
- `npm run build:electron`
  - Builds the Electron app 
  - Automatically triggers `postbuild:electron`

### Electron Post Build
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

### Create Distribution for All Platforms
- `npm run dist:all`
  - Creates `dist/builder/[mac|mac-arm64|linux|linux-arm64|win].[exe|dmg|etc...]`
  - Installers for all configured platforms in `electron-builder.yml`

### Prepare
- `npm run prepare`
  - Runs automatically after `npm install`
  - Syncs Svelte types

### Format Code
- `npm run format`
  - Invokes `prettier` in `write` mode
  - Tidies up your code formatting

### Linter
- `npm run lint`
  - Invokes `prettier` in `check` mode
  - Reports syntax errors and code formatting issues
