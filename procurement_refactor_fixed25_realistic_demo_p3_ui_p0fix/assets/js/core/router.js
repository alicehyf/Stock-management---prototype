/*
  Tiny hash router for the single-page prototype
  Classic script (no ES-module imports) so it works on file://
*/
(function(){
  function createRouter(opts){
    const appEl = opts.appEl;
    const routes = opts.routes;

    function normalize(hash){
      const h = (hash || '').trim();
      if (!h || h === '#') return '#/procurement/overview';
      if (h.startsWith('#/')) return h;
      if (h.startsWith('#')) return '#/procurement/overview';
      return '#/procurement/overview';
    }

    function resolveRoute(key){
      // Exact match first
      if (routes[key]) return routes[key];

      // Prefix match (supports nested routes like:
      //  - #/inventory/ingredients/anise-star
      //  - #/procurement/pr/PR-12345
      //  - #/procurement/po/PO-12345
      // Find the longest matching route key.
      let best = null;
      let bestLen = -1;
      Object.keys(routes).forEach(rk => {
        if (key === rk) return;
        if (key.startsWith(rk + '/')){
          if (rk.length > bestLen){
            best = routes[rk];
            bestLen = rk.length;
          }
        }
      });

      return best || routes['#/procurement/overview'];
    }

    function render(){
      const key = normalize(window.location.hash);
      const route = resolveRoute(key);
      if (!route || !appEl) return;

      try {
        appEl.innerHTML = route.render ? route.render() : '';
        // init may be sync or async
        const maybePromise = route.init ? route.init() : null;
        Promise.resolve(maybePromise).finally(() => {
          window.UI?.setActiveNav?.();
          // Scroll to top of content when navigating
          const content = document.querySelector('.content');
          if (content && typeof content.scrollTo === 'function') content.scrollTo(0,0);
          window.scrollTo(0,0);
        });
      } catch (e){
        console.error(e);
        appEl.innerHTML = '<div class="card" style="padding:16px"><b>Render error</b><div style="margin-top:8px;color:#6b7280">Check console for details.</div></div>';
      }
    }

    window.addEventListener('hashchange', render);
    return { render, navigate: (hash)=>{ window.location.hash = normalize(hash); } };
  }

  window.Router = window.Router || {};
  window.Router.createRouter = createRouter;
})();
