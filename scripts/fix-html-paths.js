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
    // const originalHtmlContent = htmlContent; // Keep for debugging if needed, but not strictly necessary for this fix
    let replacementsMade = 0;

    // 1. Ensure asset paths are relative (./_app/...)
    const attributePathRegex = /(href|src)=(")\/(?!(?:[a-z]+:)?\/\/)((?:_app|favicon\.png|assets|static|images)[^"]*)/gi;
    htmlContent = htmlContent.replace(attributePathRegex, (match, attribute, quote, pathPart) => {
        // console.log(`[fix-html-paths] Fixing attribute path: ${match} to ./${pathPart}`); // Log from your output
        replacementsMade++;
        return `${attribute}=${quote}./${pathPart}`;
    });

    const dynamicImportPathRegex = /import\((["'])\/(?!(?:[a-z]+:)?\/\/)((?:_app)[^"']*)\1\)/gi;
    htmlContent = htmlContent.replace(dynamicImportPathRegex, (match, quote, pathPart) => {
        // console.log(`[fix-html-paths] Fixing dynamic import path: ${match} to ./${pathPart}`); // Log from your output
        replacementsMade++;
        return `import(${quote}./${pathPart}${quote})`;
    });

    // 2. Check if SvelteKit (with embedded:true) already set a dynamic base.
    //    If it looks like `base: new URL(...)` or similar, SvelteKit handled it.
    //    If it's `base: ""`, we need to fix it.
    //    Regex to find the SvelteKit base object: captures prefix, current base value, and suffix.
    const sveltekitBaseObjectRegex = /(__sveltekit_\w+\s*=\s*\{[\s\S]*?base\s*:\s*)([^}]+)(\s*[\s\S]*?};)/;
    // Example match breakdown:
    // svelteKitBaseMatch[0] = full matched string e.g., __sveltekit_abc = { base: "" };
    // svelteKitBaseMatch[1] = prefix part e.g., __sveltekit_abc = { base:
    // svelteKitBaseMatch[2] = current base value e.g., ""
    // svelteKitBaseMatch[3] = suffix part e.g.,  }; (includes surrounding whitespace/newlines)

    const svelteKitBaseMatch = htmlContent.match(sveltekitBaseObjectRegex);

    if (svelteKitBaseMatch) {
        const prefix = svelteKitBaseMatch[1];
        const currentBaseValue = svelteKitBaseMatch[2].trim(); // Trim to accurately check for "" or ''
        const suffix = svelteKitBaseMatch[3];

        // Check if SvelteKit left it as an empty string
        if (currentBaseValue === `""` || currentBaseValue === `''`) {
            // SvelteKit set base to "", so we inject our dynamic base
            // This gets the directory of the current HTML file, including a trailing slash.
            const dynamicBase = 'location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1)';

            // Construct the new full string for the SvelteKit object
            const newSvelteKitObjectString = prefix + dynamicBase + suffix;

            // Replace the original matched SvelteKit object string with the new one
            htmlContent = htmlContent.replace(svelteKitBaseMatch[0], newSvelteKitObjectString);

            console.log('[fix-html-paths] SvelteKit base was empty, injecting dynamic base: ' + dynamicBase);
            replacementsMade++;
        } else {
            console.log(`[fix-html-paths] SvelteKit seems to have already set a dynamic base: ${currentBaseValue}. No changes made to base path by this script.`);
        }
    } else {
        // This warning is from your script, keeping it.
        console.warn('[fix-html-paths] Could not find __sveltekit_... base object in index.html. Base path might be incorrect.');
    }

    if (replacementsMade > 0) {
        fs.writeFileSync(absoluteFilePath, htmlContent, 'utf-8');
        console.log(`[fix-html-paths] Successfully updated HTML in ${absoluteFilePath}.`);
    } else {
        console.log(`[fix-html-paths] No replacements made by this script in ${absoluteFilePath}.`);
    }

} catch (error) {
    console.error(`Error processing file ${absoluteFilePath}:`, error);
    process.exit(1);
}
