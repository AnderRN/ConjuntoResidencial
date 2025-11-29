const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// CAMBIO 1: Importar la función 'query' directamente desde db.js
const { query } = require('../db'); 

// Hacer la función principal ASÍNCRONA
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    // Validar datos faltantes
    if (!name || !email || !password) {
        return res.json({ ok: false, msg: 'faltan datos' });
    }
    
    const hash = bcrypt.hashSync(password, 10);
    
    try {
        // CAMBIO 2: Reemplazar db.get() por await query() para contar usuarios.
        // Usamos $1 en la consulta para contar.
        const countResult = await query("SELECT COUNT(*) AS c FROM users", []);
        
        // La sintaxis de pg usa result.rows[0].c, no solo row.c
        const userCount = countResult.rows[0].c; 
        
        // Lógica para asignar rol: si es el primer usuario, es 'admin', sino 'user'
        const role = userCount === 0 ? 'admin' : 'user';
        
        // CAMBIO 3: Reemplazar db.run() por await query() para la inserción.
        // Usamos $1, $2, $3, $4. Usamos RETURNING para obtener el ID.
        await query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
            [name, email, hash, role]
        );
        
        // Si la inserción es exitosa
        res.json({ ok: true, role });

    } catch (err) {
        // Si la inserción falla, probablemente es por la restricción UNIQUE del email
        // En un error de PostgreSQL, el código '23505' generalmente indica una violación de unicidad.
        if (err.code === '23505') {
            return res.json({ ok: false, msg: 'email existe' });
        }
        // Error del servidor
        return res.json({ ok: false, msg: err.message });
    }
});

// Hacer la función principal ASÍNCRONA
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // CAMBIO 4: Reemplazar db.get() por await query() para buscar el usuario por email.
        // Usamos $1.
        const result = await query("SELECT id, email, password, role FROM users WHERE email=$1", [email]);
        const user = result.rows[0]; // El usuario será la primera fila, o undefined

        // Verificar si el usuario existe
        if (!user) {
            return res.json({ ok: false, msg: 'Credenciales incorrectas' });
        }
        
        // Verificar la contraseña: compara el hash almacenado con la contraseña ingresada
        const passwordMatch = bcrypt.compareSync(password, user.password) || (user.password === password); // Incluir la comparación de SQLite por si acaso no hay hash
        
        if (passwordMatch) {
            // Generar Token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'secret' // Asegúrate de definir JWT_SECRET en Render
            );
            return res.json({ ok: true, token });
        }
        
        // Contraseña incorrecta
        return res.json({ ok: false, msg: 'Credenciales incorrectas' });

    } catch (err) {
        // Error de conexión o servidor
        return res.json({ ok: false, msg: err.message });
    }
});

module.exports = router;