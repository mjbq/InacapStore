// SISTEMA DE AUTENTICACIÓN LOCALSTORAGE - INACAPSTORE

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el arreglo de usuarios en LocalStorage si no existe
    if (!localStorage.getItem("usuarios")) {
        localStorage.setItem("usuarios", JSON.stringify([]));
    }

    // Ejecutar el renderizado del menú de navegación dinámico en la carga
    renderizarMenuNavegacion();

    // Captura de los formularios según la página activa
    const formRegistro = document.getElementById("form-registro");
    const formLogin = document.getElementById("form-login");

       // PROCESO A: REGISTRO DE USUARIOS
 
    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();

            const nombre = document.getElementById("reg-nombre").value.trim();
            const correo = document.getElementById("reg-correo").value.trim();
            const password = document.getElementById("reg-password").value;
            const passwordConfirm = document.getElementById("reg-password-confirm").value;
            const contenedorMensaje = document.getElementById("mensaje-registro");

            // 1. Validar que ningún campo se encuentre vacío
            if (!nombre || !correo || !password || !passwordConfirm) {
                mostrarMensajeAlerta(contenedorMensaje, "Todos los campos son obligatorios.", "danger");
                return;
            }

            // 2. Validar formato de correo electrónico mediante Expresión Regular
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(correo)) {
                mostrarMensajeAlerta(contenedorMensaje, "El formato del correo electrónico no es válido.", "danger");
                return;
            }

            // 3. Validar duplicidad del correo en el sistema
            const usuarios = JSON.parse(localStorage.getItem("usuarios"));
            const correoExiste = usuarios.some(u => u.correo.toLowerCase() === correo.toLowerCase());
            if (correoExiste) {
                mostrarMensajeAlerta(contenedorMensaje, "El correo electrónico ya se encuentra registrado.", "danger");
                return;
            }

            // 4. Validar longitud mínima de la contraseña (8 caracteres)
            if (password.length < 8) {
                mostrarMensajeAlerta(contenedorMensaje, "La contraseña debe contener como mínimo 8 caracteres.", "danger");
                return;
            }

            // 5. Validar directivas de complejidad (Mayúscula, Minúscula, Número y Símbolo)
            const tieneMayuscula = /[A-Z]/.test(password);
            const tieneMinuscula = /[a-z]/.test(password);
            const tieneNumero = /[0-9]/.test(password);
            const tieneSimbolo = /[^A-Za-z0-9]/.test(password);

            if (!tieneMayuscula || !tieneMinuscula || !tieneNumero || !tieneSimbolo) {
                mostrarMensajeAlerta(contenedorMensaje, "La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial.", "danger");
                return;
            }

            // 6. Validar correspondencia mutua de las contraseñas
            if (password !== passwordConfirm) {
                mostrarMensajeAlerta(contenedorMensaje, "Las contraseñas ingresadas no coinciden.", "danger");
                return;
            }

            // Si pasa todas las validaciones, se construye el objeto estructurado requerido
            const nuevoUsuario = {
                correo: correo,
                nombre: nombre,
                password: password,
                fechaCreacion: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD (2026)
            };

            usuarios.push(nuevoUsuario);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            mostrarMensajeAlerta(contenedorMensaje, "¡Registro completado con éxito! Redireccionando al inicio de sesión...", "success");
            formRegistro.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2500);
        });
    }

   
    // PROCESO B: INICIO DE SESIÓN (LOGIN)
  
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();

            const correo = document.getElementById("login-correo").value.trim();
            const password = document.getElementById("login-password").value;
            const contenedorMensaje = document.getElementById("mensaje-login");

            // 1. Validar campos vacíos
            if (!correo || !password) {
                mostrarMensajeAlerta(contenedorMensaje, "Por favor, complete todos los campos.", "danger");
                return;
            }

            // 2. Extraer usuarios de LocalStorage y buscar coincidencias
            const usuarios = JSON.parse(localStorage.getItem("usuarios"));
            const usuarioEncontrado = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase() && u.password === password);

            if (!usuarioEncontrado) {
                mostrarMensajeAlerta(contenedorMensaje, "El correo electrónico o la contraseña son inválidos.", "danger");
                return;
            }

            // 3. Credenciales correctas: Almacenar la sesión activa
            localStorage.setItem("usuarioActivo", JSON.stringify({
                nombre: usuarioEncontrado.nombre,
                correo: usuarioEncontrado.correo
            }));

            mostrarMensajeAlerta(contenedorMensaje, `¡Ingreso exitoso! Bienvenido, ${usuarioEncontrado.nombre}.`, "success");
            formLogin.reset();

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        });
    }
});


// PROCESO C: CONTROLADOR DINÁMICO DEL MENÚ Y NAVEGACIÓN

function renderizarMenuNavegacion() {
    const contenedorMenu = document.getElementById("menu-autenticacion");
    if (!contenedorMenu) return; // Salir si el navbar no existe en la página actual

    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (usuarioActivo) {
        // Estado A: Sesión Activa (Bienvenido + Cerrar Sesión)
        contenedorMenu.innerHTML = `
            <div class="d-flex align-items-center gap-3 text-white">
                <span>Bienvenido, <strong>${usuarioActivo.nombre}</strong></span>
                <button class="btn btn-outline-danger btn-sm fw-bold" id="btn-cerrar-sesion">Cerrar sesión</button>
            </div>
        `;

        // Asignar el evento dinámico de destrucción de sesión
        document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
            localStorage.removeItem("usuarioActivo");
            window.location.href = "index.html";
        });
    } else {
        // Estado B: Visitante Anónimo (Iniciar Sesión + Registrarse)
        contenedorMenu.innerHTML = `
            <div class="d-flex gap-2">
                <a href="login.html" class="btn btn-red btn-sm fw-bold">Iniciar sesión</a>
                <a href="registro.html" class="btn btn-red btn-sm fw-bold">Registrarse</a>
            </div>
        `;
    }
}

// Helper para inyectar alertas dinámicas basadas en clases utilitarias de Bootstrap
function mostrarMensajeAlerta(contenedor, texto, tipo) {
    contenedor.textContent = texto;
    contenedor.className = `alert alert-${tipo} text-center fw-bold small p-2 mb-3 shadow-sm`;
}