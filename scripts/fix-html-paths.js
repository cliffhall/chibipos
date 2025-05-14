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

    // Regex for href and src attributes
    // (href|src)=(")/... -> (href|src)="./...
    const attributePathRegex = /(href|src)=(")\/(?!(?:[a-z]+:)?\/\/)((?:_app|favicon\.png|assets|static|images)[^"]*)/gi;
    htmlContent = htmlContent.replace(attributePathRegex, (match, attribute, quote, pathPart) => {
        replacementsMade++;
        return `${attribute}=${quote}./${pathPart}`;
    });

    // Regex for dynamic import() statements in inline scripts
    // import("/_app/...) -> import("./_app/...)
    // Handles both double and single quotes around the path
    const dynamicImportPathRegex = /import\((["'])\/(?!(?:[a-z]+:)?\/\/)((?:_app)[^"']*)\1\)/gi;
    htmlContent = htmlContent.replace(dynamicImportPathRegex, (match, quote, pathPart) => {
        replacementsMade++;
        return `import(${quote}./${pathPart}${quote})`;
    });

    if (replacementsMade > 0) {
        fs.writeFileSync(absoluteFilePath, htmlContent, 'utf-8');
        console.log(`Successfully updated paths in ${absoluteFilePath} to be relative (attributes and dynamic imports).`);
    } else {
        console.log(`No root-relative paths needing replacement were found in ${absoluteFilePath}.`);
    }

} catch (error) {
    console.error(`Error processing file ${absoluteFilePath}:`, error);
    process.exit(1);
}
