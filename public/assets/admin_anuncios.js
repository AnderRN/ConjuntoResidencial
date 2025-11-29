document.addEventListener('DOMContentLoaded', ()=>{
    // CAMBIO CLAVE 1: Definir la URL base de tu backend en Render.
    // DEBES REEMPLAZAR 'https://TU-BACKEND-RENDER.onrender.com' con la URL real de tu Web Service en Render.
    const API_BASE_URL = 'https://TU-BACKEND-RENDER.onrender.com';
    const API_ENDPOINT = API_BASE_URL + '/api';

    const token = localStorage.getItem('token');
    if(!token) return window.location.href='login.html';
    try{
        const pl = JSON.parse(atob(token.split('.')[1]));
        if(pl.email !== 'admin@admin.com') return window.location.href='index.html';
    }catch(e){ return window.location.href='index.html'; }

    const btn = document.getElementById('btnCrear');
    const tituloInput = document.getElementById('titulo');
    const descInput = document.getElementById('descripcion');
    const cardsAdmin = document.getElementById('cardsAdmin');

    async function load(){
        cardsAdmin.innerHTML = '<p>Cargando...</p>';
        // CAMBIO 2: Usar la URL absoluta de la API
        const res = await fetch(API_ENDPOINT + '/admin/anuncios', { headers: { Authorization: 'Bearer '+token }});
        
        const j = await res.json();
        if(!j.ok){ cardsAdmin.innerHTML = '<p>Error cargando</p>'; return; }
        cardsAdmin.innerHTML = '';
        j.anuncios.forEach(a=>{
            const card = document.createElement('div');
            card.className = 'card anuncio-card';
            card.innerHTML = `<h3>${a.titulo}</h3><p>${a.descripcion}</p><div class='card-footer'><small>${new Date(a.fecha).toLocaleString()}</small>
                <div>
                    <button class="edit" data-id="${a.id}">Editar</button>
                    <button class="del" data-id="${a.id}">Eliminar</button>
                </div>
            </div>`;
            cardsAdmin.appendChild(card);
        });
        
        // attach events
        cardsAdmin.querySelectorAll('.del').forEach(b=> b.addEventListener('click', async (e)=>{
            const id = e.target.dataset.id;
            if(!confirm('Eliminar anuncio?')) return;
            // CAMBIO 3: Usar la URL absoluta de la API para DELETE
            const r = await fetch(API_ENDPOINT + '/admin/anuncios/'+id, { method:'DELETE', headers: { Authorization: 'Bearer '+token }});
            const jj = await r.json();
            if(jj.ok) load();
            else alert(jj.msg||'Error');
        }));
        
        cardsAdmin.querySelectorAll('.edit').forEach(b=> b.addEventListener('click', async (e)=>{
            const id = e.target.dataset.id;
            const anuncio = j.anuncios.find(x=>String(x.id)===String(id));
            if(!anuncio) return alert('No encontrado');
            const newTitle = prompt('Nuevo título', anuncio.titulo);
            if(newTitle===null) return;
            const newDesc = prompt('Nueva descripción', anuncio.descripcion);
            if(newDesc===null) return;
            // CAMBIO 4: Usar la URL absoluta de la API para PATCH
            const r = await fetch(API_ENDPOINT + '/admin/anuncios/'+id, { method:'PATCH', headers: { 'Content-Type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ titulo: newTitle, descripcion: newDesc })});
            const jj = await r.json();
            if(jj.ok) load();
            else alert(jj.msg||'Error');
        }));
    }

    btn.addEventListener('click', async ()=>{
        const titulo = tituloInput.value.trim();
        const descripcion = descInput.value.trim();
        if(!titulo||!descripcion){ alert('Completa los campos'); return; }
        // CAMBIO 5: Usar la URL absoluta de la API para POST
        const r = await fetch(API_ENDPOINT + '/admin/anuncios', { method:'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ titulo, descripcion }) });
        const j = await r.json();
        if(j.ok){ tituloInput.value=''; descInput.value=''; load(); }
        else alert(j.msg||'Error');
    });

    load();
});