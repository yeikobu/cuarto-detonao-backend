import pg from "pg";
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from "./config.js";

export const pool = new pg.Pool({
  connectionString: process.env.DB_HOST,
  ssl: {
    rejectUnauthorized: false,
  },
});

// export const pool = new pg.Pool({
//   user: DB_USER,
//   host: 'localhost',
//   database: DB_DATABASE,
//   password: DB_PASSWORD,
//   port: DB_PORT,
//   ssl: false, // Para conexiones locales, no necesitas SSL
// });

pool.on('connect', () => {
  console.log('Conectado a la base de datos de Supabase');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a la base de datos:', err);
});