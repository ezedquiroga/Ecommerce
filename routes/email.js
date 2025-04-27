// routes/email.js

const nodemailer = require("nodemailer");

// 📌 Configurar el transporte SMTP con Mailtrap
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "53a11536268c12",
    pass: "1c5a2fc98965a7"
  }
});

// 📧 Función para enviar correos
async function enviarEmails(carrito, compradorEmail, idTransaccion) {
  try {
    // Construir lista de productos comprados
    const listaProductos = carrito
      .map(p => `• ${p.titulo} (Precio: $${p.precio}, Cantidad: ${p.cantidad})`)
      .join("\n");

    // Mail al vendedor
    await transporter.sendMail({
      from: '"Tienda Kundalini" <no-reply@kundalini.com>',
      to: "ezedaqui@gmail.com", // Tu correo como vendedor
      subject: `Nueva compra recibida - Transacción ${idTransaccion}`,
      text: `Se ha realizado una nueva compra.\n\nProductos:\n${listaProductos}\n\nComprador: ${compradorEmail}`,
    });

    // Mail al comprador
    await transporter.sendMail({
      from: '"Tienda Kundalini" <no-reply@kundalini.com>',
      to: compradorEmail,
      subject: "Gracias por tu compra - Tienda Kundalini",
      text: `Gracias por tu compra en Kundalini.\n\nProductos adquiridos:\n${listaProductos}\n\nNúmero de transacción: ${idTransaccion}\n\n¡Te esperamos nuevamente!`,
    });

  } catch (error) {
    console.error("Error enviando emails:", error);
  }
}

module.exports = { enviarEmails };