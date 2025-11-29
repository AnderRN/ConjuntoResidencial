const router = require('express').Router();
const auth = require('../middleware/auth');
// CAMBIO 1: Importar la función 'query' directamente
const { query } = require('../db');

// Hacer la función principal ASÍNCRONA
router.post('/', auth, async (req, res) => {
    const user_id = req.user.id;
    const { mes, anio, valor, metodo, fecha_pago } = req.body;
    
    // Validar datos
    if (!mes || !anio || !valor || !metodo || !fecha_pago) {
        return res.status(400).json({ ok: false, msg: 'faltan datos' });
    }

    try {
        // CAMBIO 2: Reemplazar db.get() por await query(). Usamos $1, $2, $3.
        const checkResult = await query(
            "SELECT id FROM pagos WHERE user_id=$1 AND mes=$2 AND anio=$3",
            [user_id, mes, anio]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ ok: false, msg: 'Ya existe un pago para ese mes/año' });
        }

        // CAMBIO 3: Reemplazar db.run() por await query(). Usamos $1...$7.
        const insertResult = await query(
            "INSERT INTO pagos(user_id, mes, anio, valor, metodo, fecha_pago, estado) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [user_id, mes, anio, valor, metodo, fecha_pago, 'pendiente']
        );

        // PostgreSQL devuelve el nuevo ID usando RETURNING id
        const newId = insertResult.rows[0].id;
        
        res.json({ 
            ok: true, 
            msg: 'Pago registrado', 
            pago: { id: newId, user_id, mes, anio, valor, metodo, fecha_pago, estado: 'pendiente' } 
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
            "SELECT * FROM pagos WHERE user_id=$1 ORDER BY anio DESC, mes DESC",
            [user_id]
        );

        res.json({ ok: true, pagos: result.rows });

    } catch (err) {
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

module.exports = router;