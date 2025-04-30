import db from '$lib/db/config'
import '$lib/db/associations.js'

await db.sync({ alter: false })
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.log("Database error", error);
  });

export default db