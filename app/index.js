const mySection = document.getElementById("prod-container");

for (const prod of myData) {
  const myProduct = `
    <article>
    <img src="${prod.imagen}"/>
    <button id= "agregarACarrito" class="place-content-center py-2 px-6 font-bold rounded hover:bg-pink-400">Comprar</button>
    <h3 id="titulo">${prod.titulo}</h3>
    <p id="precio">${prod.precio}</p></>
    </article>
    `;
  mySection.innerHTML += myProduct;
}

// Agregar al carrito

const carritoAside = document.getElementById("carritoAside");
const carritoItems = document.getElementById("carritoItems");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const botonCarrito = document.getElementById("botonCarrito");

let carrito = [];

function agregarAlCarrito(item) {
  // validar si el item ya esta en el carrito
  const yaFueSeleccionado = carrito.some(
    (cartItem) => cartItem.titulo === item.titulo
  );

  if (yaFueSeleccionado) {
    alert("Ya elijio este producto");
  } else {
    carrito.push(item);
    renderCarrito();
  }
}

function renderCarrito() {
  if (carrito.length === 0) {
    carritoItems.innerHTML = "<p>No eligió ningun producto</p>";
  } else {
    carritoItems.innerHTML = carrito
      .map(
        (item, index) => `
      <div class="carrito-item">
      <p>${item.titulo} ${item.precio}</p>
      <button onclick="removerCarrito(${index})" class="mb-4 px-6 bg-pink-500 rounded font-bold">Eliminar</button>
      </div>
      `
      )
      .join("");
  }
  localStorage.setItem("Mi compra", JSON.stringify(carrito));
}
function removerCarrito(index) {
  carrito.splice(index, 1);
  renderCarrito();
}

const botonComprar = document.querySelectorAll("#agregarACarrito");
botonComprar.forEach((button, index) => {
  button.addEventListener("click", () => {
    agregarAlCarrito(myData[index]);
  });
});

cerrarCarrito.addEventListener("click", function ocultarCarrito() {
  carritoAside.classList.add("hidden");
});

botonCarrito.addEventListener("click", function mostrarCarrito() {
  carritoAside.classList.remove("hidden");
});

window.addEventListener("load", function () {
  const guardarCarrito = localStorage.getItem("Mi compra");
  if (guardarCarrito) {
    carrito = JSON.parse(guardarCarrito);
    renderCarrito();
  }
});

renderCarrito();
