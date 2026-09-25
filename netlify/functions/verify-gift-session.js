// Verifica contra la API de Stripe que una sesión de pago se completó de verdad
// antes de dejar que el navegador genere la tarjeta regalo descargable.
// Requiere la variable de entorno STRIPE_SECRET_KEY configurada en Netlify.
//
// Además, si hay una RESEND_API_KEY configurada, envía un email de aviso al
// centro con el tratamiento y el importe vendido, para no depender del email
// genérico de Stripe (que no indica qué se ha comprado).

var NOTIFY_EMAIL = 'alqvimia.nadia@gmail.com';
var CENTER_LABEL = { alqvimia: 'Alqvimia', nadia: 'Nadia Elcacho' };

exports.handler = async function (event) {
  var STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ paid: false, error: 'STRIPE_SECRET_KEY no configurada en el servidor' }) };
  }

  var sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ paid: false, error: 'Falta session_id' }) };
  }

  var resp = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
    headers: { Authorization: 'Bearer ' + STRIPE_SECRET_KEY }
  });
  var session = await resp.json();

  if (!resp.ok || session.payment_status !== 'paid') {
    return { statusCode: 200, body: JSON.stringify({ paid: false }) };
  }

  var meta = session.metadata || {};
  var result = {
    paid: true,
    center: meta.center,
    treatmentLabel: meta.treatmentLabel,
    amountCents: session.amount_total,
    buyerName: meta.buyerName,
    recipientName: meta.recipientName,
    message: meta.message,
    code: meta.code
  };

  await sendSaleNotification(result);

  return { statusCode: 200, body: JSON.stringify(result) };
};

async function sendSaleNotification(sale) {
  var RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return; // notificación por email desactivada hasta configurar la clave

  var euros = (sale.amountCents / 100).toFixed(2).replace('.00', '');
  var centerLabel = CENTER_LABEL[sale.center] || sale.center;

  var html =
    '<h2>Nueva venta de tarjeta regalo</h2>' +
    '<p><strong>Centro:</strong> ' + centerLabel + '</p>' +
    '<p><strong>Tratamiento:</strong> ' + escapeHtml(sale.treatmentLabel) + '</p>' +
    '<p><strong>Importe:</strong> ' + euros + '€</p>' +
    '<p><strong>Comprador/a:</strong> ' + escapeHtml(sale.buyerName) + '</p>' +
    (sale.recipientName ? '<p><strong>Destinatario/a:</strong> ' + escapeHtml(sale.recipientName) + '</p>' : '') +
    (sale.message ? '<p><strong>Mensaje:</strong> “' + escapeHtml(sale.message) + '”</p>' : '') +
    '<p><strong>Código:</strong> ' + escapeHtml(sale.code) + '</p>';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tarjeta regalo <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        subject: 'Venta de tarjeta regalo · ' + centerLabel + ' · ' + euros + '€',
        html: html
      })
    });
  } catch (e) {
    // No bloqueamos la respuesta al cliente si falla el envío del email.
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
