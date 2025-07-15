// db_connection.js
require('dotenv').config();
const { Pool } = require('pg'); // O 'mysql2/promise' si insistes en MySQL y tienes uno en la nube (no recomendado gratuito)

const pool = new Pool({ // O mysql.createPool
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { // Para Supabase, es posible que necesites SSL
        rejectUnauthorized: false // Para desarrollo/pruebas, o true con certificados si tienes uno
    }
});

// Asegurar/crear la tabla (esto lo harás una vez al inicio, puedes tenerlo en un script separado o aquí)
async function ensureTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS banned_players (
                id SERIAL PRIMARY KEY, -- SERIAL para auto-increment en PostgreSQL
                player_id VARCHAR(255) NOT NULL UNIQUE,
                moderator_id VARCHAR(255) NOT NULL,
                reason TEXT,
                date_banned TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP para DATETIME en PostgreSQL
                expiration_date TIMESTAMP NULL,
                active BOOLEAN DEFAULT TRUE
            );
        `);
        console.log('Tabla banned_players asegurada/creada.');
    } catch (error) {
        console.error('Error al asegurar/crear la tabla banned_players:', error);
    }
}

ensureTableExists(); // Asegurar la tabla al cargar la conexión

module.exports = pool;
