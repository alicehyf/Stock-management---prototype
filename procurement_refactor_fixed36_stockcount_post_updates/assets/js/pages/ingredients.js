
function render(){
  return /*html*/`
<section class="view active" id="viewList">

    <div class="breadcrumb">
      <span>Stock management</span>
      <span class="crumb-dot">›</span>
      <span>Ingredients</span>
    </div>

    <div class="page-head">
      <div>
        <h1 class="page-title">Ingredients</h1>
        <p class="page-desc">
          Keep track of ingredients, monitor on-hand levels, and record usage to prevent waste.
        </p>
      </div>
      <button class="primary-btn" id="btnAdd">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        Add ingredient
      </button>
    </div>

    <div class="filters">
      <div class="search-inline">
        <input id="nameFilter" type="text" placeholder="Search by name" />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="M20 20l-3.5-3.5" stroke-linecap="round"></path>
        </svg>
      </div>
    </div>

    <div class="card table-wrap">
      <table id="ingredientsTable">
        <thead>
          <tr>
            <th style="min-width:220px;">Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Cost / Unit</th>
            <th>Current stock</th>
            <th>Reorder point</th>
            <th>Status</th>
            <th>Nearest expiry</th>
            <th style="min-width:120px;">Actions</th>
          </tr>
        </thead>
        <tbody id="ingredientsBody"></tbody>
      </table>
    </div>

</section>

<section class="view" id="viewDetail">
  <div class="breadcrumb">
    <span>Stock management</span>
    <span class="crumb-dot">›</span>
    <span>Ingredients</span>
    <span class="crumb-dot">›</span>
    <span id="detailCrumbName">—</span>
  </div>

  <div class="detail-head">
    <div>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <h1 class="page-title" id="detailTitle" style="margin:0;">—</h1>
        <div class="status-pill" id="detailStatus" style="margin:0;"><span class="dot"></span> Active</div>
      </div>
      <p class="page-desc" style="margin-top:6px;">
        Review stock status, controls, and movement history.
      </p>
    </div>

    <div class="page-actions">
      <button class="back-btn" id="btnBack">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        Back to list
      </button>
    </div>
  </div>

  <div class="card" style="padding:16px;">
    <div class="detail-grid">
      <div class="detail-card">
        <div class="k">Name</div>
        <div class="v"><span id="dName">—</span><span class="muted" style="font-weight:900;" id="dSku">SKU —</span></div>
      </div>

      <div class="detail-card">
        <div class="k">Unit</div>
        <div class="v"><span id="dUnit">—</span><span class="muted" style="font-weight:900;">—</span></div>
      </div>

      <div class="detail-card">
        <div class="k">Unit price (base unit)</div>
        <div class="v"><span id="dUnitPrice">—</span><span class="muted" style="font-weight:900;">—</span></div>
        <div class="sub">Reference unit cost for quick comparisons.</div>
      </div>

      <div class="detail-card">
        <div class="k">Amount (Current stock)</div>
        <div class="v"><span id="dAmount">—</span><span class="muted" style="font-weight:900;">—</span></div>
      </div>

      <div class="detail-card">
        <div class="k">Reorder point</div>
        <div class="v">
          <div style="display:flex;gap:10px;align-items:center;">
            <span id="dReorder">—</span>
            <span class="muted" style="font-weight:900;" id="dReorderUnit">—</span>
          </div>
          <button class="btn-secondary" id="btnEditReorder" type="button" style="height:30px;padding:0 10px;border-radius:10px;">Edit</button>
        </div>
        <div class="sub">Below this point, the system can recommend reorder.</div>
      </div>

      <div class="detail-card">
        <div class="k">Status</div>
        <div class="v"><span id="dActive">Active</span><span class="muted" style="font-weight:900;">—</span></div>
      </div>

      <div class="detail-card">
        <div class="k">Nearest shelf life</div>
        <div class="v"><span id="dShelf">—</span><span class="muted" style="font-weight:900;">—</span></div>
        <div class="sub">Closest batch expiration date among available stock.</div>
      </div>
    </div>
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;">
    <div class="section-title" style="margin:0;">In &amp; Out history</div>
    <div style="display:flex;gap:10px;align-items:center;">
      <button class="btn-secondary" id="btnIssueOut" style="height:38px;padding:0 14px;border-radius:12px;">
        Record issue-out
      </button>
      <button class="primary-btn" id="btnAdjust" style="height:38px;padding:0 14px;border-radius:12px;box-shadow:none;">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        Manual adjustment
      </button>
    </div>
  </div>

  <table class="history-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Reference</th>
        <th>Qty</th>
        <th>Unit</th>
        <th>Balance</th>
        <th>Note</th>
      </tr>
    </thead>
    <tbody id="movementBody"></tbody>
  </table>
</section>

<!-- Add ingredient modal -->
<div class="modal-overlay" id="addIngOverlay" aria-hidden="true">
  <div class="modal" style="width:720px;">
    <div class="modal-head">
      <div>
        <div class="modal-title">Add ingredient</div>
        <div class="modal-sub">Add a new ingredient to your catalog.</div>
      </div>
      <button class="icon-btn" id="btnAddIngClose" aria-label="Close">✕</button>
    </div>
    <div class="modal-body" style="gap:14px;">
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label class="label">Name</label>
          <input class="input" id="addIngName" placeholder="e.g., Coconut milk" />
        </div>
        <div>
          <label class="label">SKU</label>
          <input class="input" id="addIngSku" placeholder="e.g., 2401" />
        </div>
        <div>
          <label class="label">Base unit</label>
          <select class="input" id="addIngUnit">
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="pcs">pcs</option>
          </select>
        </div>
        <div>
          <label class="label">Default cost (IDR / base unit)</label>
          <input class="input" id="addIngCost" type="number" min="0" placeholder="0" />
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" id="btnAddIngCancel">Cancel</button>
        <button class="primary-btn" id="btnAddIngSave">Save</button>
      </div>
    </div>
  </div>
</div>

<!-- Manual adjustment modal -->
<div class="modal-overlay" id="adjustOverlay" aria-hidden="true">
  <div class="modal" style="width:760px;">
    <div class="modal-head">
      <div>
        <div class="modal-title">Manual adjustment</div>
        <div class="modal-sub">Adjust on-hand for the selected ingredient. Recorded as a movement.</div>
      </div>
      <button class="icon-btn" id="btnAdjustClose" aria-label="Close">✕</button>
    </div>

    <div class="modal-body" style="gap:14px;">
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label class="label">Type</label>
          <select class="input" id="adjType">
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </div>
        <div>
          <label class="label">Reason</label>
          <select class="input" id="adjReason">
            <option>Stock count correction</option>
            <option>Damage</option>
            <option>Waste</option>
            <option>Transfer</option>
          </select>
        </div>
        <div>
          <label class="label">Quantity</label>
          <input class="input" id="adjQty" type="number" min="0" value="0" />
        </div>
        <div>
          <label class="label">Date</label>
          <input class="input" id="adjDate" type="date" />
        </div>
      </div>
      <div>
        <label class="label">Note (optional)</label>
        <input class="input" id="adjNote" placeholder="Optional note" />
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" id="btnAdjustCancel">Cancel</button>
        <button class="primary-btn" id="btnAdjustSave">Save</button>
      </div>
    </div>
  </div>
</div>
`;
}

async function init(){
  const PD = window.ProcurementDemo;
  const UI = window.UI;

  function toast(msg){ UI?.toast?.(msg); }

  function todayISO(){
    const d = new Date();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function computeStockStatus(onHand, reorderPoint){
    const stock = Number(onHand||0);
    const rp = Number(reorderPoint||0);
    if (stock <= 0) return 'Out';
    if (rp > 0 && stock < rp) return 'Low';
    return 'OK';
  }

  function daysBetweenISO(aISO, bISO){
    try{
      const a = new Date(aISO + 'T00:00:00');
      const b = new Date(bISO + 'T00:00:00');
      const ms = b.getTime() - a.getTime();
      return Math.round(ms / (1000*60*60*24));
    }catch(e){ return null; }
  }

  function computeExpiryInfo(nearestExpiryISO){
    const raw = String(nearestExpiryISO || '—').trim();
    if (!raw || raw === '—') return { tagClass:'neutral', label:'—', title:'No expiry tracked', days:null, date:'—' };
    const today = todayISO();
    const d = daysBetweenISO(today, raw);
    if (d === null || isNaN(d)) return { tagClass:'neutral', label: raw, title:'Expiry date', days:null, date:raw };

    if (d < 0) return { tagClass:'bad', label:`Expired · ${Math.abs(d)}d`, title:`Expired on ${raw}`, days:d, date:raw };
    if (d <= 2) return { tagClass:'bad', label:`${raw} · ${d}d`, title:`Expires in ${d} day(s)`, days:d, date:raw };
    if (d <= 7) return { tagClass:'pending', label:`${raw} · ${d}d`, title:`Expires in ${d} day(s)`, days:d, date:raw };
    if (d <= 14) return { tagClass:'neutral', label:`${raw} · ${d}d`, title:`Expires in ${d} day(s)`, days:d, date:raw };
    return { tagClass:'ok', label:`${raw} · ${d}d`, title:`Expires in ${d} day(s)`, days:d, date:raw };
  }

  function computeStockBar(onHand, reorderPoint){
    const stock = Number(onHand||0);
    const rp = Number(reorderPoint||0);
    if (!rp || rp <= 0) return { pct:0, title:'No reorder point set', has:false };
    const pct = Math.max(0, Math.min(100, Math.round((stock / rp) * 100)));
    return { pct, title:`Stock vs reorder point (${rp})`, has:true };
  }

  const meta = {
    '1001': { category:'Spices', nearestExpiry:'2026-06-30' },
    '1002': { category:'Condiments', nearestExpiry:'2027-01-10' },
    '1005': { category:'Spices', nearestExpiry:'2026-05-15' },
    '1008': { category:'Dairy', nearestExpiry:'2026-03-10' },
    '1012': { category:'Dairy', nearestExpiry:'2026-02-05' },
    '1016': { category:'Dairy', nearestExpiry:'2026-02-07' },
    '2001': { category:'Produce', nearestExpiry:'2026-01-31' },
    '2002': { category:'Produce', nearestExpiry:'2026-01-30' },
    '2006': { category:'Produce', nearestExpiry:'—' },
    '3001': { category:'Meat', nearestExpiry:'2026-02-12' },
    '5001': { category:'Meat', nearestExpiry:'2026-02-02' }
  };

  const defaultRPs = {
    '1001': 500,
    '1002': 1000,
    '1005': 300,
    '1008': 8000,
    '1012': 20000,
    '1016': 180,
    '2001': 5000,
    '2002': 2000,
    '2006': 8000,
    '3001': 5000,
    '5001': 15000
  };

  function getStore(){
    return PD?.getStore?.() || {};
  }

  function pickSupplierName(store, sku){
    const supplierItem = (store.supplierItems||[]).find(si=> si.active && String(si.sku)===String(sku)) || null;
    const supplier = supplierItem ? (store.suppliers||[]).find(s=> String(s.id)===String(supplierItem.supplierId)) : null;
    return supplier ? supplier.name : '—';
  }

  function pickUnitCost(store, sku){
    const supplierItem = (store.supplierItems||[]).find(si=> si.active && String(si.sku)===String(sku)) || null;
    if (supplierItem && supplierItem.unitPrice!=null) return Number(supplierItem.unitPrice||0);
    const item = (store.items||[]).find(it=>String(it.sku)===String(sku));
    return item ? Number(item.defaultCost||0) : 0;
  }

  function getSkuFromHash(){
    const raw = (window.location.hash||'').split('?')[0];
    const parts = raw.split('/');
    // #/inventory/ingredients/<sku>
    const idx = parts.indexOf('ingredients');
    if (idx>=0 && parts.length>idx+1){
      const v = (parts[idx+1]||'').trim();
      if (!v) return '';
      // Back-compat for old slug
      if (v === 'anise-star') return '1001';
      return v;
    }
    return '';
  }

  function navigateToDetail(sku){
    window.location.hash = '#/inventory/ingredients/' + encodeURIComponent(String(sku));
  }

  function showList(){
    document.getElementById('viewList')?.classList.add('active');
    document.getElementById('viewDetail')?.classList.remove('active');
  }

  function showDetail(){
    document.getElementById('viewList')?.classList.remove('active');
    document.getElementById('viewDetail')?.classList.add('active');
  }

  function renderList(){
    const store = getStore();
    const tbody = document.getElementById('ingredientsBody');
    if (!tbody) return;

    const allowSkus = new Set(['1001','1002','1005','1008','1012','1016','2001','2002','2006','3001','5001']);
    const filter = (document.getElementById('nameFilter')?.value || '').trim().toLowerCase();

    const items = (store.items||[])
      .map(it=>({
        sku: String(it.sku||'').trim(),
        name: it.name || '—',
        uom: it.uom || 'unit',
        category: it.category || '—'
      }))
      .filter(it=> it.sku && allowSkus.has(it.sku))
      .filter(it=> !filter || String(it.name).toLowerCase().includes(filter));

    tbody.innerHTML = '';

    items.forEach(it=>{
      const sku = it.sku;
      const m = meta[sku] || {};
      const supplierName = pickSupplierName(store, sku);
      const cost = pickUnitCost(store, sku);
      const onHand = Number(store.inventory?.balances?.[sku] || 0);
      const rp = Number((store.settings && store.settings.reorderPoints && store.settings.reorderPoints[sku]) ?? (defaultRPs[sku] ?? 0));
      const status = computeStockStatus(onHand, rp);
      const statusTagClass = (status === 'OK') ? 'ok' : (status === 'Low') ? 'pending' : 'bad';
      const statusHTML = `<span class="tag ${statusTagClass}" title="Stock status"><span class="dot"></span>${status}</span>`;

      const sb = computeStockBar(onHand, rp);
      const stockHTML = `
        <div class="stock-cell">
          <div class="mono">${onHand.toLocaleString('en-US')}</div>
          <div class="stock-bar ${statusTagClass}${sb.has ? '' : ' neutral'}" title="${sb.title}">
            <div class="fill" style="width:${sb.pct}%"></div>
          </div>
        </div>`;

      const expISO = (store.inventory && store.inventory.expiryBySku && store.inventory.expiryBySku[sku] != null)
        ? String(store.inventory.expiryBySku[sku] || '—')
        : String(m.nearestExpiry || '—');
      const exp = computeExpiryInfo(expISO);
      const expiryHTML = `<span class="tag ${exp.tagClass}" title="${exp.title}"><span class="dot"></span>${exp.label}</span>`;

      const tr = document.createElement('tr');
      tr.classList.add('clickable-row');
      tr.dataset.sku = sku;
      tr.innerHTML = `
        <td class="name">${it.name}</td>
        <td class="muted">${sku}</td>
        <td class="muted">${m.category || it.category}</td>
        <td class="muted">${supplierName}</td>
        <td class="muted price-idr">${cost ? ('IDR ' + cost) : '—'}</td>
        <td class="muted">${stockHTML}</td>
        <td class="muted">${rp || '—'}</td>
        <td>${statusHTML}</td>
        <td>${expiryHTML}</td>
        <td>
          <div class="actions">
            <div class="mini-ico" title="Delete">
              <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
            </div>
            <div class="mini-ico" title="Edit">
              <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Re-apply currency formatting for newly rendered cells
    document.querySelectorAll('.price-idr').forEach(td => {
      const t = String(td.textContent||'').trim();
      if (t && t !== '—' && !t.startsWith('IDR')) td.textContent = 'IDR ' + t;
    });
  }

  function renderDetail(sku){
    const store = getStore();
    const item = (store.items||[]).find(it=>String(it.sku)===String(sku)) || { name:'—', uom:'unit' };
    const m = meta[String(sku)] || {};

    const name = item.name || '—';
    const baseUom = PD?.getUomMeta ? (PD.getUomMeta(store, sku).baseUom) : (item.uom||'unit');
    const uomMeta = PD?.getUomMeta ? PD.getUomMeta(store, sku) : { baseUom: baseUom, purchaseUom:'', purchaseToBase:0 };

    const onHand = Number(store.inventory?.balances?.[String(sku)] || 0);
    const rp = Number((store.settings && store.settings.reorderPoints && store.settings.reorderPoints[String(sku)]) ?? (defaultRPs[String(sku)] ?? 0));

    document.getElementById('detailCrumbName').textContent = name;
    document.getElementById('detailTitle').textContent = name;
    document.getElementById('dName').textContent = name;
    document.getElementById('dSku').textContent = 'SKU ' + sku;

    const unitText = (uomMeta.purchaseUom && uomMeta.purchaseToBase)
      ? `${uomMeta.baseUom} (base) · ${uomMeta.purchaseUom} (purchase)`
      : `${uomMeta.baseUom}`;
    document.getElementById('dUnit').textContent = unitText;

    const cost = pickUnitCost(store, sku);
    document.getElementById('dUnitPrice').textContent = cost ? (`IDR ${cost} / ${uomMeta.baseUom}`) : '—';

    const q = PD?.formatQty ? PD.formatQty(store, sku, onHand, true) : { primary: onHand + ' ' + uomMeta.baseUom, secondary:'' };
    document.getElementById('dAmount').textContent = q.primary + (q.secondary ? ` (${q.secondary})` : '');

    document.getElementById('dReorder').textContent = (rp ? rp.toLocaleString('en-US') : '—');
    const rpUnitEl = document.getElementById('dReorderUnit');
    if (rpUnitEl) rpUnitEl.textContent = uomMeta.baseUom;

    const expISO = (store.inventory && store.inventory.expiryBySku && store.inventory.expiryBySku[String(sku)] != null)
      ? String(store.inventory.expiryBySku[String(sku)] || '—')
      : String(m.nearestExpiry || '—');
    const exp = computeExpiryInfo(expISO);
    document.getElementById('dShelf').textContent = exp.date || '—';

    // Status pill based on onHand vs rp
    const status = computeStockStatus(onHand, rp);
    const pill = document.getElementById('detailStatus');
    if (pill){
      const cls = (status==='OK') ? 'ok' : (status==='Low') ? 'pending' : 'bad';
      pill.className = 'status-pill ' + cls;
      pill.innerHTML = `<span class="dot"></span> ${status}`;
    }

    renderMovements(sku);

    const role = (PD.getRole ? PD.getRole() : 'staff');
    const canManageRP = PD.can ? PD.can('manage_reorder_points') : (role === 'owner');
    // Reorder point shortcut: edit / view the reorder point for this SKU
    const btnEditReorder = document.getElementById('btnEditReorder');
    if (btnEditReorder){
      if (!canManageRP){
        btnEditReorder.textContent = 'View';
      }
      btnEditReorder.onclick = ()=>{ window.location.hash = `#/inventory/reorder-points?sku=${encodeURIComponent(String(sku))}`; };
    }


    // Wire issue-out shortcut
    const btnIssueOut = document.getElementById('btnIssueOut');
    if (btnIssueOut){
      btnIssueOut.onclick = () => { window.location.hash = `#/inventory/usage?sku=${encodeURIComponent(String(sku))}`; };
    }

    // Save current sku for adjustment
    window.__ingredientsCurrentSku = String(sku);
  }

  function renderMovements(sku){
    const store = getStore();
    const tbody = document.getElementById('movementBody');
    if (!tbody) return;
    const uomMeta = PD?.getUomMeta ? PD.getUomMeta(store, sku) : { baseUom:'unit' };

    const rows = (store.inventory && store.inventory.movements && Array.isArray(store.inventory.movements[String(sku)]))
      ? store.inventory.movements[String(sku)].slice(0,40)
      : [];

    tbody.innerHTML = '';
    if (!rows.length){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="muted" colspan="7">No movements yet.</td>`;
      tbody.appendChild(tr);
      return;
    }

    rows.forEach(m=>{
      const type = (m.type==='OUT') ? 'OUT' : 'IN';
      const badge = type === 'IN' ? '<span class="badge-in">IN</span>' : '<span class="badge-out">OUT</span>';
      const qty = Number(m.qty||0);
      const qtyText = (type==='IN' ? '+' : '-') + qty.toLocaleString('en-US');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="muted">${m.date || ''}</td>
        <td>${badge}</td>
        <td class="muted">${m.reference || ''}</td>
        <td>${qtyText}</td>
        <td class="muted">${m.unit || uomMeta.baseUom}</td>
        <td>${Number(m.balance||0).toLocaleString('en-US')}</td>
        <td class="muted">${m.note || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function route(){
    const sku = getSkuFromHash();
    if (sku){
      showDetail();
      renderDetail(sku);
    } else {
      showList();
      renderList();
    }
  }

  // List interactions
  const tbody = document.getElementById('ingredientsBody');
  if (tbody){
    tbody.addEventListener('click', (e)=>{
      const insideAction = e.target.closest('.mini-ico');
      if (insideAction) return;
      const tr = e.target.closest('tr');
      const sku = tr?.dataset?.sku;
      if (sku) navigateToDetail(sku);
    });
  }
  document.getElementById('nameFilter')?.addEventListener('input', ()=>{ renderList(); });

  // Back button
  document.getElementById('btnBack')?.addEventListener('click', ()=>{ window.location.hash = '#/inventory/ingredients'; });

  // Add ingredient modal (lightweight demo behavior)
  const addIngOverlay = document.getElementById('addIngOverlay');
  const openAdd = ()=>{
    addIngOverlay?.classList.add('open');
    addIngOverlay?.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    setTimeout(()=>document.getElementById('addIngName')?.focus(), 50);
  };
  const closeAdd = ()=>{
    addIngOverlay?.classList.remove('open');
    addIngOverlay?.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  };
  document.getElementById('btnAdd')?.addEventListener('click', openAdd);
  document.getElementById('btnAddIngClose')?.addEventListener('click', closeAdd);
  document.getElementById('btnAddIngCancel')?.addEventListener('click', closeAdd);
  addIngOverlay?.addEventListener('click', (e)=>{ if (e.target===addIngOverlay) closeAdd(); });
  document.getElementById('btnAddIngSave')?.addEventListener('click', ()=>{
    const name = (document.getElementById('addIngName')?.value || '').trim();
    const sku = (document.getElementById('addIngSku')?.value || '').trim();
    const uom = (document.getElementById('addIngUnit')?.value || 'unit').trim();
    const cost = Number(document.getElementById('addIngCost')?.value || 0);
    if (!name || !sku){ toast('Please enter name and SKU'); return; }
    const store = getStore();
    store.items = store.items || [];
    if (!store.items.find(it=>String(it.sku)===String(sku))){
      store.items.push({ sku, name, uom, category:'Other', defaultCost: cost });
      store.inventory = store.inventory || { balances:{}, movements:{} };
      store.inventory.balances = store.inventory.balances || {};
      if (store.inventory.balances[sku]==null) store.inventory.balances[sku] = 0;
      PD?.saveStore?.(store);
    }
    toast('Ingredient added');
    closeAdd();
    renderList();
  });

  // Manual adjustment
  const adjustOverlay = document.getElementById('adjustOverlay');
  const openAdjust = ()=>{
    document.getElementById('adjQty').value = 0;
    document.getElementById('adjDate').value = todayISO();
    document.getElementById('adjNote').value = '';
    adjustOverlay?.classList.add('open');
    adjustOverlay?.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    setTimeout(()=>document.getElementById('adjQty')?.focus(), 50);
  };
  const closeAdjust = ()=>{
    adjustOverlay?.classList.remove('open');
    adjustOverlay?.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  };

  document.getElementById('btnAdjust')?.addEventListener('click', ()=>{
    if (!window.__ingredientsCurrentSku){
      toast('Open an ingredient to adjust stock');
      return;
    }
    openAdjust();
  });
  document.getElementById('btnAdjustClose')?.addEventListener('click', closeAdjust);
  document.getElementById('btnAdjustCancel')?.addEventListener('click', closeAdjust);
  adjustOverlay?.addEventListener('click', (e)=>{ if (e.target===adjustOverlay) closeAdjust(); });

  document.getElementById('btnAdjustSave')?.addEventListener('click', ()=>{
    const sku = String(window.__ingredientsCurrentSku||'').trim();
    if (!sku){ toast('No ingredient selected'); return; }
    const store = getStore();
    store.inventory = store.inventory || { balances:{}, movements:{} };
    store.inventory.balances = store.inventory.balances || {};
    store.inventory.movements = store.inventory.movements || {};
    if (!Array.isArray(store.inventory.movements[sku])) store.inventory.movements[sku] = [];

    const type = document.getElementById('adjType')?.value || 'IN';
    const reason = document.getElementById('adjReason')?.value || 'Stock count correction';
    const qty = Number(document.getElementById('adjQty')?.value || 0);
    const date = document.getElementById('adjDate')?.value || todayISO();
    const noteExtra = (document.getElementById('adjNote')?.value || '').trim();

    if (!(qty>0)) { toast('Please enter quantity'); return; }

    const metaU = PD?.getUomMeta ? PD.getUomMeta(store, sku) : { baseUom:'unit' };
    const qtyBase = PD?.toBaseQty ? PD.toBaseQty(store, sku, qty, metaU.baseUom) : qty;

    const prev = Number(store.inventory.balances[sku]||0);
    let next = prev;
    if (type==='IN') next = prev + qtyBase;
    else {
      if (qtyBase > prev){
        toast('Cannot reduce below zero');
        return;
      }
      next = prev - qtyBase;
    }

    store.inventory.balances[sku] = next;
    store.inventory.movements[sku].unshift({
      date,
      type,
      reference: 'Manual adjustment',
      qty: qtyBase,
      unit: metaU.baseUom,
      balance: next,
      note: reason + (noteExtra ? ' · ' + noteExtra : '')
    });

    PD?.saveStore?.(store);
    toast('Adjustment recorded');
    closeAdjust();
    renderDetail(sku);
  });

  // Initial render + bind routing
  renderList();
  route();
  window.addEventListener('hashchange', route);
}

window.Pages = window.Pages || {};
window.Pages.ingredients = { render, init };
