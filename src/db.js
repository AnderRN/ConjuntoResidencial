const sqlite3 = require('sqlite3').verbose();
const path = require('path');
let db;
function initDb(){
  const p = path.join(__dirname,'..','database.db');
  db = new sqlite3.Database(p);
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      zona TEXT,
      fecha TEXT,
      hora TEXT,
      estado TEXT DEFAULT 'Activa'
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      mes TEXT,
      anio INTEGER,
      valor REAL,
      metodo TEXT,
      fecha_pago TEXT,
      estado TEXT DEFAULT 'pendiente'
    )`);

// Tabla anuncios
db.run(`CREATE TABLE IF NOT EXISTS anuncios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagen TEXT,
  fecha TEXT NOT NULL
)`);
  });
  console.log('DB initialized/checked');
}
function getDb(){ return db; }
module.exports = { initDb, getDb };