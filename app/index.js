// Suponemos que myData ya está definido en data.js y cargado en el navegador

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("prod-container");
    const checkoutBtn = document.getElementById("checkoutButton");

    recuperarCarrito();
    mostrarCarrito();
  
    // Mostrar productos en pantalla
    myData.forEach((producto, index) => {
      const card = document.createElement("div");
      card.classList.add("producto");
  
      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.titulo;
  
      const titulo = document.createElement("h3");
      titulo.textContent = producto.titulo;
  
      const precio = document.createElement("p");
      precio.textContent = producto.precio;
  
      const boton = document.createElement("button");
      boton.textContent = "Agregar al carrito";
      boton.classList.add("btn-agregar");
      boton.addEventListener("click", async () => {
        const precioNumerico = parseFloat(producto.precio.replace(/[^0-9.]/g, ""));

        try {
          // 1. Enviar el backend
          const response = await fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_producto: index,
              nombre: producto.titulo,
              cantidad: 1,
              precio: precioNumerico
            })
          });
  
          const data = await response.json();
          console.log("Producto agregado:", data);

          //2. Agregar al carrito local para mostrar en el navegador
          carrito.push({
            id_producto: index,
            nombre: producto.titulo,
            cantidad: 1,
            precio: precioNumerico
          });

          actualizarContadorCarrito();
          guardarCarrito(); // Guarda el array en el localStorage
          mostrarCarrito(); // Vuelve a mostrar el carrito actualizado

          alert("Producto agregado al carrito");

        } catch (error) {
          console.error("Error al agregar producto:", error);
        }
      });
  
      card.appendChild(img);
      card.appendChild(titulo);
      card.appendChild(precio);
      card.appendChild(boton);
      container.appendChild(card);
    });
  
    // Procesar pago al hacer clic en "Comprar Todo"
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", async () => {
        try {
          const response = await fetch("/checkout", { method: "POST" });
          const data = await response.json();
  
          if (data.init_point) {
            window.location.href = data.init_point;
          } else {
            alert("No se pudo iniciar el pago");
          }
        } catch (error) {
          console.error("Error al procesar pago:", error);
        }
      });
    }
  });

  const carrito = [];

const carritoAside = document.getElementById("carritoAside");
const carritoItems = document.getElementById("carritoItems");
const botonCarrito = document.getElementById("botonCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");

botonCarrito.addEventListener("click", () => {
  mostrarCarrito();
  carritoAside.classList.add("visible");
});

cerrarCarrito.addEventListener("click", () => {
  carritoAside.classList.remove("visible");
});

function mostrarCarrito() {
  carritoItems.innerHTML = "";
  let total = 0;

  if (carrito.length === 0) {
    carritoItems.innerHTML = "<li>El carrito está vacío</li>";
    totalCarrito.textContent = "";
    return;
  }

  carrito.forEach((prod, i) => {
    const li = document.createElement("li");

    li.innerHTML = `
    ${prod.nombre} x${prod.cantidad} - $${prod.precio * prod.cantidad}
    <button class="eliminar" data-index="${i}">❌</button>
    `;
    
    carritoItems.appendChild(li);
    total += prod.precio * prod.cantidad;
  });

  totalCarrito.textContent = `Total: $${total}`;

  //Escuchar clicks en botones de eliminar
  document.querySelectorAll(".eliminar").forEach(boton => {
    boton.addEventListener("click", e => {
      const index = e.target.dataset.index;
      carrito.splice(index, 1); // eliminar del carrito
      actualizarContadorCarrito();
      guardarCarrito(); // actualizar localStorage
      mostrarCarrito(); // refrescar visual
    });
  });

  actualizarContadorCarrito();
}

document.getElementById("botonCheckout").addEventListener("click", async () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  try {
    const response = await fetch("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrito }) // ← lo mandamos completo
    });

    const data = await response.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      alert("No se pudo iniciar el pago");
    }
  } catch (error) {
    console.error("Error en el checkout:", error);
  }
});

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function recuperarCarrito() {
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    const carritoParseado = JSON.parse(carritoGuardado);
    carrito.length = 0; // limpiar array original
    carrito.push(...carritoParseado);
    mostrarCarrito();
    actualizarContadorCarrito();
  }
}

function actualizarContadorCarrito() {
  const cantidadSpan = document.getElementById("carritoCantidad");
  cantidadSpan.textContent = carrito.length
}