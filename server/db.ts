import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// Create MySQL connection
// Note: Make sure MySQL server is running and .env file has correct credentials
let db: any;

try {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'supermarket_db',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  db = drizzle(connection, { schema, mode: 'default' });
  console.log('✓ MySQL database connection configured');
} catch (error) {
  console.warn('⚠ MySQL connection failed - using in-memory storage');
  console.warn('Please check your .env file and ensure MySQL server is running');
  db = null;
}

export { db };