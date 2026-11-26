// Verifica contra la API de Stripe que una sesión de pago se completó de verdad
// antes de dejar que el navegador genere la tarjeta regalo descargable.
// La primera vez que se verifica una venta pagada, avisa al centro por email
// (con tratamiento e importe) y lo marca en Stripe para no repetir el aviso al recargar.
// Requiere STRIPE_SECRET_KEY y, para el email, RESEND_API_KEY en Netlify.

var gift = require('../lib/gift-email');

exports.handler = async function (event) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ paid: false, error: 'STRIPE_SECRET_KEY no configurada en el servidor' }) };
  }

  var sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ paid: false, error: 'Falta session_id' }) };
  }

  var session = await gift.getSession(sessionId);
  if (!session || session.payment_status !== 'paid') {
    return { statusCode: 200, body: JSON.stringify({ paid: false }) };
  }

  var sale = gift.saleFromSession(session);

  if ((session.metadata || {}).notified !== 'si') {
    var sent = await gift.sendGiftEmail(sale, 'sale');
    if (sent) await gift.markSession(sessionId, 'notified');
  }

  delete sale.buyerEmail;
  return { statusCode: 200, body: JSON.stringify(sale) };
};
