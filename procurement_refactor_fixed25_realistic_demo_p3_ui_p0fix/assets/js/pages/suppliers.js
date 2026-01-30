/*
  Suppliers page
  - Supplier directory with KPIs, filters, and a detail panel
  - Create/Edit supplier via modal
  - Deactivate/Reactivate supplier

  Classic script: attaches to window.Pages
*/
(function(){
  const PD = window.ProcurementDemo;
  const toast = (msg)=> (window.UI?.toast ? window.UI.toast(msg) : alert(msg));

  function formatIDR(n){
    const v = Number(n||0);
    try{ return v.toLocaleString('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }); }
    catch(e){ return 'IDR ' + Math.round(v).toLocaleString('id-ID'); }
  }
  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  // Module state (kept in-memory; re-render keeps selection)
  let selectedId = null;
  let filter = 'Active';
  let reviewMode = null; // null | 'missingContacts' | 'missingTerms' | 'risk'

  function getRoute(){
    const raw = (window.location.hash || '').trim();
    const path = raw.replace(/^#\/?/, '');
    const seg = path.split('/').filter(Boolean);
    // procurement/suppliers
    // procurement/suppliers/SUP-10001/items
    if (seg[0]==='procurement' && seg[1]==='suppliers' && seg[2] && seg[3]==='items'){
      return { mode:'items', supplierId: seg[2] };
    }
    return { mode:'list' };
  }

  function findSupplier(store, supplierId){
    return (store.suppliers||[]).find(x => x.id === supplierId) || null;
  }

  function getSupplierItemRows(store, supplierId){
    const items = store.items || [];
    const priceRows = (store.supplierItems || []).filter(x => x.supplierId === supplierId);
    const bySku = Object.fromEntries(items.map(it => [String(it.sku), it]));
    return priceRows
      .map(p => {
        const meta = bySku[String(p.sku)] || { sku: p.sku, name: 'Item', uom: '—', category:'—' };
        return {
          sku: String(meta.sku),
          name: meta.name,
          uom: meta.uom,
          category: meta.category,
          unitPrice: Number(p.unitPrice||0),
          currency: p.currency || 'IDR',
          active: p.active !== false,
          updatedAt: p.updatedAt || ''
        };
      })
      .sort((a,b)=> a.name.localeCompare(b.name));
  }

  function computeSupplierMetrics(store){
    const suppliers = store.suppliers || [];
    const pos = store.pos || [];

    // Aggregate open PO count + spend (all-time as demo “YTD”)
    const bySupplier = {};
    suppliers.forEach(s => { bySupplier[s.id] = { openPOs:0, spend:0, lastPO:null }; });

    pos.forEach(po => {
      const sid = po.supplierId;
      if (!sid || !bySupplier[sid]) return;
      const total = Number(po.total||0);
      bySupplier[sid].spend += total;
      if (po.status && ['Draft','Sent','Partially received'].includes(po.status)) bySupplier[sid].openPOs += 1;
      const at = po.createdAt || '';
      if (!bySupplier[sid].lastPO || String(at) > String(bySupplier[sid].lastPO)) bySupplier[sid].lastPO = at;
    });

    const active = suppliers.filter(s => (s.status||'Active') === 'Active');
    const inactive = suppliers.length - active.length;
    const openPOs = Object.values(bySupplier).reduce((a,x)=>a + (x.openPOs||0), 0);
    const spend = Object.values(bySupplier).reduce((a,x)=>a + (x.spend||0), 0);

    // “Health” signals to surface on the page (high‑priority information)
    const missingContacts = suppliers.filter(s => (s.status||'Active')==='Active' && (!s.email || !s.contactName));
    const missingTerms = suppliers.filter(s => (s.status||'Active')==='Active' && (!s.paymentTerms || s.paymentTerms==='—'));
    const inactiveWithOpenPOs = suppliers.filter(s => (s.status||'Active')!=='Active' && (bySupplier[s.id]?.openPOs||0) > 0);
    const lowPerformance = suppliers.filter(s => (s.status||'Active')==='Active' && (
      (Number(s.onTimeRate||0) > 0 && Number(s.onTimeRate||0) < 85) ||
      (Number(s.qualityScore||0) > 0 && Number(s.qualityScore||0) < 85)
    ));

    return {
      active: active.length,
      inactive,
      openPOs,
      spend,
      bySupplier,
      health: {
        missingContacts: missingContacts.length,
        missingTerms: missingTerms.length,
        inactiveWithOpenPOs: inactiveWithOpenPOs.length,
        lowPerformance: lowPerformance.length
      }
    };
  }

  function renderItemsView(supplierId){
    const store = PD.getStore();
    const sup = findSupplier(store, supplierId);
    const title = sup ? sup.name : 'Supplier';
    return `
      <div class="page">
        <div class="page-head">
          <div>
            <div class="breadcrumb">Procurement <span class="sep">/</span> Suppliers <span class="sep">/</span> ${title} <span class="sep">/</span> Items</div>
            <div class="page-title">Items & pricing</div>
            <div class="page-sub">Products you can order from this supplier, including the current agreed unit prices.</div>
          </div>
          <div class="page-actions">
            <button class="ghost-btn" id="btnBackSup">Back to suppliers</button>
            <button class="primary-btn" id="btnCreatePRFromSup">Create PR</button>
            <button class="ghost-btn" id="btnCreatePOFromSup">Create PO</button>
          </div>
        </div>

        <div class="card panel" style="margin-top:12px">
          <div class="toolbar">
            <div class="search" style="max-width: 520px;">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35" stroke-linecap="round"/><circle cx="11" cy="11" r="7"/></svg>
              <input id="supItemsSearch" type="text" placeholder="Search item name or SKU" />
            </div>
            <div class="mini-muted" id="supItemsMeta"></div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:34%">Item</th>
                  <th style="width:12%">SKU</th>
                  <th style="width:12%">UOM</th>
                  <th style="width:18%">Category</th>
                  <th class="right" style="width:14%">Unit price</th>
                  <th style="width:10%">Status</th>
                </tr>
              </thead>
              <tbody id="supItemsRows"></tbody>
            </table>
          </div>
          <div class="mini-muted" style="margin-top:10px">Tip: Update prices from the supplier profile workflow or through integrated finance systems.</div>
        </div>
      </div>
    `;
  }

  function render(){
    const r = getRoute();
    if (r.mode === 'items') return renderItemsView(r.supplierId);
    return `
      <div class="page">
        <div class="page-head">
          <div>
            <div class="breadcrumb">Procurement <span class="sep">/</span> Suppliers</div>
            <div class="page-title">Suppliers</div>
            <div class="page-sub">Manage vendor profiles, terms, contacts, and performance.</div>
          </div>
          <div class="page-actions">
            <button class="ghost-btn" id="btnImportSup">Import</button>
            <button class="ghost-btn" id="btnExportSup">Export</button>
            <button class="primary-btn" id="btnNewSupplier">New supplier</button>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="card kpi" style="grid-column: span 3;">
            <div class="k">Active suppliers</div>
            <div class="v" id="kpiActive">—</div>
            <div class="s">Enabled for ordering</div>
          </div>
          <div class="card kpi" style="grid-column: span 3;">
            <div class="k">Open purchase orders</div>
            <div class="v" id="kpiOpenPO">—</div>
            <div class="s">Draft / Sent / Partial</div>
          </div>
          <div class="card kpi" style="grid-column: span 3;">
            <div class="k">Supplier spend</div>
            <div class="v" id="kpiSpend">—</div>
            <div class="s">Aggregated from POs</div>
          </div>
          <div class="card kpi" style="grid-column: span 3;">
            <div class="k">Inactive suppliers</div>
            <div class="v" id="kpiInactive">—</div>
            <div class="s">Hidden from ordering</div>
          </div>
        </div>

        <div class="health-grid" style="margin-top:12px">
          <div class="card health" id="hcMissingContacts">
            <div class="h">Missing contact info</div>
            <div class="v" id="hcMissingContactsVal">—</div>
            <div class="s">Active suppliers without email/contact.</div>
            <button class="ghost-btn sm" id="hcMissingContactsBtn">Review</button>
          </div>
          <div class="card health" id="hcMissingTerms">
            <div class="h">Missing payment terms</div>
            <div class="v" id="hcMissingTermsVal">—</div>
            <div class="s">Set terms to support AP automation.</div>
            <button class="ghost-btn sm" id="hcMissingTermsBtn">Review</button>
          </div>
          <div class="card health" id="hcRisk">
            <div class="h">Supplier risk</div>
            <div class="v" id="hcRiskVal">—</div>
            <div class="s">Low on‑time / quality, or inactive with open POs.</div>
            <button class="ghost-btn sm" id="hcRiskBtn">Review</button>
          </div>
        </div>

        <div class="split">
          <div class="card panel" style="grid-column: span 8;">
            <div class="toolbar">
              <div class="search" style="max-width: 420px;">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35" stroke-linecap="round"/><circle cx="11" cy="11" r="7"/></svg>
                <input id="supSearch" type="text" placeholder="Search suppliers" />
              </div>
              <div class="chips">
                <button class="chip" data-sup-filter="All">All</button>
                <button class="chip" data-sup-filter="Active">Active</button>
                <button class="chip" data-sup-filter="Inactive">Inactive</button>
              </div>
            </div>

            <div class="table-wrap">
              <table class="data-table sup-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Category</th>
                    <th>Payment terms</th>
                    <th>Lead time</th>
                    <th class="right">Open POs</th>
                    <th>Status</th>
                    <th class="right">Spend</th>
                  </tr>
                </thead>
                <tbody id="supRows"></tbody>
              </table>
            </div>
            <div class="mini-muted" style="margin-top:10px" id="supHint"></div>
          </div>

          <div class="card panel" style="grid-column: span 4;" id="supDetail">
            <div class="panel-title">Supplier details</div>
            <div class="panel-sub">Select a supplier to view profile, terms and performance.</div>
            <div class="divider"></div>
            <div class="mini-muted">No supplier selected.</div>
          </div>
        </div>

        <!-- Supplier modal -->
        <div class="drawer" id="supplierModal">
          <div class="modal" style="width:min(980px,100%)">
            <div class="modal-head">
              <div>
                <div class="modal-title" id="supplierModalTitle">New supplier</div>
                <div class="mini-muted">Create or update vendor profile used across PR/PO/Receiving.</div>
              </div>
              <button class="icon-x" id="closeSupplierModal">×</button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="field">
                  <div class="label">Supplier name</div>
                  <input class="input" id="supName" placeholder="e.g., Fresh Market" />
                </div>
                <div class="field">
                  <div class="label">Status</div>
                  <select class="select" id="supStatus">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div class="field">
                  <div class="label">Category</div>
                  <input class="input" id="supCategory" placeholder="e.g., Produce, Dairy, Butchery" />
                </div>
                <div class="field">
                  <div class="label">Currency</div>
                  <select class="select" id="supCurrency">
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div class="field">
                  <div class="label">Primary contact</div>
                  <input class="input" id="supContact" placeholder="Name" />
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <input class="input" id="supEmail" placeholder="vendor@email.com" />
                </div>
                <div class="field">
                  <div class="label">Phone</div>
                  <input class="input" id="supPhone" placeholder="+62 ..." />
                </div>
                <div class="field">
                  <div class="label">Tax ID</div>
                  <input class="input" id="supTax" placeholder="NPWP / VAT" />
                </div>

                <div class="field">
                  <div class="label">Payment terms</div>
                  <select class="select" id="supTerms">
                    <option value="Due on receipt">Due on receipt</option>
                    <option value="Net 7">Net 7</option>
                    <option value="Net 14">Net 14</option>
                    <option value="Net 30">Net 30</option>
                  </select>
                </div>
                <div class="field">
                  <div class="label">Lead time (days)</div>
                  <input class="input" id="supLead" type="number" min="0" step="1" />
                </div>
                <div class="field">
                  <div class="label">Minimum order value</div>
                  <input class="input" id="supMOV" type="number" min="0" step="1000" />
                </div>
                <div class="field">
                  <div class="label">Delivery window</div>
                  <input class="input" id="supWindow" placeholder="e.g., Mon–Fri 9:00–15:00" />
                </div>

                <div class="field full">
                  <div class="label">Address</div>
                  <input class="input" id="supAddress" placeholder="Street, city, province" />
                  <div class="muted-note">Used for invoices and delivery instructions.</div>
                </div>

                <div class="field full">
                  <div class="label">Ordering & integration IDs</div>
                  <div class="form-grid" style="margin-top:8px">
                    <div class="field" style="grid-column: span 4;">
                      <div class="label">POS vendor ID</div>
                      <input class="input" id="supPosId" placeholder="—" />
                    </div>
                    <div class="field" style="grid-column: span 4;">
                      <div class="label">QuickBooks vendor ID</div>
                      <input class="input" id="supQbId" placeholder="—" />
                    </div>
                    <div class="field" style="grid-column: span 4;">
                      <div class="label">Bank reference</div>
                      <input class="input" id="supBank" placeholder="Account / IBAN (masked)" />
                    </div>
                  </div>
                </div>

                <div class="field full">
                  <div class="label">Notes</div>
                  <textarea class="textarea" id="supNotes" placeholder="Add preferred items, quality notes, invoice requirements, etc."></textarea>
                </div>
              </div>
              <div class="btn-row">
                <button class="ghost-btn" id="cancelSupplier">Cancel</button>
                <button class="primary-btn" id="saveSupplier">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initItemsView(supplierId){
    const store = PD.getStore();
    const sup = findSupplier(store, supplierId);
    if (supplierId) selectedId = supplierId;

    const all = getSupplierItemRows(store, supplierId);
    const metaEl = document.getElementById('supItemsMeta');
    const searchEl = document.getElementById('supItemsSearch');
    const rowsEl = document.getElementById('supItemsRows');

    const currency = sup?.currency || 'IDR';
    const fmt = (n)=>{
      if (currency === 'IDR') return formatIDR(n);
      try{ return Number(n||0).toLocaleString('en-US', { style:'currency', currency, maximumFractionDigits:2 }); }
      catch(e){ return currency + ' ' + Number(n||0).toLocaleString('en-US'); }
    };

    function renderRows(){
      const q = String(searchEl?.value||'').trim().toLowerCase();
      const list = all.filter(r => !q || r.name.toLowerCase().includes(q) || r.sku.includes(q));
      if (metaEl){
        metaEl.textContent = `${sup?sup.name:'Supplier'} · ${list.length}/${all.length} items`;
      }
      if (!rowsEl) return;
      if (!all.length){
        rowsEl.innerHTML = `<tr><td colspan="6" class="muted">No items are configured for this supplier yet.</td></tr>`;
        return;
      }
      rowsEl.innerHTML = list.map(r=>{
        const tag = r.active ? '<span class="tag ok">Active</span>' : '<span class="tag neutral">Inactive</span>';
        return `
          <tr>
            <td>
              <div style="font-weight:700">${r.name}</div>
              <div class="mini-muted">Last updated: ${r.updatedAt ? String(r.updatedAt).slice(0,10) : '—'}</div>
            </td>
            <td class="mono">${r.sku}</td>
            <td class="muted">${r.uom || '—'}</td>
            <td class="muted">${r.category || '—'}</td>
            <td class="right mono">${r.unitPrice ? fmt(r.unitPrice) : '—'}</td>
            <td>${tag}</td>
          </tr>
        `;
      }).join('');
    }

    searchEl?.addEventListener('input', renderRows);
    document.getElementById('btnBackSup')?.addEventListener('click', ()=>{
      // preserve selection on the list page
      selectedId = supplierId;
      window.location.hash = '#/procurement/suppliers';
    });
    document.getElementById('btnCreatePRFromSup')?.addEventListener('click', ()=>{
      // Create a new draft PR pre-linked to this supplier and open it.
      const pr = (PD.createDraftPR ? PD.createDraftPR({ supplierId }) : (PD.getOrCreateDraftPR ? PD.getOrCreateDraftPR({ supplierId }) : null));
      if (!pr){ toast('Unable to create requisition'); return; }
      try{
        sessionStorage.setItem('autoOpenPRAddItemFor', pr.id);
      }catch(e){}
      toast('Draft PR created');
      window.location.hash = '#/procurement/pr/' + encodeURIComponent(pr.id);
    });
    document.getElementById('btnCreatePOFromSup')?.addEventListener('click', ()=>{
      // Optional shortcut: create PO directly from the supplier context.
      if (PD.can && !PD.can('create_po')){
        toast('You don\'t have permission to create a PO directly. Please create a PR first.');
        // Create a draft PR tied to this supplier to guide the flow.
        const pr = (PD.createDraftPR ? PD.createDraftPR({ supplierId }) : (PD.getOrCreateDraftPR ? PD.getOrCreateDraftPR({ supplierId }) : null));
        if (pr){
          try{ sessionStorage.setItem('autoOpenPRAddItemFor', pr.id); }catch(e){}
          window.location.hash = '#/procurement/pr/' + encodeURIComponent(pr.id);
        } else {
          window.location.hash = '#/procurement/pr';
        }
        return;
      }
      window.location.hash = '#/procurement/po';
    });

    renderRows();
  }

  function init(){
    const route = getRoute();
    if (route.mode === 'items'){
      initItemsView(route.supplierId);
      return;
    }
    const store = PD.getStore();

    // Ensure we have at least one supplier selected
    if (!selectedId && (store.suppliers||[]).length) selectedId = store.suppliers[0].id;

    const metrics = computeSupplierMetrics(store);
    document.getElementById('kpiActive').textContent = String(metrics.active);
    document.getElementById('kpiInactive').textContent = String(metrics.inactive);
    document.getElementById('kpiOpenPO').textContent = String(metrics.openPOs);
    document.getElementById('kpiSpend').textContent = formatIDR(metrics.spend);

    const chips = Array.from(document.querySelectorAll('.chip[data-sup-filter]'));
    chips.forEach(ch => {
      const v = ch.getAttribute('data-sup-filter');
      ch.classList.toggle('active', v === filter);
      ch.addEventListener('click', () => {
        filter = v;
        reviewMode = null;
        chips.forEach(x => x.classList.toggle('active', x.getAttribute('data-sup-filter')===filter));
        renderList();
      });
    });

    // Health cards (prioritized “needs attention” signals)
    const riskCount = (metrics.health.lowPerformance || 0) + (metrics.health.inactiveWithOpenPOs || 0);
    const setHealth = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=String(val||0); };
    setHealth('hcMissingContactsVal', metrics.health.missingContacts);
    setHealth('hcMissingTermsVal', metrics.health.missingTerms);
    setHealth('hcRiskVal', riskCount);

    document.getElementById('hcMissingContactsBtn')?.addEventListener('click', ()=>{
      filter = 'Active';
      reviewMode = 'missingContacts';
      const inp=document.getElementById('supSearch'); if(inp) inp.value='';
      chips.forEach(x => x.classList.toggle('active', x.getAttribute('data-sup-filter')===filter));
      renderList();
    });
    document.getElementById('hcMissingTermsBtn')?.addEventListener('click', ()=>{
      filter = 'Active';
      reviewMode = 'missingTerms';
      const inp=document.getElementById('supSearch'); if(inp) inp.value='';
      chips.forEach(x => x.classList.toggle('active', x.getAttribute('data-sup-filter')===filter));
      renderList();
    });
    document.getElementById('hcRiskBtn')?.addEventListener('click', ()=>{
      reviewMode = 'risk';
      renderList();
    });

    document.getElementById('supSearch')?.addEventListener('input', renderList);

    document.getElementById('btnImportSup')?.addEventListener('click', ()=>toast('Import started'));
    document.getElementById('btnExportSup')?.addEventListener('click', ()=>toast('Export ready'));
    document.getElementById('btnNewSupplier')?.addEventListener('click', ()=>openSupplierModal(null));

    // Modal wiring
    const modal = document.getElementById('supplierModal');
    const close = ()=> modal?.classList.remove('open');
    document.getElementById('closeSupplierModal')?.addEventListener('click', close);
    document.getElementById('cancelSupplier')?.addEventListener('click', close);
    modal?.addEventListener('click', (e)=>{ if (e.target===modal) close(); });
    document.getElementById('saveSupplier')?.addEventListener('click', saveSupplierFromModal);

    function renderList(){
      const s = PD.getStore();
      const m = computeSupplierMetrics(s);
      const q = (document.getElementById('supSearch')?.value || '').trim().toLowerCase();
      let suppliers = (s.suppliers || []).slice();
      if (filter !== 'All') suppliers = suppliers.filter(x => (x.status||'Active') === filter);
      if (q) suppliers = suppliers.filter(x => (x.name||'').toLowerCase().includes(q) || (x.category||'').toLowerCase().includes(q));

      // Optional “review” modes from health cards (keeps page focused on key issues)
      if (reviewMode === 'missingContacts'){
        suppliers = suppliers.filter(x => (x.status||'Active')==='Active' && (!x.email || !x.contactName));
      } else if (reviewMode === 'missingTerms'){
        suppliers = suppliers.filter(x => (x.status||'Active')==='Active' && (!x.paymentTerms || x.paymentTerms==='—'));
      } else if (reviewMode === 'risk'){
        const agg = m.bySupplier;
        suppliers = suppliers.filter(x => (
          ((x.status||'Active')!=='Active' && (agg[x.id]?.openPOs||0)>0) ||
          ((x.status||'Active')==='Active' && ((Number(x.onTimeRate||0)>0 && Number(x.onTimeRate||0)<85) || (Number(x.qualityScore||0)>0 && Number(x.qualityScore||0)<85)))
        ));
      }

      // Keep selectedId valid
      if (selectedId && !suppliers.some(x=>x.id===selectedId)){
        selectedId = suppliers[0]?.id || null;
      }
      const tbody = document.getElementById('supRows');
      const hint = document.getElementById('supHint');
      if (!tbody) return;

      if (!suppliers.length){
        tbody.innerHTML = `<tr><td colspan="7" class="mini-muted">No suppliers found.</td></tr>`;
        hint.textContent = '';
        renderDetail(null);
        return;
      }

      tbody.innerHTML = suppliers.map(v => {
        const agg = m.bySupplier[v.id] || { openPOs:0, spend:0 };
        const status = (v.status||'Active');
        const tag = status==='Active' ? 'ok' : 'neutral';
        const isSel = v.id===selectedId;
        return `
          <tr class="row-click ${isSel?'row-active':''}" data-sup-id="${v.id}">
            <td>
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="pill" style="min-width:32px; text-align:center;">${(v.name||'?').slice(0,2).toUpperCase()}</div>
                <div>
                  <div style="font-weight:950">${v.name}</div>
                  <div class="mini-muted">${v.contactName || '—'}${v.email ? ' · ' + v.email : ''}</div>
                </div>
              </div>
            </td>
            <td class="cell-muted">${v.category || '—'}</td>
            <td class="cell-muted">${v.paymentTerms || '—'}</td>
            <td class="cell-muted">${Number(v.leadTimeDays||0)} days</td>
            <td class="right mono">${agg.openPOs||0}</td>
            <td><span class="tag ${tag}">${status}</span></td>
            <td class="right mono">${formatIDR(agg.spend||0)}</td>
          </tr>
        `;
      }).join('');

      hint.textContent = suppliers.length + ' supplier(s)';

      tbody.querySelectorAll('tr[data-sup-id]').forEach(tr=>{
        tr.addEventListener('click', ()=>{
          selectedId = tr.getAttribute('data-sup-id');
          // Re-render list selection styling + detail
          renderList();
        });
      });

      renderDetail(selectedId);
    }

    function renderDetail(id){
      const s = PD.getStore();
      const m = computeSupplierMetrics(s);
      const sup = (s.suppliers||[]).find(x=>x.id===id);
      const el = document.getElementById('supDetail');
      if (!el) return;
      if (!sup){
        el.innerHTML = `
          <div class="panel-title">Supplier details</div>
          <div class="panel-sub">Select a supplier to view profile, terms and performance.</div>
          <div class="divider"></div>
          <div class="mini-muted">No supplier selected.</div>
        `;
        return;
      }
      const agg = m.bySupplier[sup.id] || { openPOs:0, spend:0 };
      const status = (sup.status||'Active');
      const tag = status==='Active' ? 'ok' : 'neutral';
      const onTime = clamp(Number(sup.onTimeRate||0), 0, 100);
      const quality = clamp(Number(sup.qualityScore||0), 0, 100);

      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div>
            <div class="panel-title">${sup.name}</div>
            <div class="panel-sub">${sup.category || 'Supplier'}</div>
          </div>
          <div><span class="tag ${tag}">${status}</span></div>
        </div>

        <div class="kv" style="margin-top:12px">
          <div class="cell"><div class="k">Primary contact</div><div class="v">${sup.contactName || '—'}</div></div>
          <div class="cell"><div class="k">Phone</div><div class="v">${sup.phone || '—'}</div></div>
          <div class="cell"><div class="k">Email</div><div class="v">${sup.email || '—'}</div></div>
          <div class="cell"><div class="k">Payment terms</div><div class="v">${sup.paymentTerms || '—'}</div></div>
          <div class="cell"><div class="k">Lead time</div><div class="v">${Number(sup.leadTimeDays||0)} days</div></div>
          <div class="cell"><div class="k">Min order value</div><div class="v">${formatIDR(sup.minOrderValue||0)}</div></div>
        </div>

        <div class="divider"></div>

        <div class="panel-title" style="font-size:15px">Performance</div>
        <div class="kv" style="margin-top:10px">
          <div class="cell"><div class="k">Open POs</div><div class="v mono">${agg.openPOs||0}</div></div>
          <div class="cell"><div class="k">Spend</div><div class="v mono">${formatIDR(agg.spend||0)}</div></div>
          <div class="cell"><div class="k">On‑time delivery</div><div class="v">${onTime}%</div></div>
          <div class="cell"><div class="k">Quality score</div><div class="v">${quality}%</div></div>
        </div>

        <div class="divider"></div>
        <div class="panel-title" style="font-size:15px">Address & notes</div>
        <div class="mini-muted" style="margin-top:6px; white-space:normal; overflow-wrap:anywhere;">${sup.address || '—'}</div>
        <div class="mini-muted" style="margin-top:8px; white-space:normal; overflow-wrap:anywhere;">${sup.notes || ''}</div>

        <div class="btn-row" style="justify-content:flex-start">
          <button class="ghost-btn" id="btnEditSup">Edit</button>
          <button class="ghost-btn" id="btnViewSupItems">View items</button>
          <button class="ghost-btn" id="btnCreatePO">Create PO</button>
          ${status==='Active' ? `<button class="danger-btn" id="btnToggleSup">Deactivate</button>` : `<button class="ghost-btn" id="btnToggleSup">Reactivate</button>`}
        </div>
        <div class="mini-muted">Integration IDs: POS ${sup.posVendorId||'—'} · QuickBooks ${sup.qbVendorId||'—'}</div>
      `;

      document.getElementById('btnEditSup')?.addEventListener('click', ()=>openSupplierModal(sup.id));
      document.getElementById('btnToggleSup')?.addEventListener('click', ()=>toggleSupplierStatus(sup.id));
      document.getElementById('btnViewSupItems')?.addEventListener('click', ()=>{
        selectedId = sup.id;
        window.location.hash = `#/procurement/suppliers/${sup.id}/items`;
      });
      document.getElementById('btnCreatePO')?.addEventListener('click', ()=>{
        if (PD.can && !PD.can('create_po')){
          toast('You don\'t have permission to create a PO directly. Please create a PR first.');
          const pr = (PD.createDraftPR ? PD.createDraftPR({ supplierId: sup.id }) : (PD.getOrCreateDraftPR ? PD.getOrCreateDraftPR({ supplierId: sup.id }) : null));
          if (pr){
            try{ sessionStorage.setItem('autoOpenPRAddItemFor', pr.id); }catch(e){}
            window.location.hash = '#/procurement/pr/' + encodeURIComponent(pr.id);
          } else {
            window.location.hash = '#/procurement/pr';
          }
          return;
        }
        window.location.hash = '#/procurement/po';
      });
    }

    // Modal helpers
    function openSupplierModal(id){
      const s = PD.getStore();
      const modal = document.getElementById('supplierModal');
      const title = document.getElementById('supplierModalTitle');
      modal.dataset.editId = id || '';

      const sup = id ? (s.suppliers||[]).find(x=>x.id===id) : null;
      if (title) title.textContent = sup ? 'Edit supplier' : 'New supplier';

      document.getElementById('supName').value = sup?.name || '';
      document.getElementById('supStatus').value = sup?.status || 'Active';
      document.getElementById('supCategory').value = sup?.category || '';
      document.getElementById('supCurrency').value = sup?.currency || 'IDR';
      document.getElementById('supContact').value = sup?.contactName || '';
      document.getElementById('supEmail').value = sup?.email || '';
      document.getElementById('supPhone').value = sup?.phone || '';
      document.getElementById('supTax').value = sup?.taxId || '';
      document.getElementById('supTerms').value = sup?.paymentTerms || 'Due on receipt';
      document.getElementById('supLead').value = String(Number(sup?.leadTimeDays||2));
      document.getElementById('supMOV').value = String(Number(sup?.minOrderValue||0));
      document.getElementById('supWindow').value = sup?.deliveryWindow || '';
      document.getElementById('supAddress').value = sup?.address || '';
      document.getElementById('supPosId').value = sup?.posVendorId || '';
      document.getElementById('supQbId').value = sup?.qbVendorId || '';
      document.getElementById('supBank').value = sup?.bankRef || '';
      document.getElementById('supNotes').value = sup?.notes || '';

      modal?.classList.add('open');
    }

    function saveSupplierFromModal(){
      const s = PD.getStore();
      s.suppliers = s.suppliers || [];
      const modal = document.getElementById('supplierModal');
      const editId = (modal?.dataset.editId || '').trim();

      const name = (document.getElementById('supName')?.value || '').trim();
      if (!name){ toast('Supplier name is required'); return; }

      const payload = {
        name,
        status: (document.getElementById('supStatus')?.value || 'Active'),
        category: (document.getElementById('supCategory')?.value || '').trim(),
        currency: (document.getElementById('supCurrency')?.value || 'IDR'),
        contactName: (document.getElementById('supContact')?.value || '').trim(),
        email: (document.getElementById('supEmail')?.value || '').trim(),
        phone: (document.getElementById('supPhone')?.value || '').trim(),
        taxId: (document.getElementById('supTax')?.value || '').trim(),
        paymentTerms: (document.getElementById('supTerms')?.value || '').trim(),
        leadTimeDays: Math.max(0, Number(document.getElementById('supLead')?.value || 0)),
        minOrderValue: Math.max(0, Number(document.getElementById('supMOV')?.value || 0)),
        deliveryWindow: (document.getElementById('supWindow')?.value || '').trim(),
        address: (document.getElementById('supAddress')?.value || '').trim(),
        posVendorId: (document.getElementById('supPosId')?.value || '').trim(),
        qbVendorId: (document.getElementById('supQbId')?.value || '').trim(),
        bankRef: (document.getElementById('supBank')?.value || '').trim(),
        notes: (document.getElementById('supNotes')?.value || '').trim(),
        updatedAt: PD.nowISO()
      };

      if (editId){
        const idx = s.suppliers.findIndex(x=>x.id===editId);
        if (idx>=0){
          s.suppliers[idx] = Object.assign({}, s.suppliers[idx], payload);
          selectedId = editId;
        }
        toast('Supplier updated');
      } else {
        const id = PD.id ? PD.id('SUP') : ('SUP-' + Math.floor(Math.random()*90000+10000));
        const sup = Object.assign({ id, createdAt: PD.nowISO(), onTimeRate: 92, qualityScore: 90 }, payload);
        s.suppliers.unshift(sup);
        selectedId = id;
        toast('Supplier created');
      }

      PD.saveStore(s);
      document.getElementById('supplierModal')?.classList.remove('open');
      // Refresh KPIs + list
      const m2 = computeSupplierMetrics(s);
      document.getElementById('kpiActive').textContent = String(m2.active);
      document.getElementById('kpiInactive').textContent = String(m2.inactive);
      document.getElementById('kpiOpenPO').textContent = String(m2.openPOs);
      document.getElementById('kpiSpend').textContent = formatIDR(m2.spend);
      renderList();
    }

    function toggleSupplierStatus(id){
      const s = PD.getStore();
      const sup = (s.suppliers||[]).find(x=>x.id===id);
      if (!sup) return;
      sup.status = (sup.status||'Active') === 'Active' ? 'Inactive' : 'Active';
      sup.updatedAt = PD.nowISO();
      PD.saveStore(s);
      toast('Supplier ' + (sup.status==='Active' ? 'reactivated' : 'deactivated'));
      renderList();
    }

    // Initial render
    renderList();
  }

  window.Pages = window.Pages || {};
  window.Pages.suppliers = { render, init };
})();
