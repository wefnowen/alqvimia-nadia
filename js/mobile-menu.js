"use strict";

window.App = window.App || {};

/* ================= MOBILE MENU ================= */
(function(){
  var mobileMenu = document.getElementById('mobile-menu');
  var burger = document.getElementById('burger-btn');
  function openMobileMenu(){ mobileMenu.classList.add('open'); burger.setAttribute('aria-expanded','true'); }
  function closeMobileMenu(){ mobileMenu.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
  burger.addEventListener('click', openMobileMenu);
  document.getElementById('mm-close').addEventListener('click', closeMobileMenu);

  App.closeMobileMenu = closeMobileMenu;
})();
