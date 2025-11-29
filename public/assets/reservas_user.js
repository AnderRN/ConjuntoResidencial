// CAMBIO CLAVE 1: Definir la URL base de tu backend en Render.
// DEBES REEMPLAZAR 'https://TU-BACKEND-RENDER.onrender.com' con la URL real de tu Web Service en Render.
const API_BASE_URL = 'https://TU-BACKEND-RENDER.onrender.com';
const API_ENDPOINT = API_BASE_URL + '/api';

// CAMBIO 2: Usar el endpoint absoluto para la ruta de reservas
const API_BASE = API_ENDPOINT + '/reservas';

function modalShow(html, buttons=[]){
  const root = document.getElementById('modal-root');
  root.innerHTML = '<div class="modal-overlay"><div class="modal">' + html + '<div class="actions"></div></div></div>';
  const actions = root.querySelector('.actions');
  buttons.forEach(b=>{ const btn=document.createElement('button'); btn.textContent=b.label; if(b.primary) btn.style.background='#0066ff'; btn.addEventListener('click', ()=>{ if(b.onClick) b.onClick(); root.innerHTML=''; }); actions.appendChild(btn); });
}

function showMsg(text,ok=true){ const el=document.getElementById('msg'); el.textContent=text; el.style.color= ok? 'green':'red'; setTimeout(()=>el.textContent='',3500); }

function formatTimeAMPM(t){ const [hh,mm]=t.split(':'); let h=parseInt(hh,10); const am=h<12; const dh=((h+11)%12)+1; return `${dh}:${mm} ${am?'AM':'PM'}`; }

// La función apiFetch se mantiene, ya que toma una ruta absoluta (API_BASE)
async function apiFetch(path, opts={}){ 
    const token=localStorage.getItem('token'); 
    opts.headers=opts.headers||{}; 
    if(token) opts.headers['Authorization']='Bearer '+token; 
    if(!opts.method) opts.method='GET'; 
    const r=await fetch(path, opts); 
    return r.json(); 
}

function populateHours(){ const select=document.getElementById('hora'); select.innerHTML=''; const start=6*60; const end=22*60; for(let m=start;m<=end;m+=30){ const hh=Math.floor(m/60); const mm=String(m%60).padStart(2,'0'); const val=`${String(hh).padStart(2,'0')}:${mm}`; const opt=document.createElement('option'); opt.value=val; opt.textContent=formatTimeAMPM(val); select.appendChild(opt); } }

async function loadReservas(){ 
    // CAMBIO 3: Usar API_BASE (que es absoluta)
    const res=await apiFetch(API_BASE); 
    if(!res.ok){ showMsg('Error cargando reservas',false); return; } 
    const tbody=document.getElementById('tbody'); 
    tbody.innerHTML=''; 
    
    res.reservas.forEach(r=>{ 
        const tr=document.createElement('tr'); 
        tr.innerHTML=`<td>${r.zona}</td><td>${r.fecha}</td><td>${formatTimeAMPM(r.hora)}</td><td><button data-id="${r.id}" class="del">Eliminar</button></td>`; 
        tbody.appendChild(tr); 
    }); 
    
    document.querySelectorAll('.del').forEach(b=> b.addEventListener('click', e=>{ 
        const id=e.target.dataset.id; 
        modalShow('<p>¿Eliminar reserva?</p>',[{label:'Cancelar'},{label:'Confirmar', primary:true, onClick: async ()=>{ 
            // CAMBIO 4: Usar API_BASE (que es absoluta)
            const rr=await apiFetch(API_BASE+'/'+id, {method:'DELETE'}); 
            if(rr.ok){ 
                showMsg('Reserva eliminada'); 
                loadReservas(); 
            } else 
                showMsg(rr.msg||'Error',false); 
        }}]); 
    })); 
}

document.addEventListener('DOMContentLoaded', ()=>{ 
    const token=localStorage.getItem('token'); 
    if(!token) return window.location.href='login.html'; 
    try{ 
        const pl=JSON.parse(atob(token.split('.')[1])); 
        document.getElementById('welcome').textContent=`Hola, ${pl.email.split('@')[0]} 👋 - Reservas`; 
    }catch(e){} 
    
    populateHours(); 
    
    document.getElementById('btnReservar').addEventListener('click', async ()=>{ 
        const zona=document.getElementById('zona').value; 
        const fecha=document.getElementById('fecha').value; 
        const hora=document.getElementById('hora').value; 
        
        if(!zona||!fecha||!hora){ 
            showMsg('Completa todos los campos',false); 
            return; 
        } 
        
        // CAMBIO 5: Usar API_BASE (que es absoluta)
        const res=await apiFetch(API_BASE, { 
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({ zona, fecha, hora }) 
        }); 
        
        if(res.ok){ 
            modalShow('<p>'+res.msg+'</p>',[{label:'Aceptar', primary:true, onClick: ()=>{ loadReservas(); }}]); 
        } else 
            modalShow('<p>'+ (res.msg||'Error') +'</p>', [{label:'Aceptar'}]); 
    }); 
    
    loadReservas(); 
});