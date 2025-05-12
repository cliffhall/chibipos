// /Users/cliffhall/Projects/chibipos/scripts/copy-files.js
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Go up one level from 'scripts'

const sourcePkgPath = path.join(projectRoot, 'package.json');
const destinationPkgPath = path.join(projectRoot, 'dist', 'electron', 'package.json');

const sourceGsapPath = path.join(projectRoot, 'gsap-bonus.tgz');
const destinationGsapPath = path.join(projectRoot, 'dist', 'electron', 'gsap-bonus.tgz');

async function copyFiles() {
    try {
        // Copy package.json
        console.log(`[Copy Files] Copying ${sourcePkgPath} to ${destinationPkgPath}`);
        await fs.copy(sourcePkgPath, destinationPkgPath);
        console.log('[Copy Files] package.json copied successfully.');

        // Modify the copied package.json
        try {
            const pkg = await fs.readJson(destinationPkgPath);
            delete pkg.devDependencies; // Remove devDependencies

            // Adjust the main entry point for the packaged app
            // The original main is "dist/electron/main/index.js"
            // Inside dist/electron, it will be "main/index.js"
            /*if (pkg.main && pkg.main.startsWith('dist/electron/')) {
                pkg.main = pkg.main.replace('dist/electron/', '');
            }*/
            // Or, more directly if you know the structure:
            pkg.main = 'main/index.js';


            await fs.writeJson(destinationPkgPath, pkg, { spaces: 2 });
            console.log('[Copy Files] devDependencies removed and main path adjusted in copied package.json.');
        } catch (err) {
            console.warn('[Copy Files] Could not process copied package.json (e.g., remove devDependencies or adjust main):', err);
        }

        // Copy gsap-bonus.tgz
        if (await fs.pathExists(sourceGsapPath)) {
            console.log(`[Copy Files] Copying ${sourceGsapPath} to ${destinationGsapPath}`);
            await fs.copy(sourceGsapPath, destinationGsapPath);
            console.log('[Copy Files] gsap-bonus.tgz copied successfully.');
        } else {
            console.warn(`[Copy Files] Source file ${sourceGsapPath} not found. Skipping copy.`);
        }

    } catch (err) {
        console.error('[Copy Files] Error during file copying process:', err);
        process.exit(1);
    }
}

copyFiles();
