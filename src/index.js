require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Mantenemos la importación de initDb
const { initDb } = require('./db'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Función principal asíncrona para iniciar la DB y el servidor
async function startServer() {
    try {
        // CAMBIO CLAVE: Esperar a que la DB se conecte (PostgreSQL es asíncrono)
        await initDb();
        console.log("Base de datos conectada exitosamente.");

        // Rutas (se mantienen igual)
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api', require('./routes/api'));
        app.use('/api/anuncios', require('./routes/anuncios'));
        app.use('/api/admin/anuncios', require('./routes/admin_anuncios'));
        app.use('/api/reservas', require('./routes/reservas'));
        app.use('/api/admin/reservas', require('./routes/admin_reservas'));
        app.use('/api/pagos', require('./routes/pagos'));
        app.use('/api/admin/pagos', require('./routes/admin_pagos'));
        
        // Iniciar el servidor solo después de que la DB esté lista
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => console.log(`Servidor Node.js corriendo en el puerto ${PORT}`));

    } catch (error) {
        console.error("Error fatal al iniciar el servidor o la DB:", error.message);
        // Si la conexión a la DB falla, salimos de la aplicación
        process.exit(1); 
    }
}

// Llamar a la función para empezar
startServer();
// =======================================================