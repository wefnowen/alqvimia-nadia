"use strict";

/* ================= SKIN ADVISOR QUIZ ================= */
/* Depende de: App.currentLang, App.openWhatsapp (whatsapp.js) */
(function(){
  var QUIZ_TREATMENTS = {
    luminosidad: {
      nadia:    { name:{es:'Hidrafacial', ca:'Hidrafacial'}, price:'69€' },
      alqvimia: { name:{es:'Facial Radiance Glow', ca:'Facial Radiance Glow'}, price:'90€' }
    },
    tono: {
      nadia:    { name:{es:'Peeling químico', ca:'Peeling químic'}, price:'70/80€' },
      alqvimia: { name:{es:'Peeling ultrasónico', ca:'Peeling ultrasònic'}, price:'55€' }
    },
    firmeza: {
      nadia:    { name:{es:'Peeling + Dermapen', ca:'Peeling + Dermapen'}, price:'98€' },
      alqvimia: { name:{es:'Ritual Eternal Youth (pro-aging)', ca:'Ritual Eternal Youth (pro-aging)'}, price:'90–195€' }
    },
    acne: {
      nadia:    { name:{es:'Higiene facial', ca:'Higiene facial'}, price:'42€' },
      alqvimia: { name:{es:'Purificación facial', ca:'Purificació facial'}, price:'59€' }
    },
    relax: {
      nadia:    null,
      alqvimia: { name:{es:'Ritual Oasis de serenidad', ca:'Ritual Oasi de serenitat'}, price:'139€' }
    },
    manicura: {
      nadia:    { name:{es:'Semipermanente de manos', ca:'Semipermanent de mans'}, price:'35€' },
      alqvimia: null
    },
    cabello: {
      nadia:    null,
      alqvimia: { name:{es:'SPA Capilar — diagnóstico y ritual', ca:'SPA Capil·lar — diagnòstic i ritual'}, price:{es:'Consultar precio', ca:'Consultar preu'}, tbd:true }
    }
  };
  var OBJETIVO_TEXT = {
    luminosidad: {es:'Un tratamiento pensado para devolver luz e hidratación a la piel.', ca:'Un tractament pensat per retornar llum i hidratació a la pell.'},
    tono:        {es:'Actúa sobre el tono y las manchas de forma progresiva y segura.', ca:'Actua sobre el to i les taques de forma progressiva i segura.'},
    firmeza:     {es:'Estimula firmeza visible en rostro y contorno.', ca:'Estimula fermesa visible al rostre i contorn.'},
    acne:        {es:'Regula el exceso de sebo y calma las imperfecciones.', ca:'Regula l’excés de sèu i calma les imperfeccions.'},
    relax:       {es:'Una experiencia sensorial para desconectar de verdad.', ca:'Una experiència sensorial per desconnectar de debò.'},
    manicura:    {es:'Cuidado de precisión para tus manos.', ca:'Cura de precisió per a les teves mans.'},
    cabello:     {es:'Cuidado integral para el cuero cabelludo.', ca:'Cura integral per al cuir cabellut.'}
  };
  var PRODUCT_HINT = {
    luminosidad: {es:'un sérum iluminador de Inlab Professional', ca:'un sèrum il·luminador d’Inlab Professional'},
    tono:        {es:'un activo despigmentante de Inlab Professional', ca:'un actiu despigmentant d’Inlab Professional'},
    firmeza:     {es:'un elixir redensificante de Alqvimia', ca:'un elixir redensificant d’Alqvimia'},
    acne:        {es:'una fórmula reguladora de sebo de Inlab Professional', ca:'una fórmula reguladora de sèu d’Inlab Professional'},
    relax:       {es:'un aceite esencial de aromaterapia Alqvimia', ca:'un oli essencial d’aromateràpia Alqvimia'},
    manicura:    {es:'un tratamiento fortalecedor de uñas', ca:'un tractament enfortidor d’ungles'},
    cabello:     {es:'una línea capilar profesional (referencia a confirmar en cabina)', ca:'una línia capil·lar professional (referència a confirmar en cabina)'}
  };
  var AGE_HINT = {
    '18-25': {es:'Enfoque preventivo: cuidamos el equilibrio natural de tu piel.', ca:'Enfocament preventiu: cuidem l’equilibri natural de la teva pell.'},
    '26-35': {es:'Enfoque de mantenimiento activo, antes de los primeros signos visibles.', ca:'Enfocament de manteniment actiu, abans dels primers signes visibles.'},
    '36-45': {es:'Enfoque correctivo, con resultados visibles y progresivos.', ca:'Enfocament correctiu, amb resultats visibles i progressius.'},
    '46-55': {es:'Enfoque regenerador, combinando tecnología y activos de alta concentración.', ca:'Enfocament regenerador, combinant tecnologia i actius d’alta concentració.'},
    '56+':   {es:'Enfoque intensivo: firmeza, luminosidad y nutrición profunda.', ca:'Enfocament intensiu: fermesa, lluminositat i nutrició profunda.'}
  };
  var CENTER_LABEL = {
    alqvimia: {es:'Alqvimia', ca:'Alqvimia'},
    nadia: {es:'Nadia Elcacho', ca:'Nadia Elcacho'}
  };

  var quizAnswers = {};
  var quizStep = 1;
  var TOTAL_STEPS = 4;

  function updateQuizProgress(){
    document.querySelectorAll('.quiz-progress i').forEach(function(i){
      i.classList.toggle('done', Number(i.dataset.step) <= quizStep);
    });
  }
  function showQuizStep(n){
    document.querySelectorAll('.quiz-step').forEach(function(s){ s.classList.toggle('active', Number(s.dataset.step) === n); });
    document.getElementById('quiz-back').style.visibility = n === 1 ? 'hidden' : 'visible';
    var qKey = document.querySelector('.quiz-step[data-step="'+n+'"] .q-options').dataset.q;
    document.getElementById('quiz-next').disabled = !quizAnswers[qKey];
    updateQuizProgress();
  }
  document.querySelectorAll('.q-option').forEach(function(opt){
    opt.addEventListener('click', function(){
      var group = opt.closest('.q-options');
      group.querySelectorAll('.q-option').forEach(function(o){ o.classList.remove('selected'); });
      opt.classList.add('selected');
      quizAnswers[group.dataset.q] = opt.dataset.v;
      document.getElementById('quiz-next').disabled = false;
    });
  });
  document.getElementById('quiz-next').addEventListener('click', function(){
    if(quizStep < TOTAL_STEPS){ quizStep++; showQuizStep(quizStep); }
    else { renderQuizResult(); }
  });
  document.getElementById('quiz-back').addEventListener('click', function(){
    if(quizStep > 1){ quizStep--; showQuizStep(quizStep); }
  });
  document.getElementById('quiz-restart').addEventListener('click', function(){
    quizAnswers = {}; quizStep = 1;
    document.querySelectorAll('.q-option.selected').forEach(function(o){ o.classList.remove('selected'); });
    document.getElementById('quiz-form').style.display = '';
    document.getElementById('quiz-result').classList.remove('active');
    showQuizStep(1);
  });

  function pickResults(objetivo, centroPref){
    var order = centroPref === 'nadia' ? ['nadia','alqvimia'] : ['alqvimia','nadia'];
    var results = [];
    if(centroPref === 'cualquiera'){
      order.forEach(function(c){ if(QUIZ_TREATMENTS[objetivo][c]) results.push({center:c, redirected:false}); });
    } else {
      var chosen = order.find(function(c){ return QUIZ_TREATMENTS[objetivo][c]; });
      if(chosen) results.push({center:chosen, redirected: chosen !== centroPref});
    }
    return results;
  }

  function renderQuizResult(){
    var lang = App.currentLang();
    var objetivo = quizAnswers.objetivo, edad = quizAnswers.edad, centro = quizAnswers.centro;
    var results = pickResults(objetivo, centro);
    document.getElementById('quiz-form').style.display = 'none';
    var resultBox = document.getElementById('quiz-result');
    resultBox.classList.add('active');

    var title = lang === 'ca' ? 'La teva recomanació personalitzada' : 'Tu recomendación personalizada';
    document.getElementById('qr-title').textContent = title;

    var cardsHtml = '';
    var waLines = [];
    if(results.length === 0){
      cardsHtml += '<div class="result-card"><p>' + (lang==='ca'
        ? 'Aquesta combinació mereix una valoració presencial. Reserva una primera visita i dissenyem el teu protocol a mida.'
        : 'Esta combinación merece una valoración presencial. Reserva una primera visita y diseñamos tu protocolo a medida.') + '</p></div>';
    } else {
      results.forEach(function(r){
        var t = QUIZ_TREATMENTS[objetivo][r.center];
        var priceText = typeof t.price === 'string' ? t.price : t.price[lang];
        var centerLabel = CENTER_LABEL[r.center][lang];
        var reasonText = OBJETIVO_TEXT[objetivo][lang];
        var redirectNote = r.redirected ? ('<p style="margin-top:8px;font-size:.8rem;color:var(--sage)">' + (lang==='ca'
          ? 'Aquest objectiu es cobreix millor a ' + centerLabel + '.' : 'Este objetivo se cubre mejor en ' + centerLabel + '.') + '</p>') : '';
        cardsHtml += '<div class="result-card">' +
          '<span class="rc-label">' + centerLabel + '</span>' +
          '<h4>' + t.name[lang] + '</h4>' +
          '<p>' + reasonText + '</p>' +
          redirectNote +
          '<div class="result-price">' + priceText + '</div>' +
          '</div>';
        if(!t.tbd) waLines.push(t.name[lang]);
      });
      var ageHint = AGE_HINT[edad] ? AGE_HINT[edad][lang] : '';
      var productHint = PRODUCT_HINT[objetivo] ? PRODUCT_HINT[objetivo][lang] : '';
      cardsHtml += '<p style="font-size:.88rem;color:var(--ink-soft);margin-top:18px;line-height:1.7">' + ageHint +
        (productHint ? (' ' + (lang==='ca' ? 'Per reforçar el resultat a casa, en cabina et recomanem ' : 'Para reforzar el resultado en casa, en cabina te recomendamos ') + productHint + '.') : '') +
        '</p>';
    }
    document.getElementById('qr-cards').innerHTML = cardsHtml;

    var waBtn = document.getElementById('qr-wa-btn');
    var waCenter = results.length ? results[0].center : (centro === 'nadia' ? 'nadia' : 'alqvimia');
    var waText = waLines.length
      ? (lang === 'ca'
          ? 'Hola, he fet el test de pell a la web i m’han recomanat: ' + waLines.join(' + ') + '. M’agradaria reservar cita.'
          : 'Hola, he hecho el test de piel en la web y me han recomendado: ' + waLines.join(' + ') + '. Me gustaría reservar cita.')
      : (lang === 'ca' ? 'Hola, he fet el test de pell a la web. M’agradaria una valoració personalitzada.' : 'Hola, he hecho el test de piel en la web. Me gustaría una valoración personalizada.');
    waBtn.onclick = function(){ App.openWhatsapp(waCenter, null, waText); };

    resultBox.scrollIntoView({behavior:'smooth', block:'start'});
  }
  showQuizStep(1);
})();
