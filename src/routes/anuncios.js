const router = require('express').Router();
const { getDb } = require('../db');

router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM anuncios ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, anuncios: rows });
  });
});

module.exports = router;
