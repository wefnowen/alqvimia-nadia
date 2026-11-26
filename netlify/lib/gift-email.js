// Utilidades compartidas por las funciones de la tarjeta regalo:
// leer la sesión de Stripe, marcarla y enviar los avisos por email al centro (Resend).

var NOTIFY_EMAIL = 'alqvimia.nadia@gmail.com';
var CENTER_LABEL = { alqvimia: 'Alqvimia', nadia: 'Nadia Elcacho' };

async function getSession(sessionId) {
  var resp = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
    headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY }
  });
  if (!resp.ok) return null;
  return resp.json();
}

// Guarda una marca en los metadatos de la sesión para no repetir el mismo aviso.
async function markSession(sessionId, key) {
  var params = new URLSearchParams();
  params.append('metadata[' + key + ']', 'si');
  await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });
}

function saleFromSession(session) {
  var meta = session.metadata || {};
  return {
    paid: true,
    center: meta.center,
    treatmentLabel: meta.treatmentLabel,
    amountCents: session.amount_total,
    buyerName: meta.buyerName,
    buyerEmail: session.customer_details && session.customer_details.email || session.customer_email || '',
    recipientName: meta.recipientName,
    message: meta.message,
    code: meta.code
  };
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// kind: 'sale' (nueva venta) o 'pickup' (la clienta pide recogerla impresa en el centro).
// Devuelve true si Resend aceptó el envío.
async function sendGiftEmail(sale, kind) {
  var RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return false;

  var euros = (sale.amountCents / 100).toFixed(2).replace('.00', '');
  var centerLabel = CENTER_LABEL[sale.center] || sale.center;
  var isPickup = kind === 'pickup';

  var heading = isPickup
    ? '<h2>Recoger en el centro: preparar tarjeta regalo impresa</h2>' +
      '<p>La clienta ha pedido recoger la tarjeta ya impresa en <strong>' + centerLabel + '</strong>. Déjala preparada con este código.</p>'
    : '<h2>Nueva venta de tarjeta regalo</h2>';

  var html =
    heading +
    '<p><strong>Centro:</strong> ' + centerLabel + '</p>' +
    '<p><strong>Tratamiento:</strong> ' + escapeHtml(sale.treatmentLabel) + '</p>' +
    '<p><strong>Importe:</strong> ' + euros + '€</p>' +
    '<p><strong>Comprador/a:</strong> ' + escapeHtml(sale.buyerName) +
      (sale.buyerEmail ? ' (' + escapeHtml(sale.buyerEmail) + ')' : '') + '</p>' +
    (sale.recipientName ? '<p><strong>Destinatario/a:</strong> ' + escapeHtml(sale.recipientName) + '</p>' : '') +
    (sale.message ? '<p><strong>Mensaje:</strong> “' + escapeHtml(sale.message) + '”</p>' : '') +
    '<p><strong>Código:</strong> ' + escapeHtml(sale.code) + '</p>';

  var subject = (isPickup ? 'RECOGER EN CENTRO · ' : 'Venta de tarjeta regalo · ') +
    centerLabel + ' · ' + euros + '€ · ' + sale.code;

  try {
    var resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tarjeta regalo <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        subject: subject,
        html: html
      })
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

module.exports = { getSession: getSession, markSession: markSession, saleFromSession: saleFromSession, sendGiftEmail: sendGiftEmail };
