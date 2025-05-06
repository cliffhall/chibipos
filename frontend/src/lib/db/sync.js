// /Users/cliffhall/Projects/chibipos/frontend/src/lib/db/sync.js
import db from '$lib/db/config.js'; // Imports the correctly configured db instance
import '$lib/db/associations.js'; // Your model associations

async function synchronizeDatabase() {
    try {
        // The { alter: false } option is good for production to avoid accidental data loss.
        // For development, you might sometimes use { alter: true } or { force: true } (with caution).
        await db.sync({ alter: false });
        console.log("[db/sync.js] Database schema synchronized successfully.");
    } catch (error) {
        console.error("[db/sync.js] Error synchronizing the database:", error);
        // Consider how to handle this error - should the app proceed?
    }
}

// Call the synchronization function.
// The await here ensures that the synchronization attempt completes before this module finishes loading.
// If other parts of your app depend on the DB being synced immediately, this is appropriate.
await synchronizeDatabase();

export default db; // Export the db instance for use elsewhere if needed, though often models are imported directly.
