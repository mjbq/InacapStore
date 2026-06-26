// =========================================================================
// 1. VARIABLES GLOBALES Y PERSISTENCIA (DATOS REALES)
// =========================================================================

const productosIniciales = [
    { 
        id: 1,
        nombre: "Audífonos Gamer HyperX Cloud Flight Wireless",
        precio: 89990,
        stock: 8,
        categoria: "Audio y Periféricos",
        descripcion: "Conexión inalámbrica de 2.4 GHz de nivel de juego, hasta 30 horas de batería y comodidad HyperX.",
        imagenes: ["img/hyperx-flight.png"],
        esOferta: true,     
        descuento: 15       
    },
    { 
        id: 2, 
        nombre: "Mochila Tech Targus Intellect 15.6\"", 
        precio: 24990, 
        stock: 12, 
        categoria: "Mochilas y Accesorios", 
        descripcion: "Diseño delgado y liviano con compartimento acolchado dedicado para tu notebook de estudio.", 
        imagenes: ["img/mochila-targus.png"], 
        esOferta: false
    },
    { 
        id: 3, 
        nombre: "Notebook ASUS Vivobook 15 Core i5 16GB RAM",
        precio: 529990,
        stock: 4,
        categoria: "Computadores",
        descripcion: "Procesador Intel Core i5 de 12a gen, 512GB SSD NVMe, ideal para programación y desarrollo de software.",
        imagenes: ["img/asus-vivobook.png"],
        esOferta: true,
        descuento: 10
    },
    { 
        id: 4, 
        nombre: "Teclado Mecánico Redragon Mitra K551 RGB", 
        precio: 42990, 
        stock: 6, 
        categoria: "Audio y Periféricos", 
        descripcion: "Teclado mecánico con switches Outemu Red (silenciosos), estructura de aluminio y retroiluminación RGB.", 
        imagenes: ["img/redragon-mitra.png"], 
        esOferta: false      
    },
    { 
        id: 5, 
        nombre: "Hub Multi-puerto Baseus USB-C 6 en 1", 
        precio: 29990, 
        stock: 15, 
        categoria: "Conectividad", 
        descripcion: "Expansión masiva con puerto HDMI 4K, 3 puertos USB 3.0 y lector de tarjetas SD/MicroSD.", 
        imagenes: ["img/hub-baseus.png"], 
        esOferta: false
    },
    { 
        id: 6,         
        nombre: "Disco Duro Externo WD Elements 1TB USB 3.0", 
        precio: 54990, 
        stock: 7, 
        categoria: "Almacenamiento", 
        descripcion: "Almacenamiento portátil de gran capacidad, plug-and-play ideal para respaldar tus proyectos e informes.", 
        imagenes: ["img/wd-elements.png"], 
        esOferta: true,
        descuento: 5
    }
];

// Carga inicial correcta vinculada a LocalStorage
let listaProductos = JSON.parse(localStorage.getItem("productos")) || productosIniciales;
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Guardar en LocalStorage si es la primera vez que se entra para asegurar las categorías
if (!localStorage.getItem("productos")) {
    localStorage.setItem("productos", JSON.stringify(listaProductos));
}

// =========================================================================
// 2. MÓDULO DE FILTRADO DINÁMICO
// =========================================================================

function inicializarFiltros() {
    const selectorCategoria = document.getElementById("filtro-categoria");
    const controlPrecio = document.getElementById("filtro-precio");
    
    if (!selectorCategoria || !controlPrecio) return; 

    // 1. Población dinámica de categorías desde LocalStorage (listaProductos)
    const categoriasExistentes = listaProductos.map(p => p.categoria || "General");
    const categoriasUnicas = ["Todas las Categorías", ...new Set(categoriasExistentes)];
    
    selectorCategoria.innerHTML = categoriasUnicas.map(cat => 
        `<option value="${cat}">${cat}</option>`
    ).join("");

    // 2. Cálculo automático del precio máximo basado en el producto de mayor valor
    let precioMaximoCatalogo = 0;
    if (listaProductos.length > 0) {
        precioMaximoCatalogo = Math.max(...listaProductos.map(p => p.precio));
    }
    
    controlPrecio.max = precioMaximoCatalogo;
    controlPrecio.value = precioMaximoCatalogo; 
    
    const maxDispEl = document.getElementById("rango-max-disponible");
    if (maxDispEl) maxDispEl.textContent = `$${precioMaximoCatalogo.toLocaleString("es-CL")}`;
    
    const valPrecioMaxEl = document.getElementById("valor-precio-max");
    if (valPrecioMaxEl) valPrecioMaxEl.textContent = `$${precioMaximoCatalogo.toLocaleString("es-CL")}`;

    // 3. Listeners para escuchar los cambios del usuario sin recargar página
    selectorCategoria.addEventListener("change", filtrarProductos);
    controlPrecio.addEventListener("input", (e) => {
        const valPrecioMaxEl = document.getElementById("valor-precio-max");
        if (valPrecioMaxEl) valPrecioMaxEl.textContent = `$${Number(e.target.value).toLocaleString("es-CL")}`;
        filtrarProductos();
    });
}

function filtrarProductos() {
    const selectorCatEl = document.getElementById("filtro-categoria");
    const controlPrecioEl = document.getElementById("filtro-precio");

    if (!selectorCatEl || !controlPrecioEl) {
        renderizarProductos(listaProductos);
        return;
    }

    const categoriaSeleccionada = selectorCatEl.value;
    const precioMaximoSeleccionado = Number(controlPrecioEl.value);

    const productosFiltrados = listaProductos.filter(prod => {
        const cumpleCategoria = (categoriaSeleccionada === "Todas las Categorías" || prod.categoria === categoriaSeleccionada);
        const cumplePrecio = prod.precio <= precioMaximoSeleccionado;
        return cumpleCategoria && cumplePrecio;
    });

    renderizarProductos(productosFiltrados);
}

// =========================================================================
// 3. CONTROL DE TIENDA Y RENDERIZADO ORIGINAL EXACTO
// =========================================================================

function renderizarProductos(listaAMostrar = listaProductos) {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return; 
    contenedor.innerHTML = "";

    if (listaAMostrar.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center my-5">
                <p class="text-muted fw-bold fs-5">No existen productos que coincidan con los criterios seleccionados.</p>
            </div>`;
        return;
    }

    listaAMostrar.forEach(prod => {
        const agotado = prod.stock === 0;
        let precioFinal = prod.precio;
        let contenedorPreciosHTML = "";
        let badgeOfertaHTML = "";

        if (prod.esOferta && !agotado) {
            precioFinal = Math.round(prod.precio * (1 - (prod.descuento / 100))); 
            badgeOfertaHTML = `
                <span class="badge bg-danger text-white position-absolute top-0 start-0 m-2 px-2 py-1 fw-bold shadow-sm" style="z-index: 2;">
                    <i class="bi bi-tag-fill me-1"></i>-${prod.descuento}% DCTO
                </span>
            `;
            contenedorPreciosHTML = `
                <div class="d-flex flex-column">
                    <span class="text-muted small text-decoration-line-through">$${prod.precio.toLocaleString()}</span>
                    <span class="fw-bold text-danger fs-5">$${precioFinal.toLocaleString()}</span>
                </div>
            `;
        } else {
            contenedorPreciosHTML = `<span class="fw-bold text-dark fs-5">$${prod.precio.toLocaleString()}</span>`;
        }

        let slidesHTML = "";
        if (prod.imagenes && prod.imagenes.length > 0) {
            prod.imagenes.forEach((imgRuta, index) => {
                slidesHTML += `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <div class="ratio ratio-4x3 bg-light rounded-top overflow-hidden">
                            <img src="${imgRuta}" alt="${prod.nombre}" style="object-fit: contain; padding: 10px;">
                        </div>
                    </div>
                `;
            });
        }

        const tieneMultiplesImg = prod.imagenes && prod.imagenes.length > 1;
        const idCarrusel = `carrusel-prod-${prod.id}`;
        const controlesHTML = tieneMultiplesImg ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#${idCarrusel}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon bg-dark rounded-circle" aria-hidden="true" style="width: 2rem; height: 2rem;"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${idCarrusel}" data-bs-slide="next">
                <span class="carousel-control-next-icon bg-dark rounded-circle" aria-hidden="true" style="width: 2rem; height: 2rem;"></span>
            </button>
        ` : "";

        contenedor.innerHTML += `
            <div class="col-12 col-md-6 col-xl-4 mb-4">
                <div class="card h-100 shadow-sm border-0 position-relative ${agotado ? 'opacity-50 border border-danger dashed' : ''}">
                    ${badgeOfertaHTML}
                    <div id="${idCarrusel}" class="carousel slide" data-bs-ride="false">
                        <div class="carousel-inner">${slidesHTML}</div>
                        ${controlesHTML}
                    </div>
                    <div class="card-body d-flex flex-column p-3">
                        <span class="badge bg-secondary text-uppercase mb-2 align-self-start small" style="font-size: 0.75rem;">${prod.categoria || 'General'}</span>
                        <h5 class="card-title fw-bold text-dark mb-1 fs-5">${prod.nombre}</h5>
                        <p class="card-text text-muted small mb-3">${prod.descripcion || ''}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                ${contenedorPreciosHTML}
                                <span class="small fw-semibold ${agotado ? 'text-danger' : 'text-success'}">${agotado ? 'Agotado 🚫' : `Stock: ${prod.stock}`}</span>
                            </div>
                            <button class="btn ${agotado ? 'btn-secondary' : 'btn-warning text-dark'} fw-bold w-100 py-2" onclick="agregarProducto(${prod.id})" ${agotado ? 'disabled' : ''}>
                                ${agotado ? 'Sin Stock' : '<i class="bi bi-cart-plus-fill me-1"></i> Agregar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function agregarProducto(id) {
    const producto = listaProductos.find(p => p.id === id);
    if (producto && producto.stock > 0) {
        producto.stock--;
        const precioCobrado = producto.esOferta ? producto.precio * (1 - (producto.descuento / 100)) : producto.precio;

        const itemCarrito = carrito.find(item => item.id === id);
        if (itemCarrito) {
            itemCarrito.cantidad++; 
        } else {
            carrito.push({ id: producto.id, nombre: producto.nombre, precio: precioCobrado, cantidad: 1 });
        }
        actualizarLocalStorage();
        filtrarProductos(); 
        renderizarCarrito();
    }
}

// =========================================================================
// 4. MÓDULO DE NAVEGACIÓN Y SESIONES (MENÚ COMPARTIDO DINÁMICO)
// =========================================================================

function renderizarMenuNavegacion() {
    const contenedorMenu = document.getElementById("menu-autenticacion");
    if (!contenedorMenu) return;

    const sesionActiva = JSON.parse(localStorage.getItem("sesion_activa"));

    if (sesionActiva && sesionActiva.logueado) {
        // Estructura requerida: Bienvenido, NombreUsuario junto al botón Cerrar sesión
        contenedorMenu.innerHTML = `
            <div class="d-flex align-items-center flex-column flex-lg-row gap-2">
                <span class="navbar-text fw-bold text-dark me-lg-2">
                    <i class="bi bi-person-circle text-crimson-store me-1"></i>Bienvenido, ${sesionActiva.nombre}
                </span>
                <button class="btn btn-outline-danger btn-sm fw-bold px-3 py-1.5 rounded-3 text-uppercase" onclick="cerrarSesion()">
                    Cerrar sesión <i class="bi bi-box-arrow-right ms-1"></i>
                </button>
            </div>
        `;
    } else {
        // Menú por defecto para visitantes sin sesión iniciada
        contenedorMenu.innerHTML = `
            <div class="d-flex gap-2 justify-content-center">
                <a href="login.html" class="btn btn-outline-dark px-3 fw-semibold">Iniciar Sesión</a>
                <a href="registro.html" class="btn btn-warning text-white fw-bold shadow-sm btn-enviar">Registrarse</a>
            </div>
        `;
    }
}

function cerrarSesion() {
    // • Se deberá eliminar la sesión actual.
    localStorage.removeItem("sesion_activa");
    // • El sistema redireccionará a la página principal.
    window.location.href = "index.html";
}

function renderizarCarrito() {
    const tabla = document.getElementById("cuerpo-carrito");
    if (!tabla) return; 
    tabla.innerHTML = "";

    if (carrito.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" class="text-muted py-4">El carrito está vacío</td></tr>`;
        document.getElementById("total-carrito").innerText = "0";
        return;
    }

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        tabla.innerHTML += `
            <tr>
                <td class="text-start ps-3 fw-semibold text-truncate" style="max-width: 120px;">${item.nombre}</td>
                <td class="fw-bold">${item.cantidad}</td>
                <td class="fw-bold text-dark">$${subtotal.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-link text-danger p-0 border-0" onclick="eliminarProducto(${item.id})">
                        <i class="bi bi-trash3-fill fs-6"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById("total-carrito").innerText = total.toLocaleString();
}

function eliminarProducto(id) {
    const itemCarrito = carrito.find(item => item.id === id);
    if (itemCarrito) {
        const productoCat = listaProductos.find(p => p.id === id);
        if (productoCat) productoCat.stock++;
        
        itemCarrito.cantidad--;
        if (itemCarrito.cantidad === 0) carrito = carrito.filter(item => item.id !== id);
        
        actualizarLocalStorage();
        filtrarProductos(); 
        renderizarCarrito();
    }
}

function vaciarCarrito() {
    if (carrito.length === 0) return;
    carrito.forEach(item => {
        const prod = listaProductos.find(p => p.id === item.id);
        if (prod) prod.stock += item.cantidad;
    });
    carrito = [];
    actualizarLocalStorage();
    filtrarProductos();
    renderizarCarrito();
}

function realizarCompra() {
    let carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    let productosActuales = JSON.parse(localStorage.getItem('productos')) || [];

    if (carritoActual.length === 0) {
        alert("El carrito está vacío. Agregue productos antes de realizar la compra.");
        return;
    }

    carritoActual.forEach(itemCarrito => {
        let productoCatalogo = productosActuales.find(prod => prod.id === itemCarrito.id);
        if (productoCatalogo) {
            productoCatalogo.stock -= itemCarrito.cantidad;
            if (productoCatalogo.stock < 0) productoCatalogo.stock = 0;
        }
    });

    localStorage.setItem('productos', JSON.stringify(productosActuales));
    localStorage.setItem('carrito', JSON.stringify([]));

    alert("Su compra fue realizada con éxito.");
    
    listaProductos = productosActuales;
    carrito = [];
    filtrarProductos();
    renderizarCarrito();
}

// =========================================================================
// 5. FORMULARIO DE CONTACTO
// =========================================================================

function validarFormularioContacto(evento) {
    evento.preventDefault(); 
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();
    const contenedorEstado = document.getElementById("mensaje-estado");

    if (!contenedorEstado) return;

    if (nombre === "" || correo === "" || mensaje === "") {
        contenedorEstado.className = "alert alert-danger text-center fw-bold mb-3 shadow-sm";
        contenedorEstado.textContent = "Todos los campos son obligatorios.";
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        contenedorEstado.className = "alert alert-danger text-center fw-bold mb-3 shadow-sm";
        contenedorEstado.textContent = "Por favor, ingresa un correo electrónico válido.";
        return;
    }
    if (mensaje.length < 10) {
        contenedorEstado.className = "alert alert-danger text-center fw-bold mb-3 shadow-sm";
        contenedorEstado.textContent = "El mensaje debe ser más descriptivo (mínimo 10 caracteres).";
        return;
    }

    contenedorEstado.className = "alert alert-success text-center fw-bold mb-3 shadow-sm";
    contenedorEstado.textContent = `¡Gracias por escribirnos, ${nombre}! Tu mensaje ha sido enviado exitosamente.`;
    document.getElementById("formulario-contacto").reset(); 
    setTimeout(() => {  
        contenedorEstado.textContent = "";
        contenedorEstado.className = "";
    }, 5000); 
}

function actualizarLocalStorage() {
    localStorage.setItem("productos", JSON.stringify(listaProductos));
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// =========================================================================
// 6. UNIFICACIÓN TOTAL DE CARGA DEL DOM 
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Renderizado estructural base
    inicializarFiltros();
    filtrarProductos(); 
    renderizarCarrito();
    renderizarMenuNavegacion(); // Gestiona el estado de login en el Navbar en cualquier página
    
    const formularioContacto = document.getElementById("formulario-contacto");
    if (formularioContacto) {
        formularioContacto.addEventListener("submit", validarFormularioContacto);
    }

    // -----------------------------------------------------------------
    // LÓGICA DE INICIO DE SESIÓN (login.html)
    // -----------------------------------------------------------------
    const formLogin = document.getElementById("form-login");
    const msgErrorLogin = document.getElementById("msg-error");
    const msgExitoLogin = document.getElementById("msg-exito");

    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();

            if (msgErrorLogin) msgErrorLogin.classList.add("d-none");
            if (msgExitoLogin) msgExitoLogin.classList.add("d-none");

            const emailInput = document.getElementById("email").value.trim();
            const passwordInput = document.getElementById("password").value.trim();

            if (emailInput === "" || passwordInput === "") {
                if (msgErrorLogin) {
                    msgErrorLogin.textContent = "Por favor, complete todos los campos.";
                    msgErrorLogin.classList.remove("d-none");
                }
                return;
            }

            const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];
            const usuarioEncontrado = usuariosGuardados.find(
                (user) => user.correo === emailInput && user.password === passwordInput
            );

            if (usuarioEncontrado) {
                if (msgExitoLogin) msgExitoLogin.classList.remove("d-none");
                
                // Recordar usuario activo mediante estructura de control de sesión
                const sesionUsuario = {
                    nombre: usuarioEncontrado.nombre,
                    correo: usuarioEncontrado.correo,
                    logueado: true
                };
                localStorage.setItem("sesion_activa", JSON.stringify(sesionUsuario));
                
                setTimeout(() => { window.location.href = "index.html"; }, 1500);
            } else {
                if (msgErrorLogin) {
                    msgErrorLogin.textContent = "El correo electrónico o la contraseña son inválidos.";
                    msgErrorLogin.classList.remove("d-none");
                }
            }
        });
    }

    // -----------------------------------------------------------------
    // LÓGICA DE REGISTRO DE USUARIOS (registro.html)
    // -----------------------------------------------------------------
    const formRegistro = document.getElementById("form-registro");
    const msgErrorReg = document.getElementById("msg-error-reg");
    const msgExitoReg = document.getElementById("msg-exito-reg");

    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();

            if (msgErrorReg) msgErrorReg.classList.add("d-none");
            if (msgExitoReg) msgExitoReg.classList.add("d-none");

            const nombreReg = document.getElementById("nombre").value.trim();
            const emailReg = document.getElementById("email").value.trim();
            const passwordReg = document.getElementById("password").value;
            const confirmPasswordReg = document.getElementById("confirm-password").value;

            if (nombreReg === "" || emailReg === "" || passwordReg === "" || confirmPasswordReg === "") {
                if (msgErrorReg) {
                    msgErrorReg.textContent = "Por favor, complete todos los campos obligatorios.";
                    msgErrorReg.classList.remove("d-none");
                }
                return;
            }

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(emailReg)) {
                if (msgErrorReg) {
                    msgErrorReg.textContent = "El formato del correo electrónico no es válido (ejemplo@correo.com).";
                    msgErrorReg.classList.remove("d-none");
                }
                return;
            }

            let usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];
            const correoExiste = usuariosGuardados.some(user => user.correo.toLowerCase() === emailReg.toLowerCase());
            if (correoExiste) {
                if (msgErrorReg) {
                    msgErrorReg.textContent = "Este correo electrónico ya se encuentra registrado.";
                    msgErrorReg.classList.remove("d-none");
                }
                return;
            }

            if (passwordReg.length < 8) {
                if (msgErrorReg) {
                    msgErrorReg.textContent = "La contraseña debe contener como mínimo 8 caracteres.";
                    msgErrorReg.classList.remove("d-none");
                }
                return;
            }

            const tieneMayuscula = /[A-Z]/.test(passwordReg);
            const tieneMinuscula = /[a-z]/.test(passwordReg);
            const tieneNumero = /[0-9]/.test(passwordReg);
            const tieneEspecial = /[^A-Za-z0-9]/.test(passwordReg);

            if (!tieneMayuscula) {
                if (msgErrorReg) { msgErrorReg.textContent = "La contraseña debe contener al menos una letra mayúscula."; msgErrorReg.classList.remove("d-none"); }
                return;
            }
            if (!tieneMinuscula) {
                if (msgErrorReg) { msgErrorReg.textContent = "La contraseña debe contener al menos una letra minúscula."; msgErrorReg.classList.remove("d-none"); }
                return;
            }
            if (!tieneNumero) {
                if (msgErrorReg) { msgErrorReg.textContent = "La contraseña debe contener al menos un número."; msgErrorReg.classList.remove("d-none"); }
                return;
            }
            if (!tieneEspecial) {
                if (msgErrorReg) { msgErrorReg.textContent = "La contraseña debe contener al menos un símbolo especial (ej: !@#$%^&*)."; msgErrorReg.classList.remove("d-none"); }
                return;
            }

            if (passwordReg !== confirmPasswordReg) {
                if (msgErrorReg) {
                    msgErrorReg.textContent = "Las contraseñas ingresadas no coinciden.";
                    msgErrorReg.classList.remove("d-none");
                }
                return;
            }

            // Capturar fecha actual con formato dinámico YYYY-MM-DD requerido
            const fechaActual = new Date().toISOString().split('T')[0];

            // Estructura de Almacenamiento requerida por rúbrica
            const nuevoUsuario = { 
                correo: emailReg, 
                nombre: nombreReg, 
                password: passwordReg,
                fechaCreacion: fechaActual
            };
            
            usuariosGuardados.push(nuevoUsuario);
            localStorage.setItem("usuarios", JSON.stringify(usuariosGuardados));

            if (msgExitoReg) msgExitoReg.classList.remove("d-none");
            formRegistro.reset();
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
        });
    }
});