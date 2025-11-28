const router = require('express').Router();
const auth = require('../middleware/auth');
const { getDb } = require('../db');
router.get('/', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({ok:false,msg:'denegado'});
  const db = getDb();
  db.all("SELECT r.*, u.name, u.email FROM reservas r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.fecha DESC, r.hora DESC", [], (err,rows)=>{
    if(err) return res.status(500).json({ok:false,msg:err.message});
    res.json({ok:true, reservas:rows});
  });
});
router.patch('/:id', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({ok:false,msg:'denegado'});
  const db = getDb();
  const id = req.params.id;
  db.run("UPDATE reservas SET estado='Completada' WHERE id=?", [id], function(err){
    if(err) return res.status(500).json({ok:false,msg:err.message});
    res.json({ok:true, msg:'Actualizado'});
  });
});
router.delete('/:id', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({ok:false,msg:'denegado'});
  const db = getDb();
  const id = req.params.id;
  db.run("DELETE FROM reservas WHERE id=?", [id], function(err){
    if(err) return res.status(500).json({ok:false,msg:err.message});
    res.json({ok:true, msg:'Eliminado'});
  });
});
module.exports = router;