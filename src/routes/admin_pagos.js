const router = require('express').Router();
const auth = require('../middleware/auth');
const { getDb } = require('../db');
router.get('/', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({ok:false,msg:'denegado'});
  const db = getDb();
  db.all("SELECT p.*, u.name, u.email FROM pagos p LEFT JOIN users u ON u.id = p.user_id ORDER BY p.anio DESC, p.mes DESC", [], (err,rows)=>{
    if(err) return res.status(500).json({ok:false,msg:err.message});
    res.json({ok:true, pagos:rows});
  });
});
router.patch('/:id', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({ok:false,msg:'denegado'});
  const db = getDb();
  const id = req.params.id;
  const nuevo = req.body.estado;
  if(!nuevo) return res.status(400).json({ok:false,msg:'faltan datos'});
  db.run("UPDATE pagos SET estado=? WHERE id=?", [nuevo, id], function(err){
    if(err) return res.status(500).json({ok:false,msg:err.message});
    res.json({ok:true, msg:'Actualizado'});
  });
});
router.delete('/:id', auth, (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({ok:false,msg:'denegado'});
  const db = getDb();
  const id = req.params.id;
  db.run("DELETE FROM pagos WHERE id=?", [id], function(err){
    if(err) return res.status(500).json({ok:false,msg:err.message});
    res.json({ok:true, msg:'Eliminado'});
  });
});
module.exports = router;