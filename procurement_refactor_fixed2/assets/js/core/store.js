/*
  Core data store for the demo (localStorage-backed)
  Classic script (no ES-module imports) so it works when opened via file://
*/
(function(){
  const STORE_KEY = 'procurement_demo_v1';

  function nowISO(){ return new Date().toISOString(); }
  function id(prefix){
    const n = Math.floor(Math.random()*90000)+10000;
    return `${prefix}-${n}`;
  }

  function getStore(){
    const raw = localStorage.getItem(STORE_KEY);
    if (raw){
      try { return JSON.parse(raw); } catch(e){}
    }

    const seed = {
      settings: {
        approvalsEnabled: true,
        thresholds: [
          { level: 1, role: 'Outlet manager', rule: 'Required' },
          { level: 2, role: 'Finance', rule: 'If total > IDR 5,000,000' },
          { level: 3, role: 'Owner', rule: 'If total > IDR 20,000,000' },
        ]
      },
      prs: [],
      pos: [],
      receivings: [],
      credits: []
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(seed));
    return seed;
  }

  function saveStore(store){
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function getOrCreateDraftPR(){
    const store = getStore();
    let pr = store.prs.find(p => p.status === 'Draft');
    if (!pr){
      pr = {
        id: id('PR'),
        createdAt: nowISO(),
        requester: 'HY',
        scope: 'Full store',
        location: 'Main kitchen',
        neededBy: new Date(Date.now()+7*86400000).toISOString().slice(0,10),
        status: 'Draft',
        approvals: [],
        items: [],
        activity: [{ at: nowISO(), text: 'Draft requisition created' }]
      };
      store.prs.unshift(pr);
      saveStore(store);
    }
    return pr;
  }

  function addItemToDraftPR(item){
    const store = getStore();
    const pr = store.prs.find(p => p.status === 'Draft') || getOrCreateDraftPR();
    const found = pr.items.find(x => x.sku === item.sku);
    if (found){
      found.qty += item.qty;
    } else {
      pr.items.push(item);
    }
    pr.activity.unshift({ at: nowISO(), text: 'Item added: ' + item.name });
    saveStore(store);
  }

  // Public API (and compatibility shim for older inline handlers)
  window.ProcurementDemo = window.ProcurementDemo || {};
  Object.assign(window.ProcurementDemo, {
    STORE_KEY,
    nowISO,
    id,
    getStore,
    saveStore,
    getOrCreateDraftPR,
    addItemToDraftPR,
    // toast is injected by ui.js (after it loads)
    toast: window.ProcurementDemo.toast || function(msg){ console.log('[toast]', msg); }
  });
})();
