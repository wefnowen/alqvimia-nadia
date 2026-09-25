// Función temporal SOLO para probar el envío de email vía Resend, sin pasar por Stripe.
// Se borra en cuanto se confirme que la notificación llega correctamente.

exports.handler = async function () {
  var RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'RESEND_API_KEY no configurada' }) };
  }

  var html =
    '<h2>Prueba de notificación (sin pago real)</h2>' +
    '<p><strong>Centro:</strong> Alqvimia</p>' +
    '<p><strong>Tratamiento:</strong> Ritual reina de Egipto</p>' +
    '<p><strong>Importe:</strong> 139€</p>' +
    '<p><strong>Comprador/a:</strong> Prueba Claude</p>' +
    '<p><strong>Destinatario/a:</strong> Maria</p>' +
    '<p><strong>Código:</strong> ALQ-TEST01</p>';

  var resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Tarjeta regalo <onboarding@resend.dev>',
      to: 'alqvimia.nadia@gmail.com',
      subject: 'PRUEBA — Venta de tarjeta regalo · Alqvimia · 139€',
      html: html
    })
  });
  var data = await resp.json();
  return { statusCode: resp.status, body: JSON.stringify({ ok: resp.ok, data: data }) };
};
