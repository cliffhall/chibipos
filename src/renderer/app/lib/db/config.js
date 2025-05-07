// /Users/cliffhall/Projects/chibipos/src/renderer/app/lib/db/config.js
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// This function will be called from main.js, which will pass the Electron `app` object.
function getDbPath(electronApp) {
  const DATABASE_FILENAME = 'database.sqlite';
  const isPackaged = electronApp.isPackaged;

  if (!isPackaged) { // Development mode
    // __filename for this config.js: /.../chibipos/src/renderer/app/lib/db/config.js
    const __configJsFilename = fileURLToPath(import.meta.url);
    const __configJsDirname = path.dirname(__configJsFilename);

    // Resolve path to project root (chibipos/) from src/renderer/app/lib/db/
    // ../../../../.. (5 levels up)
    const projectRoot = path.resolve(__configJsDirname, '..', '..', '..', '..', '..');
    return path.join(projectRoot, DATABASE_FILENAME);
  } else { // Production mode
    // In production, the database will reside in the userData directory.
    // main.js will be responsible for copying it there on first run.
    const userDataPath = electronApp.getPath('userData');
    return path.join(userDataPath, DATABASE_FILENAME);
  }
}

export function initializeSequelize(electronApp) {
  const dbPath = getDbPath(electronApp);
  console.log(`[db/config.js] Using database at: ${dbPath}`);

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: (msg) => console.log(`[Sequelize ORM] ${msg}`), // Or false to disable logging
    // Add other ORM configurations as needed
  });

  // Optional: A function to test the connection, callable from main.js
  async function testConnection() {
    try {
      await sequelize.authenticate();
      console.log(`[db/config.js] Connection to database at ${dbPath} has been established successfully.`);
    } catch (error) {
      console.error(`[db/config.js] Unable to connect to the database at ${dbPath}:`, error);
      throw error; // Re-throw to be handled by the caller in main.js
    }
  }

  // Return the initialized instance and the test function
  return { sequelize, testConnection, dbPath };
}
