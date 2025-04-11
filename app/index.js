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

  function actualizarContador(){
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
      card.classList.add("producto");

      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.titulo;

      const titulo = document.createElement("h3");
      titulo.textContent = producto.titulo;

      const precio = document.createElement("p");
      precio.textContent = `$${producto.precio}`;

      const boton = document.createElement("button");
      boton.textContent = "Agregar al carrito";
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

      card.appendChild(img);
      card.appendChild(titulo);
      card.appendChild(precio);
      card.appendChild(boton);
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