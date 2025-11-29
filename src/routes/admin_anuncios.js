const router = require('express').Router();
const auth = require('../middleware/auth');
// CAMBIO 1: Importar la función 'query' directamente (y eliminamos getDb)
const { query } = require('../db');

// El middleware se mantiene igual
function onlyAdmin(req, res, next) {
    // Si usaste la lógica de roles en auth.js (como hicimos), puedes simplificar esta verificación:
    // if (req.user && req.user.role === 'admin') return next();
    
    // Mantenemos tu lógica original para ser consistente:
    if (req.user && req.user.email === 'admin@admin.com') return next();
    
    return res.status(403).json({ ok: false, msg: 'No autorizado' });
}

// RUTA POST / (Crear Anuncio)
// Hacer la función principal ASÍNCRONA
router.post('/', auth, onlyAdmin, async (req, res) => {
    const { titulo, descripcion } = req.body;
    
    if (!titulo || !descripcion) {
        return res.status(400).json({ ok: false, msg: 'faltan datos' });
    }
    
    // Obtener la fecha actual
    const fecha = new Date().toISOString(); 

    try {
        // CAMBIO 2: Reemplazar db.run() por await query(). Usamos $1, $2, $3.
        const insertResult = await query(
            'INSERT INTO anuncios(titulo, descripcion, fecha) VALUES($1, $2, $3) RETURNING id', 
            [titulo, descripcion, fecha]
        );
        
        // PostgreSQL devuelve el nuevo ID usando RETURNING id
        const newId = insertResult.rows[0].id;
        
        res.json({ ok: true, msg: 'Anuncio creado', id: newId });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

// RUTA GET / (Obtener Anuncios)
// Hacer la función principal ASÍNCRONA
router.get('/', auth, onlyAdmin, async (req, res) => {
    try {
        // CAMBIO 3: Reemplazar db.all() por await query().
        const result = await query('SELECT * FROM anuncios ORDER BY id DESC');
        
        res.json({ ok: true, anuncios: result.rows });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

// RUTA PATCH /:id (Actualizar Anuncio)
// Hacer la función principal ASÍNCRONA
router.patch('/:id', auth, onlyAdmin, async (req, res) => {
    const { titulo, descripcion } = req.body;
    const id = req.params.id;
    
    try {
        // CAMBIO 4: Reemplazar db.run() por await query(). Usamos $1, $2, $3.
        const result = await query(
            'UPDATE anuncios SET titulo = $1, descripcion = $2 WHERE id = $3', 
            [titulo, descripcion, id]
        );
        
        // Verificar si la fila fue afectada
        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, msg: 'Anuncio no encontrado' });
        }
        
        res.json({ ok: true, msg: 'Actualizado' });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

// RUTA DELETE /:id (Eliminar Anuncio)
// Hacer la función principal ASÍNCRONA
router.delete('/:id', auth, onlyAdmin, async (req, res) => {
    const id = req.params.id;
    
    try {
        // CAMBIO 5: Reemplazar db.run() por await query(). Usamos $1.
        const result = await query('DELETE FROM anuncios WHERE id = $1', [id]);
        
        // Verificar si la fila fue afectada
        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, msg: 'Anuncio no encontrado' });
        }
        
        res.json({ ok: true, msg: 'Eliminado' });

    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ ok: false, msg: err.message });
    }
});

module.exports = router;