const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// Ruta al archivo JSON
const archivoProductos = path.join(__dirname, "..", "productos.json");

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "assets/img"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];
    cb(null, tiposPermitidos.includes(file.mimetype));
  }
}).single("imagen");

// Cargar productos
router.get("/productos", (req, res) => {
  try {
    const productos = JSON.parse(fs.readFileSync(archivoProductos, "utf-8"));
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: "No se pudieron cargar los productos" });
  }
});

// Crear o editar producto
router.post("/productos", (req, res) => {
  upload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "El archivo es muy grande. Máximo 2MB." });
    } else if (err) {
      return res.status(400).json({ error: "Tipo de archivo no permitido (JPG, PNG, GIF)" });
    }

    const { modo, titulo, precio, id } = req.body;
    const index = Number(id);
    const productos = JSON.parse(fs.readFileSync(archivoProductos, "utf-8"));

    const producto = {
      titulo,
      precio: parseFloat(precio),
      imagen: req.file ? "assets/img/" + req.file.filename : productos[index]?.imagen
    };

    if (modo === "crear") {
      productos.push(producto);
    } else if (
      modo === "editar" &&
      !isNaN(index) &&
      index >= 0 &&
      index < productos.length
    ) {
      productos[index] = producto;
    } else {
      return res.status(400).json({ error: "ID inválido para editar" });
    }

    fs.writeFileSync(archivoProductos, JSON.stringify(productos, null, 2));
    res.json({ success: true });
  });
});

// Eliminar producto
router.delete("/productos/:id", (req, res) => {
  const productos = JSON.parse(fs.readFileSync(archivoProductos, "utf-8"));
  const id = Number(req.params.id);

  if (id >= 0 && id < productos.length) {
    productos.splice(id, 1);
    fs.writeFileSync(archivoProductos, JSON.stringify(productos, null, 2));
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "ID inválido para eliminar" });
  }
});

// Reordenar productos
router.post("/productos/ordenar", (req, res) => {
  const { desde, hasta } = req.body;
  const productos = JSON.parse(fs.readFileSync(archivoProductos, "utf-8"));

  if (
    desde >= 0 &&
    desde < productos.length &&
    hasta >= 0 &&
    hasta < productos.length &&
    desde !== hasta
  ) {
    const [mover] = productos.splice(desde, 1);
    productos.splice(hasta, 0, mover);
    fs.writeFileSync(archivoProductos, JSON.stringify(productos, null, 2));
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Parámetros de orden inválidos" });
  }
});

module.exports = router;