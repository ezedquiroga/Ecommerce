const express = require("express");
const path = require("path");

const checkoutRoutes = require("./routes/checkout");
const productosRoutes = require("./routes/productos");

const app = express();
const PORT = 3000;

// 📂 Archivos estáticos
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(__dirname));
app.use(express.json());
app.use("/api", checkoutRoutes);
app.use("/api", productosRoutes);

// ▶️ Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});