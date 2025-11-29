// CAMBIO CLAVE 1: Definir la URL base de tu backend en Render.
// DEBES REEMPLAZAR 'https://TU-BACKEND-RENDER.onrender.com' con la URL real de tu Web Service en Render.
const API_BASE_URL = 'https://TU-BACKEND-RENDER.onrender.com';
const API_ENDPOINT = API_BASE_URL + '/api';

// CAMBIO 2: Usar el endpoint absoluto para la ruta de administración de pagos
const API_ADMIN = API_ENDPOINT + '/admin/pagos';

// La función apiFetch se mantiene, pero ahora recibirá rutas absolutas.
async function apiFetch(path, opts={}){ 
    const token=localStorage.getItem('token'); 
    opts.headers=opts.headers||{}; 
    if(token) opts.headers['Authorization']='Bearer '+token; 
    if(!opts.method) opts.method='GET'; 
    
    // fetch usa la ruta absoluta que le pasamos
    const r=await fetch(path, opts); 
    return r.json(); 
}

function formatMoney(v){ return Number(v).toFixed(2); }

function renderTable(rows){ 
    const tbody=document.querySelector('#adminTable tbody'); 
    tbody.innerHTML=''; 
    
    rows.forEach(r=>{ 
        const tr=document.createElement('tr'); 
        tr.innerHTML=`<td>${r.name||r.email}</td><td>${r.mes}</td><td>${r.anio}</td><td>${formatMoney(r.valor)}</td><td>${r.metodo}</td><td>${r.fecha_pago}</td><td>${r.estado}</td><td><button data-id='${r.id}' class='toggle'>Cambiar</button><button data-id='${r.id}' class='del'>Eliminar</button></td>`; 
        tbody.appendChild(tr); 
    }); 
    
    document.querySelectorAll('.del').forEach(b=> b.addEventListener('click', e=>{ 
        const id=e.target.dataset.id; 
        if(!confirm('Eliminar pago?')) return; 
        // CAMBIO 3: La ruta es absoluta (API_ADMIN + /id)
        apiFetch(API_ADMIN+'/'+id, { method:'DELETE' }).then(()=>loadAll()); 
    })); 
    
    document.querySelectorAll('.toggle').forEach(b=> b.addEventListener('click', e=>{ 
        const id=e.target.dataset.id; 
        const nuevo = prompt('Estado (pendiente/aprobado)'); 
        if(!nuevo) return; 
        // CAMBIO 4: La ruta es absoluta (API_ADMIN + /id)
        apiFetch(API_ADMIN+'/'+id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ estado: nuevo }) }).then(()=>loadAll()); 
    })); 
}

async function loadAll(){ 
    // CAMBIO 5: La ruta es absoluta (API_ADMIN)
    const res = await apiFetch(API_ADMIN); 
    if(!res.ok){ alert(res.msg||'Error'); return; } 
    renderTable(res.pagos); 
}

document.addEventListener('DOMContentLoaded', ()=>{ 
    const token=localStorage.getItem('token'); 
    if(!token) return window.location.href='login.html'; 
    try{ 
        const pl=JSON.parse(atob(token.split('.')[1])); 
        if(pl.role!=='admin') return window.location.href='reservas.html'; 
    }catch(e){ return window.location.href='reservas.html'; } 
    
    document.getElementById('search').addEventListener('input', ()=>{ 
        const q=document.getElementById('search').value.toLowerCase(); 
        const estado=document.getElementById('filterEstado').value; 
        
        loadAll().then(()=>{ 
            const rows = Array.from(document.querySelectorAll('#adminTable tbody tr')); 
            rows.forEach(tr=>{ 
                const txt=tr.textContent.toLowerCase(); 
                const match = (!q || txt.includes(q)) && (!estado || tr.children[6].textContent===estado); 
                tr.style.display = match ? '' : 'none'; 
            }); 
        }); 
    }); 
    
    document.getElementById('btnReset').addEventListener('click', ()=>{ 
        document.getElementById('search').value=''; 
        document.getElementById('filterEstado').value=''; 
        document.getElementById('search').dispatchEvent(new Event('input')); 
    }); 
    
    loadAll(); 
});