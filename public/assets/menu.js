(function(){
  function getPayload(){ const t=localStorage.getItem('token'); if(!t) return null; try{ return JSON.parse(atob(t.split('.')[1])); }catch(e){return null;} }
  const pl = getPayload();
  const authLink = document.getElementById('authLink');
  const logoutLinks = document.querySelectorAll('#logoutLink');
  if(pl){ if(authLink) authLink.style.display='none'; logoutLinks.forEach(e=>e.style.display='inline'); }
  if(pl && pl.role==='admin'){
    const el = document.getElementById('link_admin_reservas'); if(el) el.style.display='inline';
    const ep = document.getElementById('link_admin_pagos'); if(ep) ep.style.display='inline';
    const al = document.getElementById('adminLinks'); if(al) al.style.display='inline';
  }
  logoutLinks.forEach(l=> l.addEventListener('click', e=>{ e.preventDefault(); localStorage.removeItem('token'); window.location.href='login.html'; }));
})();