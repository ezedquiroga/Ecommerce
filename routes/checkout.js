const express = require("express");
const mercadopago = require("mercadopago");

const router = express.Router();

// 🛠️ Configuración MercadoPago
mercadopago.configure({
  access_token: "APP_USR-3186139234601513-040117-0c97fa3ec4cb9f1758644716553619e5-2366703718"
});

router.post("/checkout", async (req, res) => {
  const carritoCliente = req.body.carrito;

  try {
    const preference = {
      items: carritoCliente.map(p => ({
        title: p.titulo,
        unit_price: parseFloat(p.precio),
        quantity: Number(p.cantidad)
      })),
      back_urls: {
        success: "http://localhost:3000/success",
        failure: "http://localhost:3000/failure",
        pending: "http://localhost:3000/pending"
      }
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "No se pudo iniciar el pago" });
  }
});

module.exports = router;