// Suponemos que myData ya está definido en data.js y cargado en el navegador

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("prod-container");
    const checkoutBtn = document.getElementById("checkoutButton");
  
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
        try {
          const response = await fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_producto: index,
              nombre: producto.titulo,
              cantidad: 1,
              precio: parseFloat(producto.precio.replace("$", ""))
            })
          });
  
          const data = await response.json();
          console.log("Producto agregado:", data);
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