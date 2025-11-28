async function fetchAnuncios(limit){
  const res = await fetch('/api/anuncios');
  const data = await res.json();
  if(!data.ok) return [];
  let arr = data.anuncios || [];
  if(limit) arr = arr.slice(0, limit);
  return arr;
}

function createCard(a, admin=false){
  const div = document.createElement('div');
  div.className = 'card anuncio-card';
  const short = a.descripcion.length>180 ? a.descripcion.substring(0,180)+'...' : a.descripcion;
  div.innerHTML = `<h3>${a.titulo}</h3><p>${short}</p><div class='card-footer'><small>${new Date(a.fecha).toLocaleString()}</small>${admin?`<button class='del' data-id='${a.id}'>Eliminar</button>`:''}</div>`;
  return div;
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const el = document.getElementById('cards');               // anuncios.html
  const latest = document.getElementById('latest-anuncios'); // index.html (if exists)
  const adminCards = document.getElementById('cardsAdmin');  // admin page
  const anuncios = await fetchAnuncios();
  if(el){
    anuncios.forEach(a=> el.appendChild(createCard(a)));
  }
  if(latest){
    anuncios.slice(0,3).forEach(a=> latest.appendChild(createCard(a)));
  }
  if(adminCards){
    anuncios.forEach(a=> adminCards.appendChild(createCard(a,true)));
    adminCards.querySelectorAll('.del').forEach(b=> b.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      if(!confirm('Eliminar anuncio?')) return;
      const token = localStorage.getItem('token');
      const r = await fetch('/api/admin/anuncios/'+id, { method:'DELETE', headers: { Authorization: 'Bearer '+token } });
      const j = await r.json();
      if(j.ok) location.reload();
      else alert(j.msg||'Error');
    }));
  }
});
