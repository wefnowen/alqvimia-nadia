"use strict";

window.App = window.App || {};

/* ================= WHATSAPP ================= */
/* Depende de: App.htmlEl (lang.js), App.closeMobileMenu (mobile-menu.js) */
(function(){
  var WA_NUMBERS = { alqvimia:'34681200700', nadia:'34623024012' };
  var WA_MESSAGES = {
    generico: {
      es:'Hola, he visto vuestra web y me gustaría más información sobre vuestros tratamientos. ¿Podéis ayudarme?',
      ca:'Hola, he vist la vostra web i m’agradaria més informació sobre els vostres tractaments. Em podeu ajudar?'
    },
    alqvimia: {
      es:'Hola, os escribo desde la web. Me gustaría información sobre los servicios de Alqvimia (rituales, spa, SPA Capilar). ¿Podéis ayudarme?',
      ca:'Hola, us escric des de la web. M’agradaria informació sobre els serveis d’Alqvimia (rituals, spa, SPA Capil·lar). Em podeu ajudar?'
    },
    nadia: {
      es:'Hola, os escribo desde la web. Me interesa información sobre estética avanzada y manicura (Nadia Elcacho). ¿Podéis ayudarme?',
      ca:'Hola, us escric des de la web. M’interessa informació sobre estètica avançada i manicura (Nadia Elcacho). Em podeu ajudar?'
    },
    diagnostico: {
      es:'Hola, os escribo desde la web. Me gustaría pedir cita para el diagnóstico personalizado gratuito con el analizador de piel. ¿Podéis ayudarme?',
      ca:'Hola, us escric des de la web. M’agradaria demanar cita per al diagnòstic personalitzat gratuït amb l’analitzador de pell. Em podeu ajudar?'
    }
  };
  function currentLang(){ return App.htmlEl.dataset.lang === 'ca' ? 'ca' : 'es'; }
  function openWhatsapp(centerKey, msgKey, customText){
    var number = WA_NUMBERS[centerKey] || WA_NUMBERS.alqvimia;
    var text = customText || (WA_MESSAGES[msgKey] && WA_MESSAGES[msgKey][currentLang()]) || WA_MESSAGES.generico[currentLang()];
    var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  }
  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-wa]');
    if(!btn) return;
    var center = btn.dataset.wa;
    if(center === 'both'){ toggleWaChoice(); return; }
    openWhatsapp(center, btn.dataset.waMsg, btn.dataset.waTextOverride);
  });

  var waFloat = document.getElementById('wa-float');
  var waChoice = document.getElementById('wa-choice');
  function toggleWaChoice(){ waChoice.classList.toggle('open'); }
  waFloat.addEventListener('click', toggleWaChoice);
  document.addEventListener('click', function(e){
    if(!waChoice.contains(e.target) && e.target !== waFloat && !waFloat.contains(e.target)){
      waChoice.classList.remove('open');
    }
  });
  document.getElementById('mm-wa-btn').addEventListener('click', function(){
    App.closeMobileMenu();
    setTimeout(function(){ waChoice.classList.add('open'); }, 400);
  });

  App.currentLang = currentLang;
  App.openWhatsapp = openWhatsapp;
})();
