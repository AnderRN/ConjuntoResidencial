const router = require('express').Router();
const auth = require('../middleware/auth');
// CAMBIO 1: Importar la función 'query' directamente (y eliminamos getDb)
const { query } = require('../db');

// RUTA GET /
// Hacer la función principal ASÍNCRONA
router.get('/', auth, async (req, res) => {
    // Verificación de rol (se mantiene igual)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ ok: false, msg: 'denegado' });
    }

    try {
        // CAMBIO 2: Reemplazar db.all() por await query().
        const result = await query(
            "SELECT p.*, u.name, u.email FROM pagos p LEFT JOIN users u ON u.id = p.user_id ORDER BY p.anio DESC, p.mes DESC"
        );
        
        // PostgreSQL devuelve los resultados en result.rows
        res.json({ ok: true, pagos: result.rows });

    } catch (err) {
        // Manejo de errores centralizado
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

// RUTA PATCH /:id
// Hacer la función principal ASÍNCRONA
router.patch('/:id', auth, async (req, res) => {
    // Verificación de rol (se mantiene igual)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ ok: false, msg: 'denegado' });
    }
    
    const id = req.params.id;
    const nuevo = req.body.estado;
    
    if (!nuevo) {
        return res.status(400).json({ ok: false, msg: 'faltan datos' });
    }

    try {
        // CAMBIO 3: Reemplazar db.run() por await query(). Usamos $1 y $2.
        const result = await query(
            "UPDATE pagos SET estado=$1 WHERE id=$2", 
            [nuevo, id]
        );

        // Verificar si la fila fue afectada
        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, msg: 'Pago no encontrado' });
        }
        
        res.json({ ok: true, msg: 'Actualizado' });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

// RUTA DELETE /:id
// Hacer la función principal ASÍNCRONA
router.delete('/:id', auth, async (req, res) => {
    // Verificación de rol (se mantiene igual)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ ok: false, msg: 'denegado' });
    }
    
    const id = req.params.id;

    try {
        // CAMBIO 4: Reemplazar db.run() por await query(). Usamos $1.
        const result = await query("DELETE FROM pagos WHERE id=$1", [id]);

        // Verificar si la fila fue afectada
        if (result.rowCount === 0) {
             return res.status(404).json({ ok: false, msg: 'Pago no encontrado' });
        }
        
        res.json({ ok: true, msg: 'Eliminado' });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

module.exports = router;