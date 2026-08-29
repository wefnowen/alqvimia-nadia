"use strict";

/* ================= SERVICIOS / PRECIOS: CENTER TABS ================= */
(function(){
  document.querySelectorAll('.center-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      var group = tab.closest('.svc-tabgroup') || document;
      group.querySelectorAll('.center-tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var center = tab.dataset.center;
      group.querySelectorAll('.svc-panel').forEach(function(p){ p.classList.remove('active'); });
      var targetPanel = group.querySelector('.svc-panel[data-panel="' + center + '"]');
      if(targetPanel) targetPanel.classList.add('active');
    });
  });
})();
