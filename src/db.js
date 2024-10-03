import pg from "pg";

export const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "cuarto_detonao",
  password: "Konnichiha.1992**",
  port: 5432,
});

