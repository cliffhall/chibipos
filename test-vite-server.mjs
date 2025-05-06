// /Users/cliffhall/Projects/chibipos/test-vite-server.mjs
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename_script = fileURLToPath(import.meta.url);
const __dirname_script = path.dirname(__filename_script);
const frontendProjectRoot = path.resolve(__dirname_script, 'frontend');
const originalCwd = process.cwd();

(async () => {
    try {
        console.log(`Original CWD: ${originalCwd}`);
        console.log(`Frontend project root: ${frontendProjectRoot}`);
        console.log('--- DIAGNOSTIC: Temporarily changing CWD to frontend project root ---');

        process.chdir(frontendProjectRoot); // Temporarily change CWD
        console.log(`CWD is now: ${process.cwd()}`);

        const server = await createServer({
            // With CWD changed to frontendProjectRoot, Vite should automatically
            // use this as its root and load frontend/vite.config.js.
            // No explicit 'root' option needed here if CWD is correct.
            server: {
                host: true,
                port: 5177,
                strictPort: true,
            },
            logLevel: 'debug', // Keep debug for max verbosity
            clearScreen: false,
            mode: 'development',
        });

        // Restore CWD as soon as possible after Vite server is configured
        process.chdir(originalCwd);
        console.log(`CWD restored to: ${process.cwd()}`);

        if (!server) {
            console.error('Failed to create Vite server instance.');
            process.exit(1);
        }

        await server.listen();
        server.printUrls();
        console.log('Vite dev server started manually. Check the URLs above. Press Ctrl+C to stop.');

    } catch (e) {
        console.error('Failed to start Vite server manually:', e);
        // Ensure CWD is restored in case of error
        if (process.cwd() !== originalCwd) {
            process.chdir(originalCwd);
            console.log(`CWD restored to: ${process.cwd()} after error.`);
        }
        process.exit(1);
    }
})();
