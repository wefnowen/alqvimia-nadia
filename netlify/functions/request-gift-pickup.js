// La clienta, tras pagar, pide recoger la tarjeta regalo ya impresa en el centro.
// Comprueba en Stripe que la sesión está pagada y envía al centro un email
// "RECOGER EN CENTRO" con todos los datos para que la preparen (solo una vez por compra).

var gift = require('../lib/gift-email');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'STRIPE_SECRET_KEY no configurada en el servidor' }) };
  }

  var sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Falta session_id' }) };
  }

  var session = await gift.getSession(sessionId);
  if (!session || session.payment_status !== 'paid') {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Pago no confirmado' }) };
  }

  if ((session.metadata || {}).pickupRequested === 'si') {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  var sent = await gift.sendGiftEmail(gift.saleFromSession(session), 'pickup');
  if (!sent) {
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'No se pudo enviar el aviso' }) };
  }
  await gift.markSession(sessionId, 'pickupRequested');
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
