/*
  App bootstrap (classic script)
  Renders pages into #app using hash routing.
*/
(function(){
  const UI = window.UI || {};
  const Router = window.Router || {};
  const Pages = window.Pages || {};

  UI.initSidebar && UI.initSidebar();
  UI.initHelpMenu && UI.initHelpMenu();

  // Default route
  if (!window.location.hash) window.location.hash = '#/procurement/overview';

  const appEl = document.getElementById('app');

  const routes = {
    '#/procurement/overview': Pages.overview,
    '#/procurement/approvals': Pages.approvals,
    '#/procurement/pr': Pages.pr,
    '#/procurement/po': Pages.po,
    '#/procurement/receiving': Pages.receiving,
    '#/procurement/bills': Pages.bills,
    '#/procurement/vendor-credits': Pages.vendorcredits,
    '#/procurement/suppliers': Pages.suppliers,
    '#/settings/permissions': Pages.settings,
    '#/settings/reorder-points': Pages.reorderpoints,
    '#/inventory/reorder-points': Pages.reorderpoints,
    '#/inventory/ingredients': Pages.ingredients,
    '#/inventory/stock-count': Pages.stockcount,
    '#/inventory/usage': Pages.usage
  };

  // Validate routes (helps debugging when someone deletes a JS file)
  Object.keys(routes).forEach(k => {
    if (!routes[k] || typeof routes[k].render !== 'function'){
      console.warn('Missing route module for', k);
      routes[k] = {
        render: () => `<div class="card" style="padding:16px">
            <div style="font-weight:700">Missing page module</div>
            <div class="muted" style="margin-top:6px">${k}</div>
          </div>`,
        init: () => {}
      };
    }
  });

  const router = Router.createRouter ? Router.createRouter({
    appEl,
    routes: Object.fromEntries(Object.entries(routes).map(([k,mod]) => [k,{ render: mod.render, init: mod.init }]))
  }) : null;

  if (!router){
    console.error('Router not loaded');
    return;
  }
  // Expose for pages that need a re-render (e.g., demo reset)
  window.RouterApp = router;
  router.render();

  // Make clicking top brand go to overview
  document.querySelector('.brand')?.addEventListener('click', (e)=>{ e.preventDefault(); window.location.hash = '#/procurement/overview'; });
})();
