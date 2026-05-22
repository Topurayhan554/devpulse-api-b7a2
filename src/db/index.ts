import config from "../config";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            email VARCHAR(30) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            
            role VARCHAR(20) NOT NULL DEFAULT 'contributor'
                CHECK (role IN ('contributor','maintainer')),
            
            create_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);

    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database initialization failed", error);
  }
};
