import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, ".."); // Go up one level from 'scripts'

const sourcePkgPath = path.join(projectRoot, "package.json");
const destinationPkgPath = path.join(
  projectRoot,
  "dist",
  "electron",
  "package.json",
);

const sourceGsapPath = path.join(projectRoot, "gsap-bonus.tgz");
const destinationGsapPath = path.join(
  projectRoot,
  "dist",
  "electron",
  "gsap-bonus.tgz",
);

// Define paths for the database file
const sourceDbPath = path.join(projectRoot, "database.sqlite");
const destinationDbPath = path.join(
  projectRoot,
  "dist",
  "electron",
  "database.sqlite",
);

async function copyFiles() {
  try {
    // Copy package.json
    console.log(
      `[Copy Files] Copying ${sourcePkgPath} to ${destinationPkgPath}`,
    );
    await fs.copy(sourcePkgPath, destinationPkgPath);
    console.log("[Copy Files] package.json copied successfully.");

    // Modify the copied package.json
    try {
      const pkg = await fs.readJson(destinationPkgPath);
      delete pkg.devDependencies; // Remove devDependencies
      pkg.main = "main/index.js"; // Adjust main path
      await fs.writeJson(destinationPkgPath, pkg, { spaces: 2 });
      console.log(
        "[Copy Files] devDependencies removed and main path adjusted in copied package.json.",
      );
    } catch (err) {
      console.warn("[Copy Files] Could not process copied package.json:", err);
    }

    // Copy gsap-bonus.tgz
    if (await fs.pathExists(sourceGsapPath)) {
      console.log(
        `[Copy Files] Copying ${sourceGsapPath} to ${destinationGsapPath}`,
      );
      await fs.copy(sourceGsapPath, destinationGsapPath);
      console.log("[Copy Files] gsap-bonus.tgz copied successfully.");
    } else {
      console.warn(
        `[Copy Files] Source file ${sourceGsapPath} not found. Skipping copy.`,
      );
    }

    // Copy database.sqlite
    if (await fs.pathExists(sourceDbPath)) {
      console.log(
        `[Copy Files] Copying ${sourceDbPath} to ${destinationDbPath}`,
      );
      await fs.copy(sourceDbPath, destinationDbPath);
      console.log("[Copy Files] database.sqlite copied successfully.");
    } else {
      console.warn(
        `[Copy Files] Source database file ${sourceDbPath} not found. Skipping copy.`,
      );
      // You might want to make this a critical error if the database is essential
      // process.exit(1);
    }
  } catch (err) {
    console.error("[Copy Files] Error during file copying process:", err);
    process.exit(1);
  }
}

copyFiles();
