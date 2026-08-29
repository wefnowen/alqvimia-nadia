"use strict";

window.App = window.App || {};

/* ================= PAGE NAVIGATION ================= */
/* Depende de: App.htmlEl (lang.js), App.closeMobileMenu (mobile-menu.js) */
(function(){
  var PAGES = ['inicio','servicios','precios','profesionales','asesor','opiniones','regalo','contacto'];
  function goToPage(id, opts){
    opts = opts || {};
    if(PAGES.indexOf(id) === -1) id = 'inicio';
    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
    var target = document.getElementById('page-' + id);
    if(target) target.classList.add('active');
    document.querySelectorAll('.page-tabs button[data-goto]').forEach(function(b){
      b.classList.toggle('active', b.dataset.goto === id);
    });
    document.querySelectorAll('#mobile-menu .mm-link[data-goto]').forEach(function(b){
      b.classList.toggle('active', b.dataset.goto === id);
    });
    App.htmlEl.dataset.page = id;
    if(!opts.silent){ history.replaceState(null, '', '#' + id); }
    window.scrollTo({top:0, behavior:'auto'});
    App.closeMobileMenu();
    requestAnimationFrame(function(){
      (target || document).querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
    });
  }
  document.querySelectorAll('[data-goto]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      goToPage(el.dataset.goto);
    });
  });
  window.addEventListener('popstate', function(){
    var id = location.hash.replace('#','') || 'inicio';
    goToPage(id, {silent:true});
  });
  goToPage(location.hash.replace('#','') || 'inicio', {silent:true});
})();
