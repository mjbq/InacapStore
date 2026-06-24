// =========================================================================
// 1. CARGA INICIAL DE DATOS, PERSISTENCIA Y VARIABLES GLOBALES
// =========================================================================

// 1. Estructura con arreglos de imágenes para habilitar el carrusel interactivo
const productosIniciales = [
    { 
        id: 1, 
        nombre: "Audífonos Bluetooth Pro", 
        precio: 25000, 
        stock: 5, 
        categoria: "Audio", 
        descripcion: "Inalámbricos con cancelación de ruido activa.", 
        imagenes: ["img/audifonos.jpg", "img/audifonos1.jpg", "img/audifonos2.jpg"] // <-- Arreglo de fotos
    },
    { 
        id: 2, 
        nombre: "Mochila Porta Laptop", 
        precio: 29990, 
        stock: 6, 
        categoria: "Accesorios", 
        descripcion: "Impermeable, ergonómica y con puerto USB externo.", 
        imagenes: ["img/mochila.jpg"] // Puede tener solo una y funcionará igual

    },
    { 
        id: 3, 
        nombre: "Notebook Inacap Pro", 
        precio: 450000, 
        stock: 3, 
        categoria: "Computación", 
        descripcion: "Pantalla Full HD, procesador veloz y almacenamiento SSD.", 
        imagenes: ["img/notebook.jpg", "img/notebook1.jpg", "img/notebook2.jpg"] 
    },
    { 
        id: 4, 
       nombre: "Teclado Mecánico RGB", 
        precio: 35000, 
        stock: 4, 
        categoria: "Periféricos", 
        descripcion: "Switch red ideal para largas jornadas de estudio.", 
        imagenes: ["img/teclado.jpg", "img/teclado1.jpg", "img/teclado2.jpg"] 
    },
    { 
        id: 5, 
        nombre: "Hub USB-C 5 en 1", 
        precio: 18990, 
        stock: 5, 
        categoria: "Accesorios", 
        descripcion: "Expande tus puertos fácilmente con HDMI y USB 3.0.", 
        imagenes: ["img/hub.jpg"] 
    }
];

// Ajuste rápido: Cambia la validación inicial para que lea la nueva propiedad "imagenes"
if (!localStorage.getItem("productos")) {
    localStorage.setItem("productos", JSON.stringify(productosIniciales));
}

let listaProductos = JSON.parse(localStorage.getItem("productos"));
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// =========================================================================
// 2. FUNCIONES OBLIGATORIAS Y CONTROL DE TIENDA
// =========================================================================

/**
 * Función: renderizarProductos()
 * Renderiza el catálogo usando contenedores 'ratio' nativos de Bootstrap 5
 * para garantizar simetría perfecta en Computador, Tablet y Celular.
 */
function renderizarProductos() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return; 
    contenedor.innerHTML = "";

    listaProductos.forEach(prod => {
        const agotado = prod.stock === 0;
        
        // Determinar si el producto tiene múltiples imágenes para activar los controles del carrusel
        const tieneMultiplesImg = prod.imagenes && prod.imagenes.length > 1;
        const idCarrusel = `carrusel-prod-${prod.id}`;

        // Construir los elementos individuales (slides) del carrusel
        let slidesHTML = "";
        prod.imagenes.forEach((imgRuta, index) => {
            slidesHTML += `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <div class="ratio ratio-4x3 bg-light rounded-top overflow-hidden">
                        <img src="${imgRuta}" alt="${prod.nombre}" style="object-fit: contain; padding: 10px;">
                    </div>
                </div>
            `;
        });

        // Construir las flechas laterales de navegación solo si hay más de 1 imagen
        const controlesHTML = tieneMultiplesImg ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#${idCarrusel}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon bg-dark rounded-circle" aria-hidden="true" style="width: 2rem; height: 2rem;"></span>
                <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${idCarrusel}" data-bs-slide="next">
                <span class="carousel-control-next-icon bg-dark rounded-circle" aria-hidden="true" style="width: 2rem; height: 2rem;"></span>
                <span class="visually-hidden">Siguiente</span>
            </button>
        ` : "";

        // Inyectar la tarjeta completa al contenedor
        contenedor.innerHTML += `
            <div class="col-12 col-md-6 col-xl-4">
                <div class="card h-100 shadow-sm border-0 ${agotado ? 'opacity-50 border border-danger dashed' : ''}">
                    
                    <div id="${idCarrusel}" class="carousel slide" data-bs-ride="false">
                        <div class="carousel-inner">
                            ${slidesHTML}
                        </div>
                        ${controlesHTML}
                    </div>

                    <div class="card-body d-flex flex-column p-3">
                        <span class="badge bg-secondary text-uppercase mb-2 align-self-start small" style="font-size: 0.75rem;">${prod.categoria}</span>
                        <h5 class="card-title fw-bold text-dark mb-1 fs-5">${prod.nombre}</h5>
                        <p class="card-text text-muted small mb-3">${prod.descripcion}</p>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-primary fs-5">$${prod.precio.toLocaleString()}</span>
                                <span class="small fw-semibold ${agotado ? 'text-danger' : 'text-success'}">
                                    ${agotado ? 'Agotado 🚫' : `Stock: ${prod.stock}`}
                                </span>
                            </div>
                            <button class="btn ${agotado ? 'btn-secondary' : 'btn-warning text-dark'} fw-bold w-100 py-2" 
                                    onclick="agregarProducto(${prod.id})" 
                                    ${agotado ? 'disabled' : ''}>
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

        const itemCarrito = carrito.find(item => item.id === id);
        if (itemCarrito) {
            itemCarrito.cantidad++; 
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
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
        calcularTotal();
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

    calcularTotal();
}

function calcularTotal() {
    const totalElemento = document.getElementById("total-carrito");
    if (!totalElemento) return;

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalElemento.innerText = total.toLocaleString();
}

function eliminarProducto(id) {
    const itemCarrito = carrito.find(item => item.id === id);
    if (itemCarrito) {
        const productoCat = listaProductos.find(p => p.id === id);
        if (productoCat) {
            productoCat.stock++;
        }
        itemCarrito.cantidad--;
        if (itemCarrito.cantidad === 0) {
            carrito = carrito.filter(item => item.id !== id);
        }
        actualizarLocalStorage();
        renderizarProductos();
        renderizarCarrito();
    }
}

function vaciarCarrito() {
    if (carrito.length === 0) return;

    // 1. DEVOLVER EL STOCK: Recorremos el carrito y devolvemos las cantidades al catálogo actual
    carrito.forEach(itemEnCarrito => {
        const productoCatalogo = listaProductos.find(p => p.id === itemEnCarrito.id);
        if (productoCatalogo) {
            productoCatalogo.stock += itemEnCarrito.cantidad; // Devuelve todo el stock acumulado
        }
    });

    // 2. LIMPIAR EL CARRITO
    carrito = [];
    localStorage.removeItem("carrito");
    
    // 3. ACTUALIZAR INTERFAZ Y ALMACENAMIENTO
    actualizarLocalStorage();
    renderizarProductos();
    renderizarCarrito();
}


function validarFormularioContacto(evento) {
    evento.preventDefault(); 
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    if (nombre === "" || correo === "" || mensaje === "") {
        mostrarAlertaSegura("Todos los campos son obligatorios.", "danger");
        return;
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo)) {
        mostrarAlertaSegura("Por favor, ingresa un correo electrónico válido.", "danger");
        return;
    }

    if (mensaje.length < 10) {
        mostrarAlertaSegura("El mensaje debe ser más descriptivo (mínimo 10 caracteres).", "danger");
        return;
    }

    mostrarAlertaSegura(`¡Gracias por escribirnos, ${nombre}! Tu mensaje ha sido enviado exitosamente.`, "success");
    document.getElementById("formulario-contacto").reset(); 
}

// =========================================================================
// 3. FUNCIONES AUXILIARES Y SEGURIDAD DOM
// =========================================================================

function actualizarLocalStorage() {
    localStorage.setItem("productos", JSON.stringify(listaProductos));
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function mostrarAlertaSegura(texto, tipo) {
    const contenedorEstado = document.getElementById("mensaje-estado");
    if (!contenedorEstado) return;
    contenedorEstado.className = `alert alert-${tipo} text-center fw-bold mb-3 shadow-sm rounded-3`;
    contenedorEstado.textContent = texto;
}

// =========================================================================
// 4. INICIALIZACIÓN DE EVENTOS UNIFICADA
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    listaProductos = JSON.parse(localStorage.getItem("productos")) || productosIniciales;

    carrito.forEach(itemCarrito => {
        const productoCat = listaProductos.find(p => p.id === itemCarrito.id);
        if (productoCat) {
            productoCat.stock = Math.max(0, productoCat.stock - itemCarrito.cantidad);
        }
    });

    localStorage.setItem("productos", JSON.stringify(listaProductos));

    renderizarProductos();
    renderizarCarrito();

    const formulario = document.getElementById("formulario-contacto");
    if (formulario) {
        formulario.addEventListener("submit", validarFormularioContacto);
    }
});