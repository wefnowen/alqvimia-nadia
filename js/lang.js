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
  }
  document.querySelectorAll('[data-set-lang]').forEach(function(btn){
    btn.addEventListener('click', function(){ setLang(btn.dataset.setLang); });
  });

  App.htmlEl = htmlEl;
  App.setLang = setLang;
})();
