const router = require('express').Router();
const auth = require('../middleware/auth');
// CAMBIO 1: Importar la función 'query' directamente desde db.js
const { query } = require('../db'); 

// Hacer la función principal ASÍNCRONA
router.post('/', auth, async (req, res) => {
    const user_id = req.user.id;
    const { zona, fecha, hora } = req.body;

    if (!zona || !fecha || !hora) {
        return res.status(400).json({ ok: false, msg: 'Faltan datos' });
    }
    
    // Validación de hora (mantenida igual, es lógica de negocio)
    const parts = hora.split(':'); 
    const hh = parseInt(parts[0], 10); 
    const mm = parseInt(parts[1], 10);
    const minutes = hh * 60 + mm;
    if (minutes < 6 * 60 || minutes > 22 * 60) {
        return res.status(400).json({ ok: false, msg: 'Solo se permiten reservas entre 6:00 AM y 10:00 PM' });
    }

    try {
        // CAMBIO 2: Reemplazar db.get() por await query(). Usamos $1, $2, $3 en lugar de ?.
        const checkResult = await query("SELECT id FROM reservas WHERE zona=$1 AND fecha=$2 AND hora=$3", [zona, fecha, hora]);
        
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ ok: false, msg: 'Esa zona ya está reservada en ese horario' });
        }

        // CAMBIO 3: Reemplazar db.run() por await query(). Usamos $1, $2, $3, $4.
        const insertResult = await query(
            "INSERT INTO reservas(user_id, zona, fecha, hora) VALUES($1, $2, $3, $4) RETURNING id", 
            [user_id, zona, fecha, hora]
        );

        // PostgreSQL devuelve el nuevo ID usando RETURNING id
        const newId = insertResult.rows[0].id; 
        
        return res.json({ 
            ok: true, 
            msg: 'Reserva creada correctamente', 
            reserva: { id: newId, user_id, zona, fecha, hora } 
        });

    } catch (err) {
        // Manejo de errores centralizado
        return res.status(500).json({ ok: false, msg: err.message });
    }
});


// Hacer la función principal ASÍNCRONA
router.get('/', auth, async (req, res) => {
    const user_id = req.user.id;

    try {
        // CAMBIO 4: Reemplazar db.all() por await query(). Usamos $1.
        const result = await query(
            "SELECT * FROM reservas WHERE user_id=$1 ORDER BY fecha DESC, hora DESC", 
            [user_id]
        );

        res.json({ ok: true, reservas: result.rows });

    } catch (err) {
        return res.status(500).json({ ok: false, msg: err.message });
    }
});


// Hacer la función principal ASÍNCRONA
router.delete('/:id', auth, async (req, res) => {
    const user_id = req.user.id;
    const id = req.params.id;

    try {
        // CAMBIO 5: Verificar la reserva (db.get() -> await query()). Usamos $1.
        const checkResult = await query("SELECT user_id FROM reservas WHERE id=$1", [id]);
        const row = checkResult.rows[0]; // Obtiene la primera fila o undefined

        if (!row) {
            return res.status(404).json({ ok: false, msg: 'Reserva no encontrada' });
        }
        if (row.user_id !== user_id) {
            return res.status(403).json({ ok: false, msg: 'No autorizado' });
        }

        // CAMBIO 6: Ejecutar DELETE.
        const deleteResult = await query("DELETE FROM reservas WHERE id=$1", [id]);
        
        // deleteResult.rowCount indica cuántas filas se eliminaron
        if (deleteResult.rowCount === 0) {
             return res.status(500).json({ ok: false, msg: 'Error al eliminar la reserva (no se afectaron filas)' });
        }

        res.json({ ok: true, msg: 'Reserva eliminada' });

    } catch (err) {
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

module.exports = router;