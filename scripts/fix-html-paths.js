// /Users/cliffhall/Projects/chibipos/scripts/fix-html-paths.js
import fs from 'node:fs';
import path from 'node:path';

const [filePath] = process.argv.slice(2);

if (!filePath) {
    console.error('Error: No file path provided for HTML modification.');
    process.exit(1);
}
const absoluteFilePath = path.resolve(filePath);
if (!fs.existsSync(absoluteFilePath)) {
    console.error(`Error: File not found at ${absoluteFilePath}`);
    process.exit(1);
}

try {
    let htmlContent = fs.readFileSync(absoluteFilePath, 'utf-8');
    let replacementsMade = 0;

    // 1. Ensure asset paths are relative (./_app/...)
    // This part remains the same
    const attributePathRegex = /(href|src)=(")\/(?!(?:[a-z]+:)?\/\/)((?:_app|favicon\.png|assets|static|images)[^"]*)/gi;
    htmlContent = htmlContent.replace(attributePathRegex, (match, attribute, quote, pathPart) => {
        replacementsMade++;
        return `${attribute}=${quote}./${pathPart}`;
    });

    const dynamicImportPathRegex = /import\((["'])\/(?!(?:[a-z]+:)?\/\/)((?:_app)[^"']*)\1\)/gi;
    htmlContent = htmlContent.replace(dynamicImportPathRegex, (match, quote, pathPart) => {
        replacementsMade++;
        return `import(${quote}./${pathPart}${quote})`;
    });

    // 2. Modify SvelteKit dynamic base path logic
    const sveltekitBaseObjectRegex = /(__sveltekit_\w+\s*=\s*\{[\s\S]*?base\s*:\s*)([^}]+)(\s*[\s\S]*?};)/;
    const svelteKitBaseMatch = htmlContent.match(sveltekitBaseObjectRegex);
    if (svelteKitBaseMatch) {
        const currentBaseValue = svelteKitBaseMatch[2].trim();

        // --- MODIFICATION START ---
        // If SvelteKit's base is already "" (empty string, as configured in svelte.config.js),
        // leave it as is. This allows SvelteKit to operate relative to the document's base URI.
        if (currentBaseValue === `""` || currentBaseValue === `''`) {
            console.log('[fix-html-paths] SvelteKit base is already empty (""). No change made to SvelteKit base path. Relying on document base URI.');
            // No replacement is made for the base path itself, so replacementsMade is not incremented here.
        } else {
            // This case would be hit if svelte.config.js paths.base was something other than ''.
            // The original script's intent was to force a dynamic absolute path.
            // For consistency with aiming for an empty base, you might reconsider this 'else' block's utility
            // if your svelte.config.js always has paths.base = ''.
            // However, keeping the original logic for this specific 'else' for now:
            const prefix = svelteKitBaseMatch[1];
            const suffix = svelteKitBaseMatch[3];
            const dynamicBase = 'location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1)';
            const newSvelteKitObjectString = prefix + dynamicBase + suffix;
            htmlContent = htmlContent.replace(svelteKitBaseMatch[0], newSvelteKitObjectString);
            console.log(`[fix-html-paths] SvelteKit base was '${currentBaseValue}', changed to dynamic base: ${dynamicBase}`);
            replacementsMade++;
        }
        // --- MODIFICATION END ---

    } else {
        console.warn('[fix-html-paths] Could not find __sveltekit_... base object in index.html.');
    }

    // 3. Ensure a Content Security Policy for file:// protocol exists
    // This part remains the same
    const cspMetaTagRegex = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i;
    const cspMatch = htmlContent.match(cspMetaTagRegex);

    const fileProtocolCsp = "default-src 'self' file:; " +
        "script-src 'self' 'unsafe-inline' file:; " +
        "style-src 'self' 'unsafe-inline' file: https://fonts.googleapis.com; " +
        "img-src 'self' data: file:; " +
        "font-src 'self' file: https://fonts.gstatic.com; " +
        "connect-src 'self' file:;";

    if (cspMatch) {
        let existingCspContent = '';
        const contentMatch = cspMatch[0].match(/content="([^"]+)"/i);
        if (contentMatch && contentMatch[1]) {
            existingCspContent = contentMatch[1];
        }
        const modifiedCspTag = `<meta http-equiv="Content-Security-Policy" content="${fileProtocolCsp}">`;
        if (cspMatch[0] !== modifiedCspTag) { // Only count as replacement if actually changed
            htmlContent = htmlContent.replace(cspMatch[0], modifiedCspTag);
            console.log(`[fix-html-paths] Modified existing CSP from "${existingCspContent}" to: ${fileProtocolCsp}`);
            replacementsMade++;
        } else {
            console.log(`[fix-html-paths] Existing CSP matches target CSP. No change made to CSP.`);
        }
    } else {
        console.warn('[fix-html-paths] Content-Security-Policy meta tag not found. Injecting a default CSP for file:// protocol.');
        const newCspTag = `<meta http-equiv="Content-Security-Policy" content="${fileProtocolCsp}">`;
        if (htmlContent.includes("</head>")) {
            htmlContent = htmlContent.replace("</head>", `${newCspTag}\n</head>`);
            replacementsMade++;
        } else if (htmlContent.includes("<head>")) {
            htmlContent = htmlContent.replace("<head>", `<head>\n${newCspTag}`);
            replacementsMade++;
        } else {
            htmlContent = newCspTag + '\n' + htmlContent;
            replacementsMade++;
        }
        console.log(`[fix-html-paths] Injected CSP: ${fileProtocolCsp}`);
    }


    if (replacementsMade > 0) {
        fs.writeFileSync(absoluteFilePath, htmlContent, 'utf-8');
        console.log(`[fix-html-paths] Successfully updated HTML in ${absoluteFilePath} (${replacementsMade} replacements).`);
    } else {
        console.log(`[fix-html-paths] No replacements made by this script in ${absoluteFilePath}.`);
    }

} catch (error) {
    console.error(`Error processing file ${absoluteFilePath}:`, error);
    process.exit(1);
}
