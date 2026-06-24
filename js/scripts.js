// =========================================================================
// 1. VARIABLES GLOBALES Y PERSISTENCIA
// =========================================================================

const productosIniciales = [
    { 
        id: 1,
        nombre: "Audífonos Gamer Inacap Pro",
        precio: 29990,
        stock: 5,
        categoria: "Periféricos",
        descripcion: "Audio envolvente de alta definición y micrófono con cancelación de ruido.",
        imagenes: ["img/audifonos.jpg", "img/audifonos1.jpg", "img/audifonos2.jpg"],
        esOferta: true,     
        descuento: 20       
    },
    { 
        id: 2, 
        nombre: "Mochila Porta Laptop", 
        precio: 29990, 
        stock: 6, 
        categoria: "Accesorios", 
        descripcion: "Impermeable, ergonómica y con puerto USB externo.", 
        imagenes: ["img/mochila.jpg"], 
        esOferta: false
    },
    { 
        id: 3, 
        nombre: "Notebook ASUS Vivobook",
        precio: 459990,
        stock: 3,
        categoria: "Computadores",
        descripcion: "Rendimiento óptimo para tus jornadas de estudio y programación.",
        imagenes: ["img/notebook.jpg", "img/notebook1.jpg", "img/notebook2.jpg"],
        esOferta: false
    },
    { 
        id: 4, 
        nombre: "Teclado Mecánico RGB", 
        precio: 35000, 
        stock: 4, 
        categoria: "Periféricos", 
        descripcion: "Switch red ideal para largas jornadas de estudio.", 
        imagenes: ["img/teclado.jpg", "img/teclado1.jpg", "img/teclado2.jpg"],
        esOferta: true,     
        descuento: 15       
    },
    { 
        id: 5, 
        nombre: "Hub USB-C 5 en 1", 
        precio: 18990, 
        stock: 5, 
        categoria: "Accesorios", 
        descripcion: "Expande tus puertos fácilmente con HDMI y USB 3.0.", 
        imagenes: ["img/hub.jpg"], 
        esOferta: false
    }
];

let listaProductos = JSON.parse(localStorage.getItem("productos")) || productosIniciales;
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// =========================================================================
// 2. CONTROL DE TIENDA Y RENDERIZADO
// =========================================================================

function renderizarProductos() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return; 
    contenedor.innerHTML = "";

    listaProductos.forEach(prod => {
        const agotado = prod.stock === 0;
        let precioFinal = prod.precio;
        let contenedorPreciosHTML = "";
        let badgeOfertaHTML = "";

        if (prod.esOferta && !agotado) {
            precioFinal = prod.precio * (1 - (prod.descuento / 100));
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
        renderizarProductos();
        renderizarCarrito();
    }
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
        renderizarProductos();
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
    renderizarProductos();
    renderizarCarrito();
}

// =========================================================================
// 3. FORMULARIO DE CONTACTO Y EVENTOS
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
}

function actualizarLocalStorage() {
    localStorage.setItem("productos", JSON.stringify(listaProductos));
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarProductos();
    renderizarCarrito();
    const formulario = document.getElementById("formulario-contacto");
    if (formulario) formulario.addEventListener("submit", validarFormularioContacto);
});