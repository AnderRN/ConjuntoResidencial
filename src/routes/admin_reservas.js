const router = require('express').Router();
const auth = require('../middleware/auth');
// CAMBIO 1: Importar la función 'query' directamente
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
        // La consulta SQL es válida en PostgreSQL.
        const result = await query(
            "SELECT r.*, u.name, u.email FROM reservas r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.fecha DESC, r.hora DESC"
        );
        
        // PostgreSQL devuelve los resultados en result.rows
        res.json({ ok: true, reservas: result.rows });

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

    try {
        // CAMBIO 3: Reemplazar db.run() por await query(). Usamos $1 en lugar de ?.
        const result = await query("UPDATE reservas SET estado='Completada' WHERE id=$1", [id]);

        // Verificar si la fila fue afectada
        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, msg: 'Reserva no encontrada o ya completada' });
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
        const result = await query("DELETE FROM reservas WHERE id=$1", [id]);

        // Verificar si la fila fue afectada
        if (result.rowCount === 0) {
             return res.status(404).json({ ok: false, msg: 'Reserva no encontrada' });
        }
        
        res.json({ ok: true, msg: 'Eliminado' });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

module.exports = router;