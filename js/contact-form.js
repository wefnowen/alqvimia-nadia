"use strict";

/* ================= CONTACT FORM -> WHATSAPP ================= */
/* Depende de: App.currentLang, App.openWhatsapp (whatsapp.js) */
(function(){
  document.getElementById('contact-form').addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('cf-name').value.trim();
    var phone = document.getElementById('cf-phone').value.trim();
    var center = document.getElementById('cf-center').value;
    var treatment = document.getElementById('cf-treatment').value.trim();
    var message = document.getElementById('cf-message').value.trim();
    var lang = App.currentLang();

    if(!name || !phone || !center){
      var status = document.getElementById('cf-status');
      status.textContent = lang === 'ca' ? 'Omple els camps obligatoris (*) abans d’enviar.' : 'Rellena los campos obligatorios (*) antes de enviar.';
      status.style.color = '#B4483A';
      status.classList.add('show');
      return;
    }

    var lines = lang === 'ca'
      ? ['Hola! Us escric des de la web.', 'Nom: ' + name, 'Telèfon: ' + phone]
      : ['¡Hola! Os escribo desde la web.', 'Nombre: ' + name, 'Teléfono: ' + phone];
    if(treatment){ lines.push((lang==='ca'?'Tractament d’interès: ':'Tratamiento de interés: ') + treatment); }
    if(message){ lines.push((lang==='ca'?'Missatge: ':'Mensaje: ') + message); }
    var text = lines.join('\n');

    var targetCenter = center === 'cualquiera' ? 'alqvimia' : center;
    App.openWhatsapp(targetCenter, null, text);

    var status = document.getElementById('cf-status');
    status.textContent = lang === 'ca' ? 'S’ha obert el WhatsApp amb el teu missatge llest per enviar.' : 'Se ha abierto WhatsApp con tu mensaje listo para enviar.';
    status.style.color = '#3E6B54';
    status.classList.add('show');
  });
})();
