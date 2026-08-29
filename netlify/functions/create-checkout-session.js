// Crea una sesión de pago de Stripe Checkout para la tarjeta regalo.
// No usa el SDK de Stripe (evita npm install): llama directamente a su API REST con fetch.
// Requiere la variable de entorno STRIPE_SECRET_KEY configurada en Netlify (Site settings > Environment variables).

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  var STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'STRIPE_SECRET_KEY no configurada en el servidor' }) };
  }

  var data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  var center = data.center === 'nadia' ? 'nadia' : 'alqvimia';
  var amountCents = Math.round(Number(data.amountCents));
  var treatmentLabel = String(data.treatmentLabel || '').slice(0, 200);
  var buyerName = String(data.buyerName || '').trim().slice(0, 200);
  var buyerEmail = String(data.buyerEmail || '').trim().slice(0, 200);
  var recipientName = String(data.recipientName || '').trim().slice(0, 200);
  var message = String(data.message || '').trim().slice(0, 300);

  if (!amountCents || amountCents < 2000 || amountCents > 100000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Importe no válido (mínimo 20€, máximo 1000€)' }) };
  }
  if (!buyerName || !/\S+@\S+\.\S+/.test(buyerEmail)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Datos de comprador inválidos' }) };
  }

  var code = (center === 'alqvimia' ? 'ALQ-' : 'NAD-') + Math.random().toString(36).slice(2, 8).toUpperCase();
  var siteUrl = process.env.URL || 'http://localhost:8888';

  var params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', siteUrl + '/index.html?gift_session={CHECKOUT_SESSION_ID}#regalo');
  params.append('cancel_url', siteUrl + '/index.html#regalo');
  params.append('customer_email', buyerEmail);
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'eur');
  params.append('line_items[0][price_data][unit_amount]', String(amountCents));
  params.append('line_items[0][price_data][product_data][name]', 'Tarjeta regalo · ' + treatmentLabel);
  params.append('metadata[center]', center);
  params.append('metadata[treatmentLabel]', treatmentLabel);
  params.append('metadata[buyerName]', buyerName);
  params.append('metadata[recipientName]', recipientName);
  params.append('metadata[message]', message);
  params.append('metadata[code]', code);

  var resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });
  var session = await resp.json();

  if (!resp.ok) {
    return { statusCode: 500, body: JSON.stringify({ error: (session.error && session.error.message) || 'Error de Stripe' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
};
