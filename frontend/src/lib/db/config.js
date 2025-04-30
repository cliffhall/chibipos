import { Sequelize } from 'sequelize';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import '$lib/db/associations.js'


const dbPath = path.resolve(process.cwd(), 'database.sqlite')

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const isDev = process.env.NODE_ENV === 'development';
let isDev = true

// const dbPath = isDev
//   ? path.resolve(process.cwd(), 'database.sqlite')   // Local dev path
//   : path.join(process.resourcesPath, 'database.sqlite');      // Packaged app path

// let dbPath
// if (import.meta.env.MODE === 'development') {
//   // SvelteKit dev server or Electron dev mode
//   dbPath = path.resolve(process.cwd(), 'database.sqlite');
// } else {
//   window.api.onUserDataPath((path) => {
//     process.env.USER_DATA_PATH = path
//   })
//   // Production build inside Electron
//   const userData = path.join(process.env.USER_DATA_PATH || '', 'database.sqlite');
//   dbPath = userData;
// }


const sequelize = new Sequelize({
  host: 'localhost',
  dialect: "sqlite",
  storage: dbPath,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

sequelize.authenticate()
  .then(() => console.log('database connected'))
  .then(() => console.log('dbPath: ', dbPath))
  .catch((error) => console.error('unable to connect to database: ', error))


export default sequelize;