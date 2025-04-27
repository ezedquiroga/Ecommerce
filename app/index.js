document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("prod-container");
  const botonCheckout = document.getElementById("botonCheckoutGlobal");
  const carritoAside = document.getElementById("carritoAside");
  const carritoItems = document.getElementById("carritoItems");
  const cerrarCarrito = document.getElementById("cerrarCarrito");
  const botonCarrito = document.getElementById("botonCarrito");
  const contadorCarrito = document.getElementById("contadorCarrito");
  let paginaActual = 1;
  const productosPorPagina = 6;

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  actualizarContador();

  // 🔄 Mostrar carrito en el lateral
  function mostrarCarrito() {
    carritoItems.innerHTML = "";
    carrito.forEach((producto, index) => {
      const li = document.createElement("li");
      li.textContent = `${producto.titulo} - $${producto.precio} x${producto.cantidad}`;

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "❌";
      btnEliminar.addEventListener("click", () => {
        carrito.splice(index, 1);
        guardarCarrito();
        mostrarCarrito();
        actualizarContador();
      });

      li.appendChild(btnEliminar);
      carritoItems.appendChild(li);
    });
  }

  function actualizarContador() {
    const totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);
    contadorCarrito.textContent = totalItems;
  }

  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
  }

  // 🛒 Mostrar productos
  try {
    const response = await fetch("/api/productos");
    const productos = await response.json();
    window._productos = productos;
    mostrarProductosPaginados(productos);

    mostrarCarrito();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }

  // ✅ Comprar Todo
  botonCheckout.addEventListener("click", async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    try {
      const emailInput = document.getElementById("emailComprador");
      const compradorEmail = emailInput ? emailInput.value.trim() : "";

      if (!compradorEmail || !compradorEmail.includes("@")) {
        alert("Por favor ingresa un correo electrónico válido antes de comprar.");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrito, compradorEmail }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("No se pudo iniciar el pago");
      }
    } catch (error) {
      console.error("Error en el checkout:", error);
      alert("Error al conectar con el servidor");
    }
  });


function mostrarProductosPaginados(productos) {
  console.log("Mostrar productos paginados:", productos);
  const contenedor = document.getElementById("prod-container");
  contenedor.innerHTML = "";

  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productos.slice(inicio, fin);

  productosPagina.forEach((producto, index) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
       <div class="relative w-full h-64">
        <img src="${producto.imagen}" alt="${producto.titulo}" class="w-full h-full object-cover object-bottom rounded producto-imagen">

        <!-- Texto superpuesto a la izquierda -->
        <div class="absolute bottom-0 left-0 bg-white bg-opacity-80 p-2 rounded-tr-xl max-w-[60%]">
          <h3 class="text-sm font-semibold">${producto.titulo}</h3>
          <p class="text-pink-600 text-xs font-medium">$${producto.precio}</p>
        </div>
       </div>
       
       <!-- Botón agregar al carrito -->
       <div class="p-3">
        <button class="bg-pink-500 text-white px-3 py-1 text-sm rounded agregar-al-carrito w-full hover:bg-pink-600">
          Agregar al carrito
        </button>
       </div>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });

  generarControlesPaginacion(productos.length);
  agregarEventosCarrito(productos); // si lo necesitás
}

function agregarEventosCarrito(productos) {
  const botones = document.querySelectorAll(".agregar-al-carrito");
  botones.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const producto = productos[(paginaActual - 1) * productosPorPagina + i];
      const existente = carrito.find(p => p.titulo === producto.titulo);
      const precioNumerico = parseFloat(producto.precio.toString().replace('$', '').replace('.', '').replace(',', ''));
      if (existente) {
        existente.cantidad++;
      } else {
        carrito.push({
          titulo: producto.titulo,
          precio: precioNumerico,
          cantidad: 1 });
      }
      guardarCarrito();
      mostrarCarrito();
    });
  });
}

function generarControlesPaginacion(totalProductos) {
  const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
  const pagContenedor = document.getElementById("paginacion");
  pagContenedor.innerHTML = "";

  if (totalPaginas <= 1) return;

  const crearBoton = (texto, pagina) => {
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.className = `px-2 py-1 text-sm border rounded ${pagina === paginaActual ? "bg-pink-500 text-white" : "bg-white text-gray-600"}`;
    btn.addEventListener("click", () => {
      paginaActual = pagina;
      mostrarProductosPaginados(window._productos); // Usa los productos ya cargados
    });
    return btn;
  };

  if (paginaActual > 1) {
    pagContenedor.appendChild(crearBoton("◀", paginaActual - 1));
  }

  for (let i = 1; i <= totalPaginas; i++) {
    pagContenedor.appendChild(crearBoton(i, i));
  }

  if (paginaActual < totalPaginas) {
    pagContenedor.appendChild(crearBoton("▶", paginaActual + 1));
  }
}

  // Mostrar/ocultar carrito
  botonCarrito.addEventListener("click", () => {
    carritoAside.classList.toggle("visible");
  });

  cerrarCarrito.addEventListener("click", () => {
    carritoAside.classList.remove("visible");
  });

  const botonCheckoutAside = document.getElementById("botonCheckoutAside");

  botonCheckoutAside.addEventListener("click", async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    try {
      const emailInputAside = document.querySelector("#carritoAside #emailComprador");
      const compradorEmail = emailInputAside ? emailInputAside.value.trim() : "";

      if (!compradorEmail || !compradorEmail.includes("@")) {
        alert("Por favor ingresa un correo electrónico válido antes de comprar.");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrito, compradorEmail }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("No se pudo iniciar el pago");
      }
    } catch (error) {
      console.error("Error en el checkout (aside):", error);
      alert("Error al conectar con el servidor");
    }
  });

  // Modal para ampliar imagen
  const modalImagen = document.getElementById('modalImagen');
  const imagenAmpliada = document.getElementById('imagenAmpliada');
  const cerrarModal = document.getElementById('cerrarModal');

  // Asignar evento click a cada imagen
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('producto-imagen')) {
      imagenAmpliada.src = e.target.src;
      modalImagen.classList.remove('hidden');
    }
  });

  // Cerrar modal
  cerrarModal.addEventListener('click', () => {
    modalImagen.classList.add('hidden');
  });

  modalImagen.addEventListener('click', (e) => {
    if (e.target === modalImagen) {
      modalImagen.classList.add('hidden');
    }
  });

});