// src/renderer/app/lib/db/config.js
import path from 'node:path';
import fs from 'node:fs';

export function initializeSequelize(app, SequelizeConstructor) {
  let dbPath;
  let dbDir; // To store the directory path for potential creation

  if (app.isPackaged) {
    // Production: Use the userData directory
    const userDataPath = app.getPath('userData');
    dbDir = path.join(userDataPath, 'chibipos'); // Your app-specific subdirectory

    // Ensure the app-specific directory exists in userData
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`[db/config.js] Created production data directory: ${dbDir}`);
      } catch (error) {
        console.error(`[db/config.js] Failed to create production data directory ${dbDir}:`, error);
        // Depending on how critical this is, you might want to throw or handle
        throw new Error(`Failed to create production data directory: ${error.message}`);
      }
    }
    dbPath = path.join(dbDir, 'database.sqlite');
    console.log(`[db/config.js] Using PRODUCTION database at: ${dbPath}`);
  } else {
    // Development: Use a path in your project's root directory
    // app.getAppPath() in dev usually points to your project root
    dbDir = app.getAppPath(); // This is your project root
    dbPath = path.join(dbDir, 'database.sqlite');
    // No need to create dbDir here as it's the project root, which should exist.
    // If you wanted a subfolder in dev, e.g., project_root/dev_db/, you'd add:
    // dbDir = path.join(app.getAppPath(), 'dev_db');
    // if (!fs.existsSync(dbDir)) { fs.mkdirSync(dbDir, { recursive: true }); }
    // dbPath = path.join(dbDir, 'database.sqlite');
    console.log(`[db/config.js] Using DEVELOPMENT database at: ${dbPath}`);
  }

  const sequelize = new SequelizeConstructor({
    dialect: 'sqlite',
    storage: dbPath,
    logging: !app.isPackaged ? console.log : false, // Log SQL in dev, not in prod
    // Add any other Sequelize options you need
  });

  async function testConnection() {
    try {
      await sequelize.authenticate();
      console.log('[db/config.js] Database connection has been established successfully.');
    } catch (error) {
      console.error('[db/config.js] Unable to connect to the database:', error);
      throw error; // Re-throw to be caught by the caller
    }
  }

  return { sequelize, testConnection, dbPath };
}
