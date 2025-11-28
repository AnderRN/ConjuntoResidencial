const jwt = require('jsonwebtoken');
module.exports = function(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ok:false, msg:'no token'});
  const token = h.split(' ')[1];
  try{ const data = jwt.verify(token, process.env.JWT_SECRET || 'secret'); req.user = data; next(); }catch(e){ return res.status(401).json({ok:false, msg:'invalid token'}); }
};