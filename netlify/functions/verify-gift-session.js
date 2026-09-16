// Verifica contra la API de Stripe que una sesión de pago se completó de verdad
// antes de dejar que el navegador genere la tarjeta regalo descargable.
// Requiere la variable de entorno STRIPE_SECRET_KEY configurada en Netlify.

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
  return {
    statusCode: 200,
    body: JSON.stringify({
      paid: true,
      center: meta.center,
      treatmentLabel: meta.treatmentLabel,
      amountCents: session.amount_total,
      buyerName: meta.buyerName,
      recipientName: meta.recipientName,
      message: meta.message,
      code: meta.code
    })
  };
};
