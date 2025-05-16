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
    let originalHtmlContent = htmlContent; // Store original for comparison
    let replacementsMade = 0;

    // Regex for href and src attributes
    const attributePathRegex = /(href|src)=(")\/(?!(?:[a-z]+:)?\/\/)((?:_app|favicon\.png|assets|static|images)[^"]*)/gi;
    htmlContent = htmlContent.replace(attributePathRegex, (match, attribute, quote, pathPart) => {
        replacementsMade++;
        return `${attribute}=${quote}./${pathPart}`;
    });

    // Regex for dynamic import() statements in inline scripts
    const dynamicImportPathRegex = /import\((["'])\/(?!(?:[a-z]+:)?\/\/)((?:_app)[^"']*)\1\)/gi;
    htmlContent = htmlContent.replace(dynamicImportPathRegex, (match, quote, pathPart) => {
        replacementsMade++;
        return `import(${quote}./${pathPart}${quote})`;
    });

    // Regex to find and replace the SvelteKit base path
    // Targets: __sveltekit_xxxx = { base: "" }; or similar structures
    const sveltekitBaseAssignmentRegex = /(const\s+)?(__sveltekit_\w+\s*=\s*\{[\s\S]*?base\s*:\s*)(["'])(["'])([\s\S]*?};)/;
    // g1: optional "const "
    // g2: `__sveltekit_HASH = { ... base: `
    // g3: opening quote `"` (assuming empty base string)
    // g4: closing quote `"` (assuming empty base string)
    // g5: rest of the object ` };` (including potential newlines and spaces)

    htmlContent = htmlContent.replace(sveltekitBaseAssignmentRegex, (match, g1Const, g2Prefix, g3OpenQuote, g4CloseQuote, g5Suffix) => {
        // Check if the current base value is indeed empty (g3OpenQuote and g4CloseQuote are consecutive)
        // This is a safeguard, though the regex is designed for base: ""
        if (g3OpenQuote === g4CloseQuote || (g3OpenQuote + g4CloseQuote === `""`) || (g3OpenQuote + g4CloseQuote === `''`)) {
            const dynamicBase = 'new URL(".", location).pathname.slice(0, -1)';
            console.log('[fix-html-paths] Modifying SvelteKit base path for embedded mode.');
            replacementsMade++;
            return (g1Const || '') + g2Prefix + dynamicBase + g5Suffix;
        }
        // If base wasn't empty or quotes didn't match, return original match to avoid breaking something unexpected
        return match;
    });

    if (htmlContent === originalHtmlContent && /__sveltekit_\w+\s*=\s*\{/.test(originalHtmlContent) && /base\s*:\s*""/.test(originalHtmlContent)) {
        console.warn('[fix-html-paths] SvelteKit base path object with `base: ""` was found, but the regex replacement did not occur. Check the regex in fix-html-paths.js.');
    }


    if (replacementsMade > 0) {
        fs.writeFileSync(absoluteFilePath, htmlContent, 'utf-8');
        console.log(`Successfully updated paths in ${absoluteFilePath}.`);
    } else {
        console.log(`No paths needing replacement were found in ${absoluteFilePath}.`);
    }

} catch (error) {
    console.error(`Error processing file ${absoluteFilePath}:`, error);
    process.exit(1);
}
