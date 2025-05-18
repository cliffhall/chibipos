# ChibiPOS

## Local Developer Setup
* Running locally requires <a href="https://nodejs.org/en/download" target="_blank">Node and npm be installed</a>. Then follow these steps...
* To fix the issue of node_gyp failing when compiling binaries for Electron 35, you may need to do this:
```shell
/opt/homebrew/opt/python@3.13/bin/python3.13 -m pip install --upgrade pip setuptools wheel --break-system-packages --user
```

### Install Dependencies

- `cd /path/to/chibipos/`
- `npm install`

### Build

- `npm run build`
  - Builds the Svelte app and the electron app
  - Combines the two builds with the `scripts/copy-files.js` script
  

