
(function(){
  function ensureHash(){
    if(!window.location.hash || window.location.hash==='#'){
      window.location.hash = '#/procurement/overview';
    }
  }

  function init(){
    ensureHash();
    UI.initSidebar();

    const appEl = document.getElementById('app');
    const routes = {
      '#/procurement/overview': Pages.overview,
      '#/procurement/approvals': Pages.approvals,
      '#/procurement/pr': Pages.pr,
      '#/procurement/pr/:id': Pages.pr,
      '#/procurement/po': Pages.po,
      '#/procurement/po/:id': Pages.po,
      '#/procurement/receiving': Pages.receiving,
      '#/procurement/receiving/:id': Pages.receiving,
      '#/procurement/bills': Pages.bills,
      '#/procurement/bills/:id': Pages.bills,
      '#/procurement/vendor-credits': Pages.vendorcredits,
      '#/procurement/suppliers': Pages.suppliers,
      '#/procurement/suppliers/:id/items': Pages.supplierItems,
      '#/inventory/ingredients': Pages.ingredients,
      '#/inventory/ingredients/:id': Pages.ingredients,
      '#/settings': Pages.settings
    };

    window.RouterApp = Router.createRouter({appEl, routes});
    window.RouterApp.render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
