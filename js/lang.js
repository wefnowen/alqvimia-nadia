"use strict";

window.App = window.App || {};

/* ================= LANGUAGE ================= */
(function(){
  var htmlEl = document.documentElement;
  function setLang(lang){
    htmlEl.dataset.lang = lang;
    document.querySelectorAll('.lang-toggle button').forEach(function(b){
      b.classList.toggle('active', b.dataset.setLang === lang);
    });
    try { localStorage.setItem('lang', lang); } catch(e){}
  }
  document.querySelectorAll('[data-set-lang]').forEach(function(btn){
    btn.addEventListener('click', function(){ setLang(btn.dataset.setLang); });
  });

  var savedLang = null;
  try { savedLang = localStorage.getItem('lang'); } catch(e){}
  if(savedLang === 'es' || savedLang === 'ca'){ setLang(savedLang); }

  App.htmlEl = htmlEl;
  App.setLang = setLang;
})();
