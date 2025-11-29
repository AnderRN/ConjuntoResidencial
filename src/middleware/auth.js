const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const h = req.headers.authorization;
    
    // 1. Verificar si existe el encabezado de autorización
    if (!h) {
        return res.status(401).json({ ok: false, msg: 'no token' });
    }
    
    // El formato es 'Bearer [token]', obtenemos el token
    const token = h.split(' ')[1];
    
    try {
        // 2. Verificar y decodificar el token
        // NOTA: Usamos process.env.JWT_SECRET. Asegúrate de definir esta variable en Render.
        const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // 3. Adjuntar los datos del usuario a la solicitud
        req.user = data; 
        next(); 
        
    } catch (e) { 
        // 4. Manejar tokens inválidos o expirados
        return res.status(401).json({ ok: false, msg: 'invalid token' }); 
    }
};