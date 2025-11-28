const router = require('express').Router();
const auth = require('../middleware/auth');
const { getDb } = require('../db');
router.post('/', auth, (req,res)=>{
  const db = getDb();
  const user_id = req.user.id;
  const { zona, fecha, hora } = req.body;
  if(!zona || !fecha || !hora) return res.status(400).json({ok:false, msg:'faltan datos'});
  const parts = hora.split(':'); const hh=parseInt(parts[0],10); const mm=parseInt(parts[1],10);
  const minutes = hh*60 + mm;
  if(minutes < 6*60 || minutes > 22*60) return res.status(400).json({ok:false,msg:'Solo se permiten reservas entre 6:00 AM y 10:00 PM'});
  db.get("SELECT * FROM reservas WHERE zona=? AND fecha=? AND hora=?", [zona,fecha,hora], (err,row)=>{
    if(err) return res.status(500).json({ok:false, msg:err.message});
    if(row) return res.status(400).json({ok:false, msg:'Esa zona ya está reservada en ese horario'});
    db.run("INSERT INTO reservas(user_id,zona,fecha,hora) VALUES(?,?,?,?)", [user_id,zona,fecha,hora], function(err){
      if(err) return res.status(500).json({ok:false, msg:err.message});
      return res.json({ok:true, msg:'Reserva creada correctamente', reserva:{id:this.lastID,user_id,zona,fecha,hora}});
    });
  });
});
router.get('/', auth, (req,res)=>{
  const db = getDb();
  const user_id = req.user.id;
  db.all("SELECT * FROM reservas WHERE user_id=? ORDER BY fecha DESC, hora DESC", [user_id], (err,rows)=>{
    if(err) return res.status(500).json({ok:false, msg:err.message});
    res.json({ok:true, reservas:rows});
  });
});
router.delete('/:id', auth, (req,res)=>{
  const db = getDb();
  const user_id = req.user.id;
  const id = req.params.id;
  db.get("SELECT * FROM reservas WHERE id=?", [id], (err,row)=>{
    if(err) return res.status(500).json({ok:false, msg:err.message});
    if(!row) return res.status(404).json({ok:false, msg:'Reserva no encontrada'});
    if(row.user_id !== user_id) return res.status(403).json({ok:false, msg:'No autorizado'});
    db.run("DELETE FROM reservas WHERE id=?", [id], function(err){
      if(err) return res.status(500).json({ok:false, msg:err.message});
      res.json({ok:true, msg:'Reserva eliminada'});
    });
  });
});
module.exports = router;