const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
router.post('/register',(req,res)=>{
  const db = getDb();
  const { name, email, password } = req.body;
  if(!name||!email||!password) return res.json({ok:false,msg:'faltan datos'});
  const hash = bcrypt.hashSync(password,10);
  db.get("SELECT COUNT(*) as c FROM users", [], (err,row)=>{
    if(err) return res.json({ok:false,msg:err.message});
    const role = row && row.c===0 ? 'admin' : 'user';
    db.run("INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",[name,email,hash,role], function(err){
      if(err) return res.json({ok:false,msg:'email existe'});
      res.json({ok:true, role});
    });
  });
});
router.post('/login',(req,res)=>{
  const db = getDb();
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email=?",[email], (err,user)=>{
    if(err||!user) return res.json({ok:false});
    if(user.password === password || bcrypt.compareSync(password, user.password)){
      const token = jwt.sign({id:user.id, email:user.email, role:user.role}, process.env.JWT_SECRET || 'secret');
      return res.json({ok:true, token});
    }
    return res.json({ok:false});
  });
});
module.exports = router;