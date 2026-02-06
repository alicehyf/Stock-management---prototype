/*
  Shared UI helpers (sidebar accordion, toast, nav active state)
  Classic script (no ES-module imports) so it works on file://
*/
(function(){
  function toast(msg){
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(()=> el.classList.add('show'));
    setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(), 250); }, 2600);
  }

  function initSidebar(){
    // Avoid double-binding
    if (document.body.dataset.sidebarInit === '1') return;
    document.body.dataset.sidebarInit = '1';

    document.querySelectorAll('.menu-item[data-toggle]').forEach(item => {
      item.addEventListener('click', () => {
        const key = item.getAttribute('data-toggle');
        const submenu = document.querySelector('.submenu[data-submenu="'+key+'"]');
        if (!submenu) return;
        const isOpen = submenu.classList.contains('open');
        submenu.classList.toggle('open', !isOpen);
        item.classList.toggle('open', !isOpen);
      });
    });

    // Route clicks on submenu links
    document.querySelectorAll('a.submenu-link').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('#/')){
          // Allow hash navigation even without router, but prevent "#" jumping
          e.preventDefault();
          window.location.hash = href;
        }
      });
    });
  }

  function setActiveNav(){
    const hash = window.location.hash || '#/procurement/overview';
    const hashBase = String(hash).split('?')[0];

    // 1) Mark active links (only for real hash routes)
    document.querySelectorAll('.submenu-link').forEach(a => {
      const href = (a.getAttribute('href') || '').trim();
      const isHashRoute = href.startsWith('#/');
      // Support nested routes like #/inventory/ingredients/anise-star
      const isActive = isHashRoute && (href === hashBase || hashBase.startsWith(href + '/'));
      a.classList.toggle('active', !!isActive);
    });

    // 2) Auto-open the submenu that contains the active link
    document.querySelectorAll('.submenu').forEach(sm => {
      const hasActive = !!sm.querySelector('a.submenu-link.active');
      sm.classList.toggle('open', hasActive);
      const key = sm.getAttribute('data-submenu');
      if (!key) return;
      const toggle = document.querySelector('.menu-item[data-toggle="'+key+'"]');
      if (toggle) toggle.classList.toggle('open', hasActive);
    });
  }

  // The original prototype had a help menu; keep a no-op safe initializer.
  function initHelpMenu(){
    if (document.body.dataset.helpInit === '1') return;
    document.body.dataset.helpInit = '1';

    const helpBtn = document.getElementById('helpBtn');
    const helpMenu = document.getElementById('helpMenu');
    const helpClose = document.getElementById('helpClose');
    function closeHelp(){ if (helpMenu) helpMenu.classList.remove('open'); }
    if (helpBtn){
      helpBtn.addEventListener('click', (e) => { e.stopPropagation(); helpMenu?.classList.toggle('open'); });
    }
    if (helpClose){
      helpClose.addEventListener('click', (e) => { e.stopPropagation(); closeHelp(); });
    }
    document.addEventListener('click', closeHelp);
  }

  window.UI = window.UI || {};
  Object.assign(window.UI, { toast, initSidebar, setActiveNav, initHelpMenu });

  // Inject toast into ProcurementDemo for compatibility
  if (window.ProcurementDemo){
    window.ProcurementDemo.toast = toast;
  }
})();
