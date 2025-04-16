document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("prod-container");
  const botonCheckout = document.getElementById("botonCheckoutGlobal");
  const carritoAside = document.getElementById("carritoAside");
  const carritoItems = document.getElementById("carritoItems");
  const cerrarCarrito = document.getElementById("cerrarCarrito");
  const botonCarrito = document.getElementById("botonCarrito");
  const contadorCarrito = document.getElementById("contadorCarrito");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  actualizarContador();

  // 🔄 Mostrar carrito en el lateral
  function mostrarCarrito() {
    carritoItems.innerHTML = "";
    carrito.forEach((producto, index) => {
      const li = document.createElement("li");
      li.textContent = `${producto.nombre} - $${producto.precio} x${producto.cantidad}`;

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

    productos.forEach((producto, index) => {
      const card = document.createElement("div");
      card.className = "relative bg-white rounded shadow overflow-hidden flex flex-col items-center w-72 border";

      // Imagen centrada y adaptativa
      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.titulo;
      img.className = "w-full object-cover aspect-square";

      // Contenedor inferior con título, precio y botón
      const info = document.createElement("div");
      info.className = "absolute bottom-0 left-0 w-full flex justify-between items-end px-2 pb-2 p-6 bg-gradient-to-t from-black/80 to-transparent text-white text-sm";

      // Título + precio a la izquierda
      const tituloPrecio = document.createElement("div");
      tituloPrecio.innerHTML = `<strong>${producto.titulo}</strong><br>$${producto.precio}`;

      // Botón a la derecha
      const boton = document.createElement("button");
      boton.textContent = "Agregar";
      boton.className = "bg-pink-600 px-2 py-1 rounded text-xs hover:bg-pink-700";
      boton.addEventListener("click", () => {
        const itemExistente = carrito.find(p => p.nombre === producto.titulo);
        if (itemExistente) {
          itemExistente.cantidad += 1;
        } else {
          carrito.push({
            nombre: producto.titulo,
            cantidad: 1,
            precio: Number(producto.precio)
          });
        }
        guardarCarrito();
        mostrarCarrito();
      });

      info.appendChild(tituloPrecio);
      info.appendChild(boton);

      card.appendChild(img);
      card.appendChild(info);
      contenedor.appendChild(card);
    });

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
      const response = await fetch("/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrito })
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
      const response = await fetch("/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrito })
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

});