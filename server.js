const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mercadopago = require("mercadopago");

const app = express();
const PORT = 3000;
const PRODUCTOS_JSON = path.join(__dirname, "productos.json");

// 🛠️ Configuración MercadoPago
mercadopago.configure({
  access_token: "APP_USR-3186139234601513-040117-0c97fa3ec4cb9f1758644716553619e5-2366703718"
});

// 🖼️ Configuración de subida de imágenes
const storage = multer.diskStorage({
  destination: "assets/img",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = Date.now() + "-" + Math.round(Math.random() * 1E9) + ext;
    cb(null, nombre);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (tiposPermitidos.test(ext) && tiposPermitidos.test(mime)) {
    cb(null, true);
  } else {
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
    error.message = "⚠️ Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o GIF.";
    cb(error); // Pasar el error al callback
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
});

// 📂 Archivos estáticos
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(__dirname));
app.use(express.json());

// 📁 Obtener productos
app.get("/api/productos", (req, res) => {
  fs.readFile("productos.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error al leer productos" });
    const productos = JSON.parse(data || "[]");
    res.json(productos);
  });
});

// ➕ Crear producto
app.post("/api/productos", (req, res) => {
  upload.single("imagen")(req, res, (err) => {
    console.error("Error de Multer:", err); // Log del error en el servidor
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "❗ Tamaño de archivo muy grande. Límite: 2 MB." });
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: err.message });
      } else {
        return res.status(400).json({ error: "Error de carga: " + err.message });
      }
    } else if (err) {
      return res.status(400).json({ error: "Error desconocido al subir la imagen." });
    }

    // Si no hubo errores, seguimos con la lógica normal
    const { titulo, precio, editar, index } = req.body;
    const imagen = req.file ? `/assets/img/${req.file.filename}` : null;

    fs.readFile("productos.json", "utf-8", (err, data) => {
      const productos = !err && data ? JSON.parse(data) : [];

      if (editar === "true" && index !== undefined && productos[index]) {
        productos[index].titulo = titulo;
        productos[index].precio = Number(precio);
        if (imagen) productos[index].imagen = imagen;

        fs.writeFile("productos.json", JSON.stringify(productos, null, 2), err => {
          if (err) return res.status(500).json({ error: "Error al guardar producto editado" });
          return res.json({ message: "Producto editado correctamente" });
        });

      } else {
        const nuevoProducto = {
          titulo,
          precio: Number(precio),
          imagen: imagen || ""
        };

        productos.push(nuevoProducto);

        fs.writeFile("productos.json", JSON.stringify(productos, null, 2), err => {
          if (err) return res.status(500).json({ error: "Error al guardar producto nuevo" });
          return res.json({ message: "Producto agregado correctamente" });
        });
      }
    });
  });
});

// ✏️ Editar producto (sin cambios significativos para este problema)
app.put("/api/productos/:index", upload.single("imagen"), (req, res) => {
  const { index } = req.params;
  const { titulo, precio } = req.body;

  fs.readFile("productos.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error al leer" });
    const productos = JSON.parse(data);
    if (!productos[index]) return res.status(404).json({ error: "No encontrado" });

    productos[index].titulo = titulo;
    productos[index].precio = Number(precio);

    if (req.file) {
      productos[index].imagen = `/assets/img/${req.file.filename}`;
    }

    fs.writeFile("productos.json", JSON.stringify(productos, null, 2), err => {
      if (err) return res.status(500).json({ error: "Error al guardar" });
      res.json({ message: "Producto editado" });
    });
  });
});

// 🗑️ Eliminar producto (sin cambios significativos para este problema)
app.delete("/api/productos/:index", (req, res) => {
  const { index } = req.params;

  fs.readFile("productos.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error al leer" });
    const productos = JSON.parse(data);
    if (!productos[index]) return res.status(404).json({ error: "No encontrado" });

    const productoEliminado = productos.splice(index, 1)[0];

    if (productoEliminado.imagen && productoEliminado.imagen.startsWith("/assets/img/")) {
      const rutaImagen = path.join(__dirname, productoEliminado.imagen);
      fs.unlink(rutaImagen, (err) => {
        if (err) console.error("No se pudo eliminar la imagen:", err.message);
      });
    }

    fs.writeFile("productos.json", JSON.stringify(productos, null, 2), err => {
      if (err) return res.status(500).json({ error: "Error al guardar" });
      res.json({ message: "Producto eliminado" });
    });
  });
});

// 🛒 Checkout con MercadoPago (sin cambios significativos para este problema)
let carrito = [];

app.post("/cart/add", (req, res) => {
  const { id_producto, cantidad, precio } = req.body;
  carrito.push({ id_producto, cantidad, precio });
  res.json({ message: "Producto añadido", carrito });
});

app.post("/checkout", async (req, res) => {
  const carritoCliente = req.body.carrito;

  try {
    const preference = {
      items: carritoCliente.map(p => ({
        title: p.titulo,
        unit_price: Number(p.precio),
        quantity: p.cantidad
      })),
      back_urls: {
        success: "http://localhost:3000/success",
        failure: "http://localhost:3000/failure",
        pending: "http://localhost:3000/pending"
      },
    };
    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "No se pudo iniciar el pago" });
  }
});

app.post("/api/productos/ordenar", (req, res) => {
  const nuevosProductos = req.body;

  fs.writeFile(PRODUCTOS_JSON, JSON.stringify(nuevosProductos, null, 2), err => {
    if(err) {
      return res.status(500).json({ error: "Error al guardar productos" });
    }
    res.json({ ok: true });
  });
});


// ▶️ Inicio del servidor (sin cambios significativos para este problema)
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});