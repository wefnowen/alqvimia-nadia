"use strict";

/* ================= TARJETA REGALO ================= */
/* Depende de: App.currentLang (whatsapp.js) */
(function(){

  var CENTER_LABEL = { alqvimia:'Alqvimia', nadia:'Nadia Elcacho' };
  var CUSTOM_VALUE = '__custom__';

  var giftStep = 1;
  var TOTAL_STEPS = 4;
  var giftAnswers = { centro:null, treatmentLabel:null, amountCents:null, isCustom:false };

  var form = document.getElementById('gift-form');
  if(!form) return; // página de regalo no presente en esta build

  var backBtn = document.getElementById('gift-back');
  var nextBtn = document.getElementById('gift-next');
  var payBtn = document.getElementById('gift-pay');
  var navRow = document.querySelector('.gift-nav');
  var errorEl = document.getElementById('gift-error');

  /* ---------- extracción de precios reales desde la página de Precios ---------- */
  function i18nText(el, lang){
    var other = lang === 'ca' ? 'es' : 'ca';
    var clone = el.cloneNode(true);
    clone.querySelectorAll('.i18n-' + other).forEach(function(n){ n.remove(); });
    return clone.textContent.replace(/\s+/g,' ').trim();
  }
  function rowText(scope, selector, lang){
    var el = scope.querySelector(selector + '.i18n-' + lang) || scope.querySelector(selector);
    return el ? i18nText(el, lang) : '';
  }
  function parsePriceToCents(text){
    text = (text || '').replace(/\s+/g,' ').trim();
    if(/\d\s*[\/–-]\s*\d/.test(text)) return null; // rangos: 70/80€, 10–13€
    var m = text.match(/(\d+)(?:[.,](\d+))?\s*€/);
    if(!m) return null;
    var euros = parseInt(m[1], 10);
    var centsStr = m[2] ? (m[2] + '00').slice(0,2) : '00';
    return euros * 100 + parseInt(centsStr, 10);
  }
  function getTreatmentGroups(center){
    var panel = document.getElementById('precios-panel-' + center);
    if(!panel) return [];
    var lang = App.currentLang();
    var groups = [];
    panel.querySelectorAll('.cat').forEach(function(cat){
      var catName = rowText(cat, 'h4', lang);
      var items = [];
      cat.querySelectorAll('.svc-row').forEach(function(row){
        var cents = parsePriceToCents(rowText(row, '.svc-price', lang));
        if(cents === null) return;
        var name = rowText(row, '.svc-name', lang);
        if(!name) return;
        items.push({ name: name, cents: cents });
      });
      if(items.length) groups.push({ category: catName, items: items });
    });
    return groups;
  }

  var select = document.getElementById('gift-treatment-select');
  var amountField = document.getElementById('gift-amount-field');
  var amountInput = document.getElementById('gift-amount-input');

  function buildTreatmentSelect(center){
    var lang = App.currentLang();
    var groups = getTreatmentGroups(center);
    var html = '<option value="">' + (lang === 'ca' ? 'Selecciona…' : 'Selecciona…') + '</option>';
    groups.forEach(function(g){
      html += '<optgroup label="' + g.category.replace(/"/g,'') + '">';
      g.items.forEach(function(it, i){
        html += '<option value="' + g.category.replace(/"/g,'&quot;') + '|' + i + '" data-cents="' + it.cents + '" data-name="' + it.name.replace(/"/g,'&quot;') + '">' +
          it.name + ' — ' + (it.cents/100).toFixed(2).replace('.00','').replace('.', ',') + '€</option>';
      });
      html += '</optgroup>';
    });
    html += '<option value="' + CUSTOM_VALUE + '">' + (lang === 'ca' ? 'Import personalitzat' : 'Importe personalizado') + '</option>';
    select.innerHTML = html;
  }

  select.addEventListener('change', function(){
    var isCustom = select.value === CUSTOM_VALUE;
    amountField.style.display = isCustom ? '' : 'none';
    updateNextEnabled();
  });
  amountInput.addEventListener('input', updateNextEnabled);

  /* ---------- navegación entre pasos ---------- */
  function updateGiftProgress(){
    document.querySelectorAll('.gift-progress i').forEach(function(i){
      i.classList.toggle('done', Number(i.dataset.step) <= giftStep);
    });
  }

  function currentStepValid(){
    if(giftStep === 2){
      return !!form.querySelector('.gift-step[data-step="2"] .q-option.selected');
    }
    if(giftStep === 3){
      if(select.value === '') return false;
      if(select.value === CUSTOM_VALUE){
        var v = parseFloat(amountInput.value);
        return !isNaN(v) && v >= 20;
      }
      return true;
    }
    if(giftStep === 4){
      var name = document.getElementById('gift-buyer-name').value.trim();
      var email = document.getElementById('gift-buyer-email').value.trim();
      return !!name && /\S+@\S+\.\S+/.test(email);
    }
    return true;
  }
  function updateNextEnabled(){
    nextBtn.disabled = !currentStepValid();
    payBtn.disabled = !currentStepValid();
  }

  function showGiftStep(n){
    document.querySelectorAll('.gift-step').forEach(function(s){ s.classList.toggle('active', Number(s.dataset.step) === n); });
    navRow.style.display = n === 1 ? 'none' : 'flex';
    backBtn.style.visibility = n <= 2 ? 'hidden' : 'visible';
    nextBtn.style.display = n === 4 ? 'none' : '';
    payBtn.style.display = n === 4 ? '' : 'none';
    updateGiftProgress();
    updateNextEnabled();
  }

  form.querySelector('.gift-next-btn').addEventListener('click', function(){
    giftStep = 2;
    showGiftStep(giftStep);
  });

  form.querySelectorAll('.gift-step[data-step="2"] .q-option').forEach(function(opt){
    opt.addEventListener('click', function(){
      form.querySelectorAll('.gift-step[data-step="2"] .q-option').forEach(function(o){ o.classList.remove('selected'); });
      opt.classList.add('selected');
      giftAnswers.centro = opt.dataset.v;
      updateNextEnabled();
    });
  });

  nextBtn.addEventListener('click', function(){
    if(!currentStepValid()) return;
    if(giftStep === 2){
      buildTreatmentSelect(giftAnswers.centro);
      select.value = '';
      amountField.style.display = 'none';
    }
    if(giftStep === 3){
      if(select.value === CUSTOM_VALUE){
        giftAnswers.isCustom = true;
        giftAnswers.amountCents = Math.round(parseFloat(amountInput.value) * 100);
        giftAnswers.treatmentLabel = App.currentLang() === 'ca' ? 'Import personalitzat' : 'Importe personalizado';
      } else {
        var opt = select.selectedOptions[0];
        giftAnswers.isCustom = false;
        giftAnswers.amountCents = Number(opt.dataset.cents);
        giftAnswers.treatmentLabel = opt.dataset.name;
      }
      renderSummary();
    }
    if(giftStep < TOTAL_STEPS){ giftStep++; showGiftStep(giftStep); }
  });

  backBtn.addEventListener('click', function(){
    if(giftStep > 1){ giftStep--; showGiftStep(giftStep); }
  });

  ['gift-buyer-name','gift-buyer-email'].forEach(function(id){
    document.getElementById(id).addEventListener('input', updateNextEnabled);
  });

  function renderSummary(){
    var lang = App.currentLang();
    var euros = (giftAnswers.amountCents/100).toFixed(2).replace('.00','');
    var summary = document.getElementById('gift-summary');
    summary.innerHTML =
      '<div><strong>' + CENTER_LABEL[giftAnswers.centro] + '</strong></div>' +
      '<div>' + giftAnswers.treatmentLabel + '</div>' +
      '<div style="font-family:var(--serif);font-size:1.2rem;color:var(--gold-deep);margin-top:4px">' + euros + '€</div>';
    payBtn.innerHTML = '<span>' + (lang === 'ca' ? 'Pagar ' : 'Pagar ') + euros + '€</span>';
  }

  /* ---------- pago (Stripe Checkout vía función serverless) ---------- */
  payBtn.addEventListener('click', function(){
    if(!currentStepValid()) return;
    payBtn.disabled = true;
    errorEl.textContent = '';
    var payload = {
      center: giftAnswers.centro,
      treatmentLabel: giftAnswers.treatmentLabel,
      amountCents: giftAnswers.amountCents,
      buyerName: document.getElementById('gift-buyer-name').value.trim(),
      buyerEmail: document.getElementById('gift-buyer-email').value.trim(),
      recipientName: document.getElementById('gift-recipient-name').value.trim(),
      message: document.getElementById('gift-message').value.trim()
    };
    fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r){ return r.json(); }).then(function(data){
      if(data && data.url){
        window.location.href = data.url;
      } else {
        throw new Error(data && data.error ? data.error : 'unknown');
      }
    }).catch(function(){
      var lang = App.currentLang();
      errorEl.textContent = lang === 'ca'
        ? 'No hem pogut iniciar el pagament. Torna-ho a provar o escriu-nos per WhatsApp.'
        : 'No hemos podido iniciar el pago. Inténtalo de nuevo o escríbenos por WhatsApp.';
      payBtn.disabled = false;
    });
  });

  showGiftStep(1);

  /* ---------- retorno desde Stripe: verificar pago y mostrar la tarjeta ---------- */
  var sessionId = new URLSearchParams(location.search).get('gift_session');
  if(sessionId){
    fetch('/.netlify/functions/verify-gift-session?session_id=' + encodeURIComponent(sessionId))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && data.paid){ renderGiftCard(data); }
        else { showGiftError(); }
      })
      .catch(showGiftError);
  }

  function showGiftError(){
    document.getElementById('gift-result-error').classList.add('active');
    document.getElementById('gift-result-error').scrollIntoView({behavior:'smooth', block:'start'});
  }

  function renderGiftCard(data){
    var lang = App.currentLang();
    document.querySelector('.gift-wrap > form').style.display = 'none';
    document.querySelector('.gift-progress').style.display = 'none';
    var euros = (data.amountCents/100).toFixed(2).replace('.00','');
    var recipient = data.recipientName || (lang === 'ca' ? 'Per a tu' : 'Para ti');
    var html =
      '<div class="gc-top">' +
        '<span class="gc-brand">Alqvimia · Nadia Elcacho</span>' +
        '<div style="text-align:right"><span class="gc-label">' + (lang === 'ca' ? 'Vàlida a' : 'Válida en') + '</span><br><strong>' + CENTER_LABEL[data.center] + '</strong></div>' +
      '</div>' +
      '<div class="gc-mid">' +
        '<span class="gc-label">' + (lang === 'ca' ? 'Targeta regal' : 'Tarjeta regalo') + '</span>' +
        '<div class="gc-value">' + data.treatmentLabel + ' · ' + euros + '€</div>' +
        '<div class="gc-to">' + (lang === 'ca' ? 'Per a' : 'Para') + '<strong>' + recipient + '</strong></div>' +
        (data.message ? '<div class="gc-msg">“' + data.message + '”</div>' : '') +
      '</div>' +
      '<div class="gc-bottom">' +
        '<span class="gc-code">' + data.code + '</span>' +
        '<span class="gc-centers">Carrer Vallcalent 33 · Av. de Madrid 32<br>Lleida</span>' +
      '</div>';
    document.getElementById('gift-card-render').innerHTML = html;
    var resultEl = document.getElementById('gift-result');
    resultEl.classList.add('active');
    resultEl.scrollIntoView({behavior:'smooth', block:'start'});
  }

  document.getElementById('gift-download-btn').addEventListener('click', function(){
    window.print();
  });

})();
