// CAMBIO CLAVE 1: Definir la URL base de tu backend en Render.
// DEBES REEMPLAZAR 'https://TU-BACKEND-RENDER.onrender.com' con la URL real de tu Web Service en Render.
const API_BASE_URL = 'https://miconjuntoresidencial.onrender.com';
const API_ENDPOINT = API_BASE_URL + '/api';

async function postData(url, data) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // CAMBIO 2: Usar la URL absoluta para login
            const r = await postData(API_ENDPOINT + '/auth/login', { email, password });
            
            if (r.ok && r.token) { 
                localStorage.setItem('token', r.token); 
                const pl = JSON.parse(atob(r.token.split('.')[1])); 
                
                // Redirigir según el rol
                if (pl.role === 'admin') 
                    window.location.href = 'admin_reservas.html'; 
                else 
                    window.location.href = 'reservas.html'; 
            }
            else 
                alert('Credenciales inválidas');
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // CAMBIO 3: Usar la URL absoluta para register
            const r = await postData(API_ENDPOINT + '/auth/register', { name, email, password });
            
            if (r.ok) { 
                alert('Cuenta creada. Inicia sesión.'); 
                window.location.href = 'login.html'; 
            }
            else 
                alert(r.msg || 'Error al crear cuenta');
        });
    }
});