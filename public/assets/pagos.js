// CAMBIO CLAVE 1: Definir la URL base de tu backend en Render.
// DEBES REEMPLAZAR 'https://TU-BACKEND-RENDER.onrender.com' con la URL real de tu Web Service en Render.
const API_BASE_URL = 'https://miconjuntoresidencial.onrender.com';
const API_ENDPOINT = API_BASE_URL + '/api';

// CAMBIO 2: Usar el endpoint absoluto para la ruta de pagos
const API_BASE = API_ENDPOINT + '/pagos';

function showMsg(text,ok=true){ 
    const el=document.getElementById('msg'); 
    el.textContent=text; 
    el.style.color= ok? 'green':'red'; 
    setTimeout(()=>el.textContent='',3500); 
}

// La función apiFetch se mantiene, ya que toma una ruta absoluta (API_BASE)
async function apiFetch(path, opts={}){ 
    const token=localStorage.getItem('token'); 
    opts.headers=opts.headers||{}; 
    if(token) opts.headers['Authorization']='Bearer '+token; 
    if(!opts.method) opts.method='GET'; 
    const r=await fetch(path, opts); 
    return r.json(); 
}

function formatMoney(v){ return Number(v).toFixed(2); }

async function loadPagos(){ 
    // CAMBIO 3: Usar API_BASE (que es absoluta)
    const res = await apiFetch(API_BASE); 
    if(!res.ok){ 
        showMsg('Error',false); 
        return; 
    } 
    const tbody=document.getElementById('tbody'); 
    tbody.innerHTML=''; 
    
    res.pagos.forEach(p=>{ 
        const tr=document.createElement('tr'); 
        tr.innerHTML=`<td>${p.mes}</td><td>${p.anio}</td><td>${formatMoney(p.valor)}</td><td>${p.metodo}</td><td>${p.fecha_pago}</td><td>${p.estado}</td><td>${p.estado==='pendiente'?'<button data-id="'+p.id+'" class="cancel">Cancelar</button>':''}</td>`; 
        tbody.appendChild(tr); 
    }); 
    
    document.querySelectorAll('.cancel').forEach(b=> b.addEventListener('click', async e=>{ 
        const id=e.target.dataset.id; 
        if(!confirm('Cancelar pago?')) return; 
        
        // CAMBIO 4: Usar API_BASE (que es absoluta)
        const rr = await apiFetch(API_BASE+'/'+id, { method:'DELETE' }); 
        
        if(rr.ok) 
            loadPagos(); 
        else 
            showMsg(rr.msg||'Error', false); 
    })); 
}

document.addEventListener('DOMContentLoaded', ()=>{ 
    const token=localStorage.getItem('token'); 
    if(!token) return window.location.href='login.html'; 
    
    document.getElementById('btnPagar').addEventListener('click', async ()=>{ 
        const mes=document.getElementById('mes').value; 
        const anio=document.getElementById('anio').value; 
        const valor=document.getElementById('valor').value; 
        const metodo=document.getElementById('metodo').value; 
        const fecha_pago=document.getElementById('fecha_pago').value; 
        
        if(!mes||!anio||!valor||!metodo||!fecha_pago){ 
            showMsg('Completa todos los campos',false); 
            return; 
        } 
        
        // CAMBIO 5: Usar API_BASE (que es absoluta)
        const res = await apiFetch(API_BASE, { 
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({ mes, anio: Number(anio), valor: Number(valor), metodo, fecha_pago }) 
        }); 
        
        if(res.ok){ 
            showMsg(res.msg); 
            loadPagos(); 
        } 
        else 
            showMsg(res.msg||'Error', false); 
    }); 
    
    loadPagos(); 
});