// /Users/cliffhall/Projects/chibipos/frontend/src/lib/db/config.js
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Database Configuration ---
const DATABASE_FILENAME = 'database.sqlite'; // Your database filename

// Get the directory of the current module (config.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the path to the 'frontend' directory
// __dirname is /Users/cliffhall/Projects/chibipos/frontend/src/lib/db
// path.resolve(__dirname, '../../..') goes up to /Users/cliffhall/Projects/chibipos/frontend/
const frontendDir = path.resolve(__dirname, '..', '..', '..');
const dbPath = path.join(frontendDir, DATABASE_FILENAME);

console.log(`[db/config.js] Using database at: ${dbPath}`);

// Initialize your ORM instance (e.g., Sequelize)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath, // This is the crucial part
  logging: (msg) => console.log(`[Sequelize ORM] ${msg}`), // Made logging more distinct
  // Add other ORM configurations as needed
});

// Test the connection (optional but recommended)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('[db/config.js] Connection to database has been established successfully.');
  } catch (error) {
    console.error('[db/config.js] Unable to connect to the database:', error);
    // Depending on your setup, you might want to throw the error
    // or handle it to prevent the app from starting if the DB is unavailable.
  }
}

// It's good practice to call async functions and handle their promises,
// even if it's just for logging, especially at the module level.
testConnection().catch(err => {
  console.error('[db/config.js] Error during async testConnection execution (caught at top level):', err);
});

export default sequelize; // Export the configured ORM instance
