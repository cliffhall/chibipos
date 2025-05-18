import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, ".."); // Go up one level from 'scripts'

// The directory to inspect (your electron-builder output)
const distDir = path.join(projectRoot, "dist", "builder"); // Pointing to dist/builder

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

// Heuristic to guess if a file is text or binary
const textFileExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".html",
  ".css",
  ".json",
  ".yml",
  ".yaml",
  ".txt",
  ".md",
  ".xml",
  ".svg",
  ".log",
  ".ini",
  ".env",
  ".sh",
  ".bat",
  ".ps1",
  ".ts",
  ".tsx",
  ".svelte",
  ".scss",
  ".sass",
  ".less",
  ".vue",
  ".jsx",
  ".map",
]);

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return textFileExtensions.has(ext);
}

async function listDirContents(currentPath, indent = "") {
  let output = "";
  const items = await fs.promises.readdir(currentPath, { withFileTypes: true });

  items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const item of items) {
    const itemPath = path.join(currentPath, item.name);
    const isLast = item === items[items.length - 1];
    const prefix = indent + (isLast ? "└── " : "├── ");
    const nextIndent = indent + (isLast ? "    " : "│   ");

    if (item.isDirectory()) {
      // *** MODIFICATION START ***
      if (item.name === "node_modules") {
        output += `${prefix}${item.name}/ [Skipped]\n`;
        continue; // Skip traversing node_modules
      }
      // *** MODIFICATION END ***
      output += `${prefix}${item.name}/\n`;
      output += await listDirContents(itemPath, nextIndent);
    } else {
      output += `${prefix}${item.name}\n`;
      try {
        const stats = await fs.promises.stat(itemPath);
        if (isTextFile(itemPath)) {
          if (stats.size > MAX_FILE_SIZE_BYTES) {
            output += `${nextIndent}    [File content skipped: size (${(stats.size / (1024 * 1024)).toFixed(2)}MB) > 1MB]\n`;
          } else {
            const content = await fs.promises.readFile(itemPath, "utf-8");
            const indentedContent = content
              .split("\n")
              .map((line) => nextIndent + "    " + line)
              .join("\n");
            output += `${nextIndent}    ---\n${indentedContent}\n${nextIndent}    ---\n`;
          }
        } else {
          output += `${nextIndent}    [Binary file - ${(stats.size / (1024 * 1024)).toFixed(2)}MB]\n`;
        }
      } catch (error) {
        output += `${nextIndent}    [Error processing file: ${error.message}]\n`;
      }
    }
  }
  return output;
}

async function generateReport() {
  console.log(`[Generate Report] Inspecting directory: ${distDir}`);
  if (!fs.existsSync(distDir)) {
    console.error(
      `Error: Directory not found at ${distDir}. Please run 'npm run dist:dir' or 'npm run dist:all' first.`,
    );
    process.exit(1);
  }

  const reportFileName = "dist_contents.txt";
  const reportFilePath = path.join(projectRoot, reportFileName);

  try {
    let reportContent = `Report generated on: ${new Date().toISOString()}\n\n`;
    reportContent += `Contents of ${distDir}:\n`;
    reportContent += await listDirContents(distDir);

    await fs.promises.writeFile(reportFilePath, reportContent, "utf-8");
    console.log(`[Generate Report] Report saved to ${reportFilePath}`);
  } catch (error) {
    console.error("[Generate Report] Error generating report:", error);
    process.exit(1);
  }
}

generateReport();
