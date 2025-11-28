const router = require('express').Router();
const { getDb } = require('../db');
const auth = require('../middleware/auth');

function onlyAdmin(req, res, next) {
  if (req.user && req.user.email === 'admin@admin.com') return next();
  return res.status(403).json({ ok: false, msg: 'No autorizado' });
}

router.post('/', auth, onlyAdmin, (req, res) => {
  const { titulo, descripcion } = req.body;
  if (!titulo || !descripcion) return res.status(400).json({ ok: false, msg: 'faltan datos' });
  const fecha = new Date().toISOString();
  const db = getDb();
  db.run('INSERT INTO anuncios(titulo, descripcion, fecha) VALUES(?,?,?)', [titulo, descripcion, fecha], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, msg: 'Anuncio creado', id: this.lastID });
  });
});

router.get('/', auth, onlyAdmin, (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM anuncios ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, anuncios: rows });
  });
});

router.patch('/:id', auth, onlyAdmin, (req, res) => {
  const { titulo, descripcion } = req.body;
  const id = req.params.id;
  const db = getDb();
  db.run('UPDATE anuncios SET titulo = ?, descripcion = ? WHERE id = ?', [titulo, descripcion, id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, msg: 'Actualizado' });
  });
});

router.delete('/:id', auth, onlyAdmin, (req, res) => {
  const id = req.params.id;
  const db = getDb();
  db.run('DELETE FROM anuncios WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, msg: 'Eliminado' });
  });
});

module.exports = router;
