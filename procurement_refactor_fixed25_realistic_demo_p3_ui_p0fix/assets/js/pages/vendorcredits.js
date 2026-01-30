(function(){
  const Demo = window.ProcurementDemo || {};
  const getStore = Demo.getStore;
  const saveStore = Demo.saveStore;
  const nowISO = Demo.nowISO;
  const id = Demo.id;

  function formatIDR(n){
    try{ return 'IDR ' + Number(n||0).toLocaleString('en-US'); }catch(e){ return 'IDR ' + (n||0); }
  }

  function calcTotal(crd){
    return (crd.items||[]).reduce((s,it)=> s + (Number(it.amount||0)), 0);
  }

  function statusTag(status){
    const s = status || 'Open';
    const cls = (s==='Verified' || s==='Applied') ? 'counted' : 'review';
    return `<span class="tag ${cls}"><span class="dot"></span> ${s}</span>`;
  }

  function seedCredits(){
    if (!getStore) return;
    const store = getStore();
    if ((store.credits||[]).length) return;
    store.credits = [
      {
        id: 'CRD-10234',
        createdAt: nowISO ? nowISO() : new Date().toISOString(),
        supplier: 'Fresh Market',
        poId: 'PO-12011',
        receivingId: 'RCV-33012',
        status: 'Open',
        reason: 'Short shipped',
        items: [
          { sku:'2001', name:'Avocado', uom:'g', orderedQty:3000, receivedQty:2000, unitPrice:225, amount:225000 }
        ],
        activity: [{ at: nowISO ? nowISO() : new Date().toISOString(), text:'Credit created from receiving variance' }]
      }
    ];
    saveStore(store);
  }

  function render(){
    return /*html*/`
      <div class="breadcrumb">
        <span>Procurement</span>
        <span class="crumb-dot">›</span>
        <span>Vendor credits</span>
      </div>

      <div class="page-head">
        <div>
          <h1 class="page-title">Vendor credits</h1>
          <p class="page-desc">Credits created from short shipments and invoice corrections.</p>
        </div>
        <div class="right-actions">
          <button class="btn-secondary" id="btnBackToOverview" type="button">Back to overview</button>
          <button class="primary-btn" id="btnNewCredit" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            New credit
          </button>
        </div>
      </div>

      <div id="creditsListView" class="card" style="padding:14px;">
        <div class="panel-head">
          <div>
            <div class="panel-title">Credits to verify</div>
            <div class="panel-sub">Review and confirm credits before applying them to invoices.</div>
          </div>
          <div class="chips">
            <button class="chip active" data-filter="All" type="button">All</button>
            <button class="chip" data-filter="Open" type="button">Open</button>
            <button class="chip" data-filter="Verified" type="button">Verified</button>
            <button class="chip" data-filter="Applied" type="button">Applied</button>
          </div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px;">
          <!-- Use shared .search component to avoid oversized SVG / inconsistent styling -->
          <div class="search" style="max-width:360px;flex:1;">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35" stroke-linecap="round"/><circle cx="11" cy="11" r="7"/></svg>
            <input id="creditSearch" type="text" placeholder="Search by supplier, PO, credit id" />
          </div>
          <div class="pill"><span class="dot"></span> Auto-created from receiving variances</div>
        </div>

        <div class="table-wrap" style="margin-top:12px;">
          <table class="count-table">
            <thead>
              <tr>
                <th>Credit</th>
                <th>Supplier</th>
                <th>PO</th>
                <th class="right">Amount</th>
                <th>Status</th>
                <th class="right">Action</th>
              </tr>
            </thead>
            <tbody id="creditsTbody"></tbody>
          </table>
        </div>
      </div>

      <div id="creditsDetailView" class="card" style="padding:14px; display:none;">
        <div class="panel-head">
          <div>
            <div class="panel-title" id="crdTitle">Credit</div>
            <div class="panel-sub" id="crdSubtitle">—</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <div id="crdStatus"></div>
            <button class="btn-secondary" id="btnBackToCredits" type="button">Back</button>
          </div>
        </div>

        <div class="split" style="margin-top:12px;">
          <section class="card panel col-7" style="border:none;padding:0;">
            <div class="table-wrap">
              <table class="count-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="mono">Ordered</th>
                    <th class="mono">Received</th>
                    <th class="mono right">Credit</th>
                  </tr>
                </thead>
                <tbody id="crdItems"></tbody>
              </table>
            </div>
          </section>

          <section class="card panel col-5">
            <div class="kv">
              <div class="cell"><div class="k">Supplier</div><div class="v" id="crdSupplier">—</div></div>
              <div class="cell"><div class="k">PO</div><div class="v mono" id="crdPO">—</div></div>
              <div class="cell"><div class="k">Receiving</div><div class="v mono" id="crdRCV">—</div></div>
              <div class="cell"><div class="k">Total credit</div><div class="v mono" id="crdTotal">—</div></div>
            </div>

            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px;">
              <button class="primary-btn" id="btnVerifyCredit" type="button">Verify</button>
              <button class="btn-secondary" id="btnApplyCredit" type="button">Mark as applied</button>
            </div>

            <div class="hint" style="margin-top:10px;">Verified credits can be applied when the supplier invoice arrives.</div>
          </section>
        </div>
      </div>

      <div class="modal" id="creditModal" style="display:none;">
        <div class="modal-card">
          <div class="modal-head">
            <div>
              <div class="modal-title">New credit</div>
              <div class="modal-sub">Create a manual credit note (for invoice corrections).</div>
            </div>
            <button class="icon-btn" id="closeCreditModal" title="Close" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"></path></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field">
                <label>Supplier</label>
                <input id="crdNewSupplier" placeholder="Supplier name" />
              </div>
              <div class="form-field">
                <label>PO (optional)</label>
                <input id="crdNewPO" placeholder="PO-xxxxx" />
              </div>
              <div class="form-field wide">
                <label>Reason</label>
                <input id="crdNewReason" placeholder="e.g., invoice correction" />
              </div>
              <div class="form-field">
                <label>Amount</label>
                <input id="crdNewAmount" type="number" min="0" value="0" />
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" id="cancelCredit" type="button">Cancel</button>
            <button class="primary-btn" id="createCredit" type="button">Create credit</button>
          </div>
        </div>
      </div>
    `;
  }

  function init(){
    if (!getStore || !saveStore){
      console.warn('Store not loaded');
      return;
    }
    seedCredits();

    const listView = document.getElementById('creditsListView');
    const detailView = document.getElementById('creditsDetailView');
    const tbody = document.getElementById('creditsTbody');
    const search = document.getElementById('creditSearch');
    const modal = document.getElementById('creditModal');

    let filter = 'All';
    let currentId = null;

    function openModal(){ modal.style.display = 'flex'; }
    function closeModal(){ modal.style.display = 'none'; }

    function renderList(){
      const store = getStore();
      const q = (search?.value||'').toLowerCase().trim();
      const rows = (store.credits||[])
        .filter(c => filter==='All' ? true : (c.status===filter))
        .filter(c => {
          if (!q) return true;
          const hay = `${c.id} ${c.supplier||''} ${c.poId||''}`.toLowerCase();
          return hay.includes(q);
        })
        .map(c => {
          return `
            <tr>
              <td class="mono" style="font-weight:950;">${c.id}</td>
              <td>${c.supplier||'—'}</td>
              <td class="mono">${c.poId||'—'}</td>
              <td class="right mono">${formatIDR(calcTotal(c))}</td>
              <td>${statusTag(c.status)}</td>
              <td class="right"><button class="link-btn" data-open-credit="${c.id}">Open</button></td>
            </tr>
          `;
        }).join('');
      tbody.innerHTML = rows || `<tr><td colspan="6" class="cell-muted">No credits found.</td></tr>`;

      document.querySelectorAll('[data-open-credit]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const cid = btn.getAttribute('data-open-credit');
          window.location.hash = '#/procurement/vendor-credits/' + encodeURIComponent(cid);
        });
      });
    }

    function renderDetail(crd){
      currentId = crd.id;
      document.getElementById('crdTitle').textContent = crd.id;
      document.getElementById('crdSubtitle').textContent = `${crd.supplier||'—'} • ${crd.poId||'No PO'} • ${crd.reason||'—'}`;
      document.getElementById('crdStatus').innerHTML = statusTag(crd.status);

      document.getElementById('crdSupplier').textContent = crd.supplier||'—';
      document.getElementById('crdPO').textContent = crd.poId||'—';
      document.getElementById('crdRCV').textContent = crd.receivingId||'—';
      document.getElementById('crdTotal').textContent = formatIDR(calcTotal(crd));

      document.getElementById('crdItems').innerHTML = (crd.items||[]).map(it=>{
        const ordered = `${Number(it.orderedQty||0).toLocaleString('en-US')} ${it.uom||''}`.trim();
        const received = `${Number(it.receivedQty||0).toLocaleString('en-US')} ${it.uom||''}`.trim();
        return `
          <tr>
            <td style="font-weight:950;">${it.name||'Item'}</td>
            <td class="mono">${ordered||'—'}</td>
            <td class="mono">${received||'—'}</td>
            <td class="mono right">${formatIDR(it.amount||0)}</td>
          </tr>
        `;
      }).join('') || `<tr><td colspan="4" class="cell-muted">No line items.</td></tr>`;

      const verifyBtn = document.getElementById('btnVerifyCredit');
      const applyBtn = document.getElementById('btnApplyCredit');
      verifyBtn.disabled = (crd.status!=='Open');
      applyBtn.disabled = (crd.status!=='Verified');
    }

    function openDetailById(cid){
      const store = getStore();
      const crd = (store.credits||[]).find(c=>c.id===cid);
      if (!crd){
        window.location.hash = '#/procurement/vendor-credits';
        return;
      }
      listView.style.display = 'none';
      detailView.style.display = 'block';
      renderDetail(crd);
    }

    function backToList(){
      detailView.style.display = 'none';
      listView.style.display = 'block';
      currentId = null;
      window.location.hash = '#/procurement/vendor-credits';
    }

    // Events: filters + search
    document.querySelectorAll('.chip[data-filter]').forEach(ch=>{
      ch.addEventListener('click', ()=>{
        document.querySelectorAll('.chip[data-filter]').forEach(x=>x.classList.remove('active'));
        ch.classList.add('active');
        filter = ch.getAttribute('data-filter') || 'All';
        renderList();
      });
    });
    search?.addEventListener('input', renderList);

    // Events: header buttons
    document.getElementById('btnBackToOverview')?.addEventListener('click', ()=> window.location.hash = '#/procurement/overview');
    document.getElementById('btnNewCredit')?.addEventListener('click', openModal);
    document.getElementById('closeCreditModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelCredit')?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });

    document.getElementById('createCredit')?.addEventListener('click', ()=>{
      const supplier = (document.getElementById('crdNewSupplier')?.value||'').trim();
      const po = (document.getElementById('crdNewPO')?.value||'').trim();
      const reason = (document.getElementById('crdNewReason')?.value||'').trim();
      const amount = Number(document.getElementById('crdNewAmount')?.value||0);
      if (!supplier){ Demo.toast?.('Supplier required'); return; }

      const store = getStore();
      const crd = {
        id: id ? id('CRD') : ('CRD-' + Math.floor(Math.random()*90000+10000)),
        createdAt: nowISO ? nowISO() : new Date().toISOString(),
        supplier,
        poId: po || null,
        receivingId: null,
        status: 'Open',
        reason: reason || 'Manual credit',
        items: [{ sku:null, name:'Manual adjustment', uom:'', orderedQty:null, receivedQty:null, unitPrice:null, amount: Math.max(0, amount) }],
        activity: [{ at: nowISO ? nowISO() : new Date().toISOString(), text:'Manual credit created' }]
      };
      store.credits = store.credits || [];
      store.credits.unshift(crd);
      saveStore(store);
      closeModal();
      Demo.toast?.('Credit created');
      renderList();
    });

    // Detail actions
    document.getElementById('btnBackToCredits')?.addEventListener('click', backToList);
    document.getElementById('btnVerifyCredit')?.addEventListener('click', ()=>{
      const store = getStore();
      const crd = (store.credits||[]).find(c=>c.id===currentId);
      if (!crd || crd.status!=='Open') return;
      crd.status = 'Verified';
      crd.activity = crd.activity || [];
      crd.activity.unshift({ at: nowISO ? nowISO() : new Date().toISOString(), text:'Credit verified' });
      saveStore(store);
      Demo.toast?.('Credit verified');
      renderDetail(crd);
      renderList();
    });
    document.getElementById('btnApplyCredit')?.addEventListener('click', ()=>{
      const store = getStore();
      const crd = (store.credits||[]).find(c=>c.id===currentId);
      if (!crd || crd.status!=='Verified') return;
      crd.status = 'Applied';
      crd.activity = crd.activity || [];
      crd.activity.unshift({ at: nowISO ? nowISO() : new Date().toISOString(), text:'Credit marked as applied' });
      saveStore(store);
      Demo.toast?.('Credit applied');
      renderDetail(crd);
      renderList();
    });

    // Handle deep-link: #/procurement/vendor-credits/<CRD-...>
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    const maybeId = parts.length >= 4 ? decodeURIComponent(parts.slice(3).join('/')) : null;
    if (maybeId){
      listView.style.display = 'none';
      detailView.style.display = 'block';
      openDetailById(maybeId);
    } else {
      detailView.style.display = 'none';
      listView.style.display = 'block';
      renderList();
    }
  }

  window.Pages = window.Pages || {};
  window.Pages.vendorcredits = { render, init };
})();
