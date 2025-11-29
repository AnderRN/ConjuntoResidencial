const router = require('express').Router();
// CAMBIO 1: Importar la función 'query' directamente (y eliminamos getDb)
const { query } = require('../db'); 

// Hacer la función principal ASÍNCRONA
router.get('/', async (req, res) => {
    
    try {
        // CAMBIO 2: Reemplazar db.all() por await query().
        // Esta consulta no tiene parámetros.
        const result = await query('SELECT * FROM anuncios ORDER BY id DESC');
        
        // PostgreSQL devuelve los resultados en result.rows
        res.json({ ok: true, anuncios: result.rows });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

module.exports = router;