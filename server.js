const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mercadopago = require("mercadopago");
const path = require("path");

const app = express();
const PORT = 3000;

// ✅ CONFIGURACIÓN MERCADOPAGO VÁLIDA PARA ESTA VERSIÓN
mercadopago.configure({
  access_token: "APP_USR-3186139234601513-040117-0c97fa3ec4cb9f1758644716553619e5-2366703718" // <-- poné tu token aquí
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/app', express.static(path.join(__dirname, 'app')));
app.use(express.static(__dirname));

// Carrito en memoria
let carrito = [];

app.post("/cart/add", (req, res) => {
  const { id_producto, nombre, cantidad, precio } = req.body;
  console.log("Producto recibido en el backend:", {
    id_producto,
    nombre,
    cantidad,
    precio,
    tipoDePrecio: typeof precio
  });
  if (!id_producto || !nombre || !cantidad || !precio) {
    return res.status(400).json({ error: "Faltan datos del producto" });
  }
  carrito.push({ id_producto, nombre, cantidad, precio });
  res.json({ message: "Producto agregado", carrito });
});

app.post("/checkout", async (req, res) => {
  const carritoCliente = req.body.carrito;

  if (!carritoCliente || carritoCliente.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  const preference = {
    items: carritoCliente.map(producto => ({
      title: producto.nombre,
      unit_price: producto.precio,
      quantity: producto.cantidad,
      currency_id: "ARS"
    })),
    back_urls: {
      success: "http://localhost:3000/success",
      failure: "http://localhost:3000/failure",
      pending: "http://localhost:3000/pending"
    },
    auto_return: "approved"
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "No se pudo generar la preferencia de pago" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "success.html"));
});

app.get("/failure", (req, res) => {
  res.sendFile(path.join(__dirname, "failure.html"));
});

app.get("/pending", (req, res) => {
  res.sendFile(path.join(__dirname, "pending.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});