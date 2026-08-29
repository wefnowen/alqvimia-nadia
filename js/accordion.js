"use strict";

/* ================= ACCORDION ================= */
(function(){
  document.querySelectorAll('.cat-head').forEach(function(head){
    head.addEventListener('click', function(){
      var cat = head.closest('.cat');
      var body = cat.querySelector('.cat-body');
      var isOpen = cat.classList.contains('open');
      if(isOpen){
        cat.classList.remove('open');
        body.style.maxHeight = 0;
      } else {
        cat.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
  window.addEventListener('resize', function(){
    document.querySelectorAll('.cat.open .cat-body').forEach(function(b){ b.style.maxHeight = b.scrollHeight + 'px'; });
  });
})();
