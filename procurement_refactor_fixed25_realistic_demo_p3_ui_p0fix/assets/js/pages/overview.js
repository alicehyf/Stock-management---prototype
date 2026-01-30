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
            <div class="panel-sub">Suggested orders based on stock vs reorder points.</div>
          </div>
          <div class="chips">
            <button class="chip active" type="button">All <span class="count">8</span></button>
            <button class="chip" type="button">Urgent <span class="count">3</span></button>
            <button class="chip" type="button">Soon <span class="count">5</span></button>
          </div>
        </div>

        <div class="table-wrap" style="margin-top:12px;">
          <table class="count-table proc-reorder-table" id="reorderTable">
          <thead>
            <tr>
              <th>Item</th>
              <th>Supplier</th>
              <th>On hand</th>
              <th>Reorder point</th>
              <th>Suggested order</th>
              <th style="text-align:right;">Est cost</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody id="reorderTbody"></tbody>
          </table>
        </div>

        <div class="hint" style="margin-top:10px;">Tip: Review suggestions, add to a PR, or generate a draft PO in one click.</div>
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

  // KPI: credits to verify (Open)
  try{
    const store = PD.getStore?.();
    const openTotal = (store?.credits||[])
      .filter(c => (c.status||'Open') === 'Open')
      .reduce((s,c)=> s + (c.items||[]).reduce((ss,it)=> ss + Number(it.amount||0), 0), 0);
    const el = document.getElementById('kpiCredits');
    if (el) el.textContent = 'IDR ' + Number(openTotal||0).toLocaleString('en-US');
  } catch(e){ /* ignore */ }

  // Prototype shortcuts
  document.getElementById('btnNewPO')?.addEventListener('click', () => window.location.hash = '#/procurement/po');
  document.getElementById('btnQuickReceive')?.addEventListener('click', () => window.location.hash = '#/procurement/receiving');
  document.getElementById('btnViewCredits')?.addEventListener('click', () => window.location.hash = '#/procurement/vendor-credits');

  // Suggested ordering table (reorder -> PR/PO)
  const tbody = document.getElementById('reorderTbody');
  try{
    const suggestions = PD.getSuggestedOrders ? PD.getSuggestedOrders({ bufferFactor: 1.2 }) : [];
    if (tbody){
      if (!suggestions.length){
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="cell-muted">All items are above their reorder points.</td>
          </tr>
        `;
      } else {
        tbody.innerHTML = suggestions.map(sg=>{
          const on = PD.formatQty ? PD.formatQty(PD.getStore?.(), sg.sku, sg.onHandBase, false) : { primary: (sg.onHandBase+' '+sg.baseUom), secondary:'' };
          const rp = PD.formatQty ? PD.formatQty(PD.getStore?.(), sg.sku, sg.reorderPointBase, false) : { primary: (sg.reorderPointBase+' '+sg.baseUom), secondary:'' };
          const sug = PD.formatQty ? PD.formatQty(PD.getStore?.(), sg.sku, sg.suggestedBase, true) : { primary: (sg.suggestedPurchaseQty+' '+sg.suggestedPurchaseUom), secondary:(sg.suggestedBase+' '+sg.baseUom) };
          const est = Math.round(Number(sg.suggestedPurchaseQty||0) * Number(sg.unitPricePurchase||0));
          return `
            <tr>
              <td style="font-weight:900;">${sg.name}</td>
              <td>${sg.supplier||'—'}</td>
              <td class="mono">${on.primary}</td>
              <td class="mono">${rp.primary}</td>
              <td class="mono">
                <div>${sug.primary}</div>
                ${sug.secondary ? `<div class="cell-muted" style="font-size:12px;">${sug.secondary}</div>` : ''}
              </td>
              <td style="text-align:right;" class="mono">IDR ${Number(est||0).toLocaleString('en-US')}</td>
              <td style="text-align:right;white-space:nowrap;">
                <button class="link-btn" data-add-pr="${sg.sku}" data-supplier="${sg.supplierId}">Add to PR</button>
                <button class="btn-secondary" style="margin-left:8px;" data-create-po="${sg.supplierId}">Create PO</button>
              </td>
            </tr>
          `;
        }).join('');

        // Wire actions
        document.querySelectorAll('[data-add-pr]').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            const sku = btn.getAttribute('data-add-pr');
            const supId = btn.getAttribute('data-supplier')||'';
            const sg = suggestions.find(x=>String(x.sku)===String(sku));
            if (!sg) return;
            addItemToDraftPR?.({
              name: sg.name,
              sku: sg.sku,
              uom: sg.baseUom,
              qty: sg.suggestedBase,
              estUnitPrice: sg.unitPriceBase,
              supplierId: supId,
              supplier: sg.supplier
            });
            PD.toast?.('Added to draft PR');
          });
        });

        document.querySelectorAll('[data-create-po]').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            const sid = btn.getAttribute('data-create-po')||'';
            if (!sid){ PD.toast?.('No supplier configured for this item'); return; }
            if (PD.can && !PD.can('create_po')){
              PD.toast?.('Only owners can create POs');
              return;
            }
            const po = PD.createPODraftFromSuggested ? PD.createPODraftFromSuggested(sid) : null;
            if (!po){ PD.toast?.('No suggestions found for this supplier'); return; }
            PD.toast?.(`Created ${po.id}`);
            window.location.hash = '#/procurement/po/' + po.id;
          });
        });
      }
    }
  } catch(e){
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="cell-muted">Unable to load suggestions.</td></tr>`;
  }
}

window.Pages = window.Pages || {};
window.Pages.overview = { render, init };
