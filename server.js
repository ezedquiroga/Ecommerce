const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mercadopago = require("mercadopago");

const app = express();
const PORT = 3000;

// ✅ Configuración de MercadoPago (válido para v1.5.13)
mercadopago.configure({
  access_token: "APP_USR-3186139234601513-040117-0c97fa3ec4cb9f1758644716553619e5-2366703718"
});

// 🧩 Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(__dirname)); // para servir HTML y JS

// 📁 Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/img");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 🔎 GET - Productos desde productos.json
app.get("/api/productos", (req, res) => {
  fs.readFile("productos.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error al leer productos" });
    const productos = JSON.parse(data || "[]");
    res.json(productos);
  });
});

// ➕ POST - Cargar nuevo producto (con imagen)
app.post("/api/productos", upload.single("imagen"), (req, res) => {
  const { titulo, precio } = req.body;
  const imagen = req.file ? `/assets/img/${req.file.filename}` : "";

  const nuevoProducto = {
    titulo,
    precio: Number(precio),
    imagen
  };

  fs.readFile("productos.json", "utf-8", (err, data) => {
    const productos = !err && data ? JSON.parse(data) : [];
    productos.push(nuevoProducto);

    fs.writeFile("productos.json", JSON.stringify(productos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error al guardar producto" });
      res.json({ message: "Producto agregado correctamente", producto: nuevoProducto });
    });
  });
});

// 💳 POST - Checkout con MercadoPago
app.post("/checkout", async (req, res) => {
  const carritoCliente = req.body.carrito;

  if (!carritoCliente || carritoCliente.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  const preference = {
    items: carritoCliente.map((producto) => ({
      title: producto.nombre,
      unit_price: Number(producto.precio),
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
    res.status(500).json({ error: "No se pudo generar la preferencia" });
  }
});

// 📄 Rutas para el resultado del pago
app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "success.html"));
});
app.get("/failure", (req, res) => {
  res.sendFile(path.join(__dirname, "failure.html"));
});
app.get("/pending", (req, res) => {
  res.sendFile(path.join(__dirname, "pending.html"));
});

// 🚀 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});