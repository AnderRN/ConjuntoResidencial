const router = require('express').Router();
const auth = require('../middleware/auth');
const { getDb } = require('../db');
router.post('/', auth, (req,res)=>{
  const db = getDb();
  const user_id = req.user.id;
  const { mes, anio, valor, metodo, fecha_pago } = req.body;
  if(!mes || !anio || !valor || !metodo || !fecha_pago) return res.status(400).json({ok:false,msg:'faltan datos'});
  db.get("SELECT * FROM pagos WHERE user_id=? AND mes=? AND anio=?", [user_id,mes,anio], (err,row)=>{
    if(err) return res.status(500).json({ok:false,msg:err.message});
    if(row) return res.status(400).json({ok:false,msg:'Ya existe un pago para ese mes/año'});
    db.run("INSERT INTO pagos(user_id,mes,anio,valor,metodo,fecha_pago,estado) VALUES(?,?,?,?,?,?,?)",
      [user_id,mes,anio,valor,metodo,fecha_pago,'pendiente'], function(err){
        if(err) return res.status(500).json({ok:false,msg:err.message});
        res.json({ok:true, msg:'Pago registrado', pago:{id:this.lastID, user_id, mes, anio, valor, metodo, fecha_pago, estado:'pendiente'}});
      });
  });
});
router.get('/', auth, (req,res)=>{
  const db = getDb();
  const user_id = req.user.id;
  db.all("SELECT * FROM pagos WHERE user_id=? ORDER BY anio DESC, mes DESC", [user_id], (err,rows)=>{
    if(err) return res.status(500).json({ok:false,msg:err.message});
    res.json({ok:true, pagos:rows});
  });
});
module.exports = router;