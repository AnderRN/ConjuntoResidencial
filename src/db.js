// =======================================================
// CÓDIGO NUEVO PARA src/db.js (PostgreSQL)
// =======================================================
const { Pool } = require('pg');

let pool;

/**
 * Inicializa la conexión a PostgreSQL usando la variable de entorno.
 * Crea las tablas si no existen.
 */
async function initDb() {
    // 1. OBTENER LA URL DE CONEXIÓN de Render
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("ERROR: La variable DATABASE_URL no está definida. Necesaria para Render.");
        return;
    }

    // 2. CONFIGURAR EL POOL DE CONEXIONES
    pool = new Pool({
        connectionString: connectionString,
        // Configuración necesaria para la conexión segura (SSL) en Render
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('Intentando conectar a PostgreSQL...');

    try {
        // 3. CREAR TABLAS (MIGRACIÓN DE SQLITE A POSTGRESQL)
        // PostgreSQL no soporta AUTOINCREMENT en la misma forma que SQLite.
        // Se usa SERIAL para la misma función.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'user'
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS reservas (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                zona TEXT,
                fecha TEXT,
                hora TEXT,
                estado TEXT DEFAULT 'Activa'
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pagos (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                mes TEXT,
                anio INTEGER,
                valor REAL,
                metodo TEXT,
                fecha_pago TEXT,
                estado TEXT DEFAULT 'pendiente'
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS anuncios (
                id SERIAL PRIMARY KEY,
                titulo TEXT NOT NULL,
                descripcion TEXT NOT NULL,
                imagen TEXT,
                fecha TEXT NOT NULL
            )
        `);

        console.log('DB PostgreSQL inicializada/tablas verificadas.');
    } catch (error) {
        console.error('Error al inicializar la DB en PostgreSQL:', error);
        throw error;
    }
}

/**
 * Obtiene el pool para ejecutar consultas en otras partes del código.
 */
function getDb() {
    return pool;
}

/**
 * Función auxiliar para ejecutar consultas (más fácil de usar en rutas).
 */
const query = (text, params) => pool.query(text, params);

module.exports = { initDb, getDb, query };
// =======================================================