// src/renderer/app/lib/db/config.js
import path from 'node:path'; // Or const path = require('node:path');
import fs from 'node:fs';   // Or const fs = require('node:fs');

// Removed: const Sequelize = require('sequelize'); (or import) - it will be passed in

export function initializeSequelize(app, SequelizeConstructor) { // Accept SequelizeConstructor
  const userDataPath = app.getPath('userData');
  // It's good practice to put app-specific data in a subdirectory
  const appDataDir = path.join(userDataPath, 'chibipos');

  // Ensure the app-specific directory exists
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
    console.log(`[db/config.js] Created directory: ${appDataDir}`);
  }

  const dbPath = path.join(appDataDir, 'database.sqlite');
  console.log(`[db/config.js] Using database at: ${dbPath}`);

  const sequelize = new SequelizeConstructor({ // Use the passed-in constructor
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
