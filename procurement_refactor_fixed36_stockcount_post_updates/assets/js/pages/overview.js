function render(){
  return /*html*/`
<div class="breadcrumb">
      <span>Procurement</span>
      <span class="crumb-dot">›</span>
      <span>Overview</span>
    </div>

    <div class="page-head">
      <div>
        <h1 class="page-title">Procurement overview</h1>
        <p class="page-desc">Track what needs ordering, what’s already on the way, and what was delivered—so you only pay for what’s delivered.</p>
      </div>

      <div class="right-actions">
        <button class="btn-secondary" id="btnNewPO">New purchase order</button>
        <button class="primary-btn" id="btnQuickReceive">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Quick receive
        </button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="card kpi span-3">
        <div class="k">Items to reorder</div>
        <div class="v">8</div>
        <div class="s">Based on reorder points from stock management.</div>
      </div>
      <div class="card kpi span-3">
        <div class="k">Open purchase orders</div>
        <div class="v">3</div>
        <div class="s">Draft / sent orders awaiting delivery.</div>
      </div>
      <div class="card kpi span-3">
        <div class="k">Expected deliveries (7 days)</div>
        <div class="v">5</div>
        <div class="s">ETAs from suppliers for upcoming deliveries.</div>
      </div>
      <div class="card kpi span-3">
        <div class="k">Credits to verify</div>
        <div class="v" id="kpiCredits">IDR 135,000</div>
        <div class="s">Auto-logged when delivered &lt; ordered.</div>
      </div>
    </div>

    <div class="split">
      <section class="card panel col-7">
        <div class="panel-head">
          <div>
            <div class="panel-title">Reorder recommendations</div>
            <div class="panel-sub">Suggested orders based on on-hand plus open POs (in transit).</div>
          </div>
          <div class="chips">
            <button class="chip active" type="button" data-filter="all" id="chipAll">All <span class="count" id="countAll">0</span></button>
            <button class="chip" type="button" data-filter="urgent" id="chipUrgent">Urgent <span class="count" id="countUrgent">0</span></button>
            <button class="chip" type="button" data-filter="soon" id="chipSoon">Soon <span class="count" id="countSoon">0</span></button>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;align-items:center;flex-wrap:wrap;">
          <div class="cell-muted" id="selHint" style="margin-right:auto;font-size:12px;">Select items below to create a draft PR or PO.</div>
          <button class="btn-secondary" id="btnAddAllToPR" type="button" disabled>Add selected to draft PR</button>

          <!-- NOTE: Disabled buttons do not reliably show the title tooltip in some browsers.
               Wrap the PO button so Staff users still get a hover/click hint. -->
          <span id="wrapCreatePOs" class="hint-wrap" style="display:inline-flex;" title="">
            <button class="primary-btn" id="btnCreatePOs" type="button" disabled>Create PO draft(s)</button>
          </span>
        </div>

        <div id="bulkResult" class="banner" style="display:none;margin-top:10px;">
          <div>
            <div class="b-title" id="bulkTitle">Done</div>
            <div class="b-sub" id="bulkSub">.</div>
          </div>
          <button class="btn-secondary" id="bulkGo" type="button">Open</button>
        </div>

        <div class="table-wrap" style="margin-top:12px;">
          <table class="count-table proc-reorder-table" id="reorderTable">
          <thead>
            <tr>
              <th style="width:44px;"><input type="checkbox" id="selAll" aria-label="Select all" /></th>
              <th>Item</th>
              <th>Supplier</th>
              <th>On hand</th>
              <th>On order</th>
              <th>Reorder point</th>
              <th>Suggested order</th>
              <th style="text-align:right;">Est cost</th>
            </tr>
          </thead>
          <tbody id="reorderTbody"></tbody>
          </table>
        </div>

        <div class="hint" style="margin-top:10px;">Tip: Filter by urgency, add items to a draft PR, or generate PO drafts per supplier.</div>
      </section>

      <section class="card panel col-5">
        <div class="panel-head">
          <div>
            <div class="panel-title">Deliveries & credits</div>
            <div class="panel-sub">Log deliveries, detect short shipments, and track credits.</div>
          </div>
          <div class="pill"><span class="dot"></span> Updated today</div>
        </div>

        <div class="banner ok" style="margin-top:12px;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <div class="dot" style="width:10px;height:10px;border-radius:999px;margin-top:4px;"></div>
            <div>
              <div class="b-title">Auto credit logging</div>
              <div class="b-sub">When delivered quantity is less than ordered, credits are created so you only pay for what’s delivered.</div>
            </div>
          </div>
          <button class="btn-secondary" id="btnViewCredits" type="button">View credits</button>
        </div>

        <div class="table-wrap" style="margin-top:12px;">
          <table class="count-table proc-delivery-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>Status</th>
              <th style="text-align:right;">Credit</th>
            </tr>
          </thead>
          <tbody>
  <tr>
    <td class="mono cell-muted">2026-01-27</td>
    <td style="font-weight:900;">Fresh Market</td>
    <td><span class="tag review"><span class="dot"></span> Short shipped</span></td>
    <td style="text-align:right;" class="mono">IDR 135,000</td>
  </tr>
  <tr>
    <td class="mono cell-muted">2026-01-26</td>
    <td style="font-weight:900;">Dairy Co.</td>
    <td><span class="tag counted"><span class="dot"></span> Received</span></td>
    <td style="text-align:right;" class="mono">IDR 0</td>
  </tr>
  <tr>
    <td class="mono cell-muted">2026-01-26</td>
    <td style="font-weight:900;">Butcher</td>
    <td><span class="tag counted"><span class="dot"></span> Received</span></td>
    <td style="text-align:right;" class="mono">IDR 0</td>
  </tr>
</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}


async function init(){
  const PD = window.ProcurementDemo || {};
  const { addItemToDraftPR } = PD;

  // Permissions (staff can create PRs but not POs / receiving operations)
  const canCreatePO = (PD.can ? PD.can('create_po') : ((PD.getRole?.()||'staff') === 'owner'));
  const canCreateReceiving = (PD.can ? PD.can('create_receiving') : ((PD.getRole?.()||'staff') === 'owner'));

  // Helpers
  function urgencyBucket(sg){
    // Urgent: on-hand <= 25% of reorder point OR zero stock
    const rp = Math.max(1, Number(sg.reorderPointBase||0));
    const on = Number((sg.effectiveOnHandBase!=null ? sg.effectiveOnHandBase : (Number(sg.onHandBase||0)+Number(sg.onOrderBase||0))));
    if (on <= 0) return 'urgent';
    const ratio = on / rp;
    return (ratio <= 0.25) ? 'urgent' : 'soon';
  }

  // KPI: credits to verify (Open)
  try{
    const store = PD.getStore?.();
    const openTotal = (store?.credits||[])
      .filter(c => (c.status||'Open') === 'Open')
      .reduce((s,c)=> s + (c.items||[]).reduce((ss,it)=> ss + Number(it.amount||0), 0), 0);
    const el = document.getElementById('kpiCredits');
    if (el) el.textContent = 'IDR ' + Number(openTotal||0).toLocaleString('en-US');
  } catch(e){ /* ignore */ }

  // Header actions
  const btnNewPO = document.getElementById('btnNewPO');
  const btnQuickReceive = document.getElementById('btnQuickReceive');
  const btnViewCredits = document.getElementById('btnViewCredits');

  // Enforce staff permissions for operational actions
  if (btnNewPO){
    btnNewPO.disabled = !canCreatePO;
    btnNewPO.title = canCreatePO ? '' : 'Permission required: Create PO';
    btnNewPO.addEventListener('click', () => {
      if (!canCreatePO){ PD.toast?.('Permission required: Create PO'); return; }
      window.location.hash = '#/procurement/po';
    });
  }

  if (btnQuickReceive){
    btnQuickReceive.disabled = !canCreateReceiving;
    btnQuickReceive.title = canCreateReceiving ? '' : 'Permission required: Create PO';
    btnQuickReceive.addEventListener('click', () => {
      if (!canCreateReceiving){ PD.toast?.('Permission required: Create PO'); return; }
      window.location.hash = '#/procurement/receiving';
    });
  }

  btnViewCredits?.addEventListener('click', () => window.location.hash = '#/procurement/vendor-credits');

  // Suggested ordering table (reorder -> PR/PO)
  const tbody = document.getElementById('reorderTbody');
  const chipAll = document.getElementById('chipAll');
  const chipUrgent = document.getElementById('chipUrgent');
  const chipSoon = document.getElementById('chipSoon');
  const countAll = document.getElementById('countAll');
  const countUrgent = document.getElementById('countUrgent');
  const countSoon = document.getElementById('countSoon');
  const btnAddAllToPR = document.getElementById('btnAddAllToPR');
  const btnCreatePOs = document.getElementById('btnCreatePOs');
  const wrapCreatePOs = document.getElementById('wrapCreatePOs');
  const selAll = document.getElementById('selAll');
  const selHint = document.getElementById('selHint');
  const bulkResult = document.getElementById('bulkResult');
  const bulkTitle = document.getElementById('bulkTitle');
  const bulkSub = document.getElementById('bulkSub');
  const bulkGo = document.getElementById('bulkGo');

  let suggestions = [];
  let currentFilter = 'all';
  let selectedSkus = new Set();

  // Hint for Staff users: disabled buttons don't always show tooltips.
  // We attach tooltip + click-to-toast on the wrapper element.
  if (wrapCreatePOs){
    wrapCreatePOs.title = canCreatePO ? '' : 'Permission required: Create PO';
    wrapCreatePOs.style.cursor = canCreatePO ? '' : 'not-allowed';
    wrapCreatePOs.addEventListener('click', (e) => {
      if (!canCreatePO){
        e.preventDefault();
        PD.toast?.('Permission required: Create PO');
      }
    });
  }

  // Keep a title on the button too (harmless, but wrapper is the reliable hint)
  if (btnCreatePOs) btnCreatePOs.title = canCreatePO ? '' : 'Permission required: Create PO';

  function setBulkEnabled(){
    const n = selectedSkus.size;
    const has = n > 0;
    if (btnAddAllToPR) btnAddAllToPR.disabled = !has;
    if (btnCreatePOs) btnCreatePOs.disabled = (!has) || (!canCreatePO);
    if (selHint) selHint.textContent = has ? `${n} item${n===1?'':'s'} selected` : 'Select items below to create a draft PR or PO.';
    if (!has && bulkResult) bulkResult.style.display = 'none';
  }

  function clearSelection(){
    selectedSkus = new Set();
    if (selAll) selAll.checked = false;
    setBulkEnabled();
  }

  function setActiveChip(filter){
    currentFilter = filter;
    [chipAll, chipUrgent, chipSoon].forEach(ch=> ch?.classList.remove('active'));
    if (filter === 'urgent') chipUrgent?.classList.add('active');
    else if (filter === 'soon') chipSoon?.classList.add('active');
    else chipAll?.classList.add('active');
  }

  function filteredSuggestions(){
    if (currentFilter === 'urgent') return suggestions.filter(sg=> urgencyBucket(sg)==='urgent');
    if (currentFilter === 'soon') return suggestions.filter(sg=> urgencyBucket(sg)==='soon');
    return suggestions;
  }

  function updateCounts(){
    const all = suggestions.length;
    const urgent = suggestions.filter(sg=> urgencyBucket(sg)==='urgent').length;
    const soon = suggestions.filter(sg=> urgencyBucket(sg)==='soon').length;
    if (countAll) countAll.textContent = String(all);
    if (countUrgent) countUrgent.textContent = String(urgent);
    if (countSoon) countSoon.textContent = String(soon);
  }

  function renderTable(){
    const rows = filteredSuggestions();
    if (!tbody) return;
    if (!rows.length){
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="cell-muted">${suggestions.length ? 'No items in this view.' : 'All items are above their reorder points.'}</td>
        </tr>
      `;
      clearSelection();
      return;
    }

    tbody.innerHTML = rows.map(sg=>{
      const store = PD.getStore?.();
      const on = PD.formatQty ? PD.formatQty(store, sg.sku, sg.onHandBase, false) : { primary: (sg.onHandBase+' '+sg.baseUom), secondary:'' };
      const oo = PD.formatQty ? PD.formatQty(store, sg.sku, (sg.onOrderBase||0), false) : { primary: ((sg.onOrderBase||0)+' '+sg.baseUom), secondary:'' };
      const rp = PD.formatQty ? PD.formatQty(PD.getStore?.(), sg.sku, sg.reorderPointBase, false) : { primary: (sg.reorderPointBase+' '+sg.baseUom), secondary:'' };
      const sug = PD.formatQty ? PD.formatQty(PD.getStore?.(), sg.sku, sg.suggestedBase, true) : { primary: (sg.suggestedPurchaseQty+' '+sg.suggestedPurchaseUom), secondary:(sg.suggestedBase+' '+sg.baseUom) };
      const est = Math.round(Number(sg.suggestedPurchaseQty||0) * Number(sg.unitPricePurchase||0));
      const badge = urgencyBucket(sg);
      const badgeHtml = badge === 'urgent'
        ? `<span class="tag review" style="margin-left:8px;"><span class="dot"></span> Urgent</span>`
        : `<span class="tag counted" style="margin-left:8px;"><span class="dot"></span> Soon</span>`;

      return `
        <tr>
          <td style="width:44px;">
            <input type="checkbox" class="row-sel" data-sku="${sg.sku}" aria-label="Select ${sg.name}" ${selectedSkus.has(String(sg.sku)) ? 'checked' : ''}/>
          </td>
          <td style="font-weight:900;">${sg.name}${badgeHtml}</td>
          <td>${sg.supplier||'—'}</td>
          <td class="mono">${on.primary}</td>
          <td class="mono">${oo.primary}</td>
          <td class="mono">${rp.primary}</td>
          <td class="mono">
            <div>${sug.primary}</div>
            ${sug.secondary ? `<div class="cell-muted" style="font-size:12px;">${sug.secondary}</div>` : ''}
          </td>
          <td style="text-align:right;" class="mono">IDR ${Number(est||0).toLocaleString('en-US')}</td>
        </tr>
      `;
    }).join('');

    // Wire selection checkboxes
    const rowBoxes = Array.from(tbody.querySelectorAll('.row-sel'));
    rowBoxes.forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const sku = String(cb.getAttribute('data-sku'));
        if (cb.checked) selectedSkus.add(sku); else selectedSkus.delete(sku);
        if (selAll){
          selAll.checked = rowBoxes.length > 0 && rowBoxes.every(x=>x.checked);
        }
        setBulkEnabled();
      });
    });

    if (selAll){
      // Update select-all state on every render
      selAll.checked = rowBoxes.length > 0 && rowBoxes.every(x=>x.checked);
    }

    setBulkEnabled();
  }

  function createPODraftFromSuggestionLines(supplierId, lines){
    if (!Array.isArray(lines) || !lines.length) return null;
    const store = PD.getStore?.();
    if (!store) return null;
    const sid = String(supplierId||'').trim();
    const sup = (store.suppliers||[]).find(s=> String(s.id)===sid);
    const lead = sup ? Number(sup.leadTimeDays||0) : 2;
    const expected = new Date(Date.now() + Math.max(1,lead)*86400000).toISOString().slice(0,10);
    const po = {
      id: PD.id ? PD.id('PO') : ('PO-' + Math.floor(Math.random()*90000+10000)),
      createdAt: PD.nowISO ? PD.nowISO() : new Date().toISOString(),
      supplierId: sid,
      supplier: sup ? sup.name : '—',
      location: 'Main kitchen',
      expectedDate: expected,
      status: 'Draft',
      linkedPR: '—',
      items: [],
      activity: [{ at: PD.nowISO ? PD.nowISO() : new Date().toISOString(), text: 'PO created from reorder recommendations' }]
    };
    lines.forEach(sg=>{
      const qty = Number(sg.suggestedPurchaseQty||0);
      if (!(qty>0)) return;
      const uom = sg.suggestedPurchaseUom || sg.baseUom;
      const unitPrice = Math.max(0, Number(sg.unitPricePurchase||0));
      po.items.push({ name: sg.name, sku: sg.sku, uom: uom, orderedQty: qty, receivedQty: 0, unitPrice: unitPrice });
    });
    store.pos = store.pos || [];
    store.pos.unshift(po);
    PD.saveStore?.(store);
    return po;
  }
  try{
    suggestions = PD.getSuggestedOrders ? PD.getSuggestedOrders({ bufferFactor: 1.2 }) : [];
    updateCounts();
    setActiveChip('all');
    renderTable();

    selAll?.addEventListener('change', ()=>{
      const boxes = Array.from(document.querySelectorAll('#reorderTbody .row-sel'));
      boxes.forEach(cb=>{ cb.checked = !!selAll.checked; });
      selectedSkus = new Set(boxes.filter(cb=>cb.checked).map(cb=>String(cb.getAttribute('data-sku'))));
      setBulkEnabled();
    });

    bulkGo?.addEventListener('click', ()=>{
      const target = bulkGo.getAttribute('data-target');
      if (target) window.location.hash = target;
    });

    // Filter chips
    chipAll?.addEventListener('click', ()=>{ setActiveChip('all'); clearSelection(); renderTable(); });
    chipUrgent?.addEventListener('click', ()=>{ setActiveChip('urgent'); clearSelection(); renderTable(); });
    chipSoon?.addEventListener('click', ()=>{ setActiveChip('soon'); clearSelection(); renderTable(); });

    // Bulk actions (selected = checked rows)
    btnAddAllToPR?.addEventListener('click', ()=>{
      const rows = filteredSuggestions().filter(sg=> selectedSkus.has(String(sg.sku)));
      if (!rows.length){ PD.toast?.('Select at least 1 item'); return; }
      // Create a fresh Draft PR for this action (clearer for first-time users)
      const store = PD.getStore?.();
      if (!store){ PD.toast?.('Unable to load store'); return; }
      store.prs = store.prs || [];
      const pr = {
        id: PD.id ? PD.id('PR') : ('PR-' + Math.floor(Math.random()*90000+10000)),
        createdAt: PD.nowISO ? PD.nowISO() : new Date().toISOString(),
        requester: 'HY',
        scope: 'Full store',
        location: 'Main kitchen',
        neededBy: new Date(Date.now()+7*86400000).toISOString().slice(0,10),
        status: 'Draft',
        approvals: [],
        items: [],
        preferredSupplierId: null,
        activity: [{ at: PD.nowISO ? PD.nowISO() : new Date().toISOString(), text: 'Draft requisition created from reorder recommendations' }]
      };
      store.prs.unshift(pr);

      // Add selected recommendation lines into the new draft PR
      rows.forEach(sg=>{
        const line = {
          name: sg.name,
          sku: sg.sku,
          uom: sg.baseUom,
          qty: sg.suggestedBase,
          estUnitPrice: sg.unitPriceBase,
          supplierId: sg.supplierId,
          supplier: sg.supplier
        };
        const found = pr.items.find(x => x.sku === line.sku && String(x.supplierId||'') === String(line.supplierId||''));
        if (found){
          found.qty = Number(found.qty||0) + Number(line.qty||0);
          if (line.estUnitPrice != null) found.estUnitPrice = line.estUnitPrice;
        } else {
          pr.items.push(line);
        }
      });
      pr.activity = pr.activity || [];
      pr.activity.unshift({ at: PD.nowISO ? PD.nowISO() : new Date().toISOString(), text: `Added ${rows.length} reorder recommendation${rows.length===1?'':'s'}` });
      PD.saveStore?.(store);

      PD.toast?.(`Draft PR created (${pr.id})`);
      if (bulkResult){
        bulkResult.style.display = 'flex';
        if (bulkTitle) bulkTitle.textContent = 'Draft PR created';
        if (bulkSub) bulkSub.textContent = `Created ${pr.id} with ${rows.length} selected item${rows.length===1?'':'s'}.`;
        if (bulkGo){ bulkGo.textContent = 'Open draft PR'; bulkGo.setAttribute('data-target', '#/procurement/pr/' + encodeURIComponent(pr.id)); }
      }
    });

    btnCreatePOs?.addEventListener('click', ()=>{
      if (PD.can && !PD.can('create_po')){ PD.toast?.('Only owners can create POs'); return; }
      const rows = filteredSuggestions().filter(sg=> selectedSkus.has(String(sg.sku)));
      if (!rows.length){ PD.toast?.('Select at least 1 item'); return; }
      const bySup = {};
      rows.forEach(sg=>{
        const sid = String(sg.supplierId||'');
        if (!sid) return;
        bySup[sid] = bySup[sid] || [];
        bySup[sid].push(sg);
      });
      const created = [];
      Object.keys(bySup).forEach(sid=>{
        const po = createPODraftFromSuggestionLines(sid, bySup[sid]);
        if (po) created.push(po);
      });
      if (!created.length){ PD.toast?.('No supplier configured for selected items'); return; }
      PD.toast?.(`Created ${created.length} PO draft(s)`);
      if (bulkResult){
        bulkResult.style.display = 'flex';
        if (bulkTitle) bulkTitle.textContent = 'Draft POs created';
        if (bulkSub) bulkSub.textContent = 'Review the drafts and submit for approval when ready.';
        if (bulkGo){ bulkGo.textContent = 'Open purchase orders'; bulkGo.setAttribute('data-target', '#/procurement/po'); }
      }
    });

  } catch(e){
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="cell-muted">Unable to load suggestions.</td></tr>`;
  }
}

window.Pages = window.Pages || {};
window.Pages.overview = { render, init };
