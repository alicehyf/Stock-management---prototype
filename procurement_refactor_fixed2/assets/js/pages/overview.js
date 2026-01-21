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
        <p class="page-desc">
          Track what needs ordering, what’s already on the way, and what was delivered—so you only pay for what’s delivered. (UI prototype)
        </p>
      </div>

      <div class="right-actions">
        <button class="btn-secondary" id="btnNewPO" style="height:40px;border-radius:12px;">New purchase order</button>
        <button class="primary-btn" id="btnQuickReceive" style="box-shadow:none;">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Quick receive
        </button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="card kpi" style="grid-column: span 3;">
        <div class="k">Items to reorder</div>
        <div class="v">8</div>
        <div class="s">Based on reorder points from stock management.</div>
      </div>
      <div class="card kpi" style="grid-column: span 3;">
        <div class="k">Open purchase orders</div>
        <div class="v">3</div>
        <div class="s">Draft / sent orders awaiting delivery.</div>
      </div>
      <div class="card kpi" style="grid-column: span 3;">
        <div class="k">Expected deliveries (7 days)</div>
        <div class="v">5</div>
        <div class="s">ETAs from suppliers for upcoming deliveries.</div>
      </div>
      <div class="card kpi" style="grid-column: span 3;">
        <div class="k">Credits to verify</div>
        <div class="v">IDR 1,250,000</div>
        <div class="s">Auto-logged when short shipped.</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns: repeat(12, 1fr); gap:14px; margin-top:14px;">
      <div class="card" style="grid-column: span 7; padding:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:950;font-size:16px;">Reorder recommendations</div>
            <div class="mini-muted" style="margin-top:4px;">Suggested orders based on stock vs reorder points.</div>
          </div>
          <div class="chips">
            <button class="chip active">All <span class="count">8</span></button>
            <button class="chip">Urgent <span class="count">3</span></button>
            <button class="chip">Soon <span class="count">5</span></button>
          </div>
        </div>

        <table class="count-table proc-reorder-table" style="margin-top:12px;">
          <thead>
            <tr>
              <th>Item</th>
              <th>Supplier</th>
              <th>On hand</th>
              <th>Reorder point</th>
              <th>Suggested order</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight:950;">Butter</td>
              <td class="cell-muted">Dairy Co.</td>
              <td class="mono">0 g</td>
              <td class="mono cell-muted">2,000 g</td>
              <td class="mono">2,000 g</td>
              <td style="text-align:right;"><button class="link-btn" data-add-to-pr data-name="Butter" data-sku="1008" data-supplier="Dairy Co." data-uom="g" data-qty="2000" data-price="0">Add to PR</button></td>
            </tr>
            <tr>
              <td style="font-weight:950;">Avocado</td>
              <td class="cell-muted">Fresh Market</td>
              <td class="mono">0 g</td>
              <td class="mono cell-muted">3,000 g</td>
              <td class="mono">3,000 g</td>
              <td style="text-align:right;"><button class="link-btn" data-add-to-pr data-name="Avocado" data-sku="2001" data-supplier="Fresh Market" data-uom="g" data-qty="3000" data-price="0">Add to PR</button></td>
            </tr>
            <tr>
              <td style="font-weight:950;">Bacon</td>
              <td class="cell-muted">Butcher</td>
              <td class="mono">0 g</td>
              <td class="mono cell-muted">1,500 g</td>
              <td class="mono">1,500 g</td>
              <td style="text-align:right;"><button class="link-btn" data-add-to-pr data-name="Bacon" data-sku="3001" data-supplier="Butcher" data-uom="g" data-qty="1500" data-price="0">Add to PR</button></td>
            </tr>
          </tbody>
        </table>

        <div class="hint" style="margin-top:10px;">
          Prototype: clicking “Add to PR” doesn’t create an order yet, but the layout matches a real procurement workflow.
        </div>
      </div>

      <div class="card" style="grid-column: span 5; padding:14px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:950;font-size:16px;">Deliveries & credits</div>
            <div class="mini-muted" style="margin-top:4px;">Log deliveries, detect short shipments, and track credits.</div>
          </div>
          <div class="pill"><span class="dot"></span> Updated 2026-01-20 09:29</div>
        </div>

        <div class="banner ok" style="margin-top:12px;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <div class="dot" style="width:10px;height:10px;border-radius:999px;margin-top:4px;"></div>
            <div>
              <div class="b-title">Credit management</div>
              <div class="b-sub">When delivered quantity is less than ordered, we auto-log credits so you only pay for what’s delivered.</div>
            </div>
          </div>
          <div class="pill" style="background:#fff;">Auto-log enabled</div>
        </div>

        <table class="count-table proc-delivery-table" style="margin-top:12px;">
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
              <td class="mono cell-muted">2026-01-19</td>
              <td style="font-weight:900;">Dairy Co.</td>
              <td><span class="tag counted"><span class="dot"></span> Received</span></td>
              <td style="text-align:right;" class="mono">IDR 0</td>
            </tr>
            <tr>
              <td class="mono cell-muted">2026-01-18</td>
              <td style="font-weight:900;">Fresh Market</td>
              <td><span class="tag review"><span class="dot"></span> Short shipped</span></td>
              <td style="text-align:right;" class="mono">IDR 450,000</td>
            </tr>
            <tr>
              <td class="mono cell-muted">2026-01-16</td>
              <td style="font-weight:900;">Butcher</td>
              <td><span class="tag counted"><span class="dot"></span> Received</span></td>
              <td style="text-align:right;" class="mono">IDR 0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}


async function init(){
  const { addItemToDraftPR } = window.ProcurementDemo || {};
  if (!addItemToDraftPR){
    console.warn('ProcurementDemo store not loaded');
  }
  // Wire "Add to PR" buttons on the overview cards
  document.querySelectorAll('[data-add-to-pr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = {
        name: btn.getAttribute('data-name'),
        sku: btn.getAttribute('data-sku'),
        uom: btn.getAttribute('data-uom') || 'g',
        qty: parseInt(btn.getAttribute('data-qty') || '1000', 10),
        estUnitPrice: parseInt(btn.getAttribute('data-price') || '0', 10),
        supplier: btn.getAttribute('data-supplier') || '—'
      };
      addItemToDraftPR?.(item);
      window.ProcurementDemo?.toast?.('Added to draft PR');
    });
  });

  // Prototype shortcuts (hash navigation)
  document.getElementById('btnNewPO')?.addEventListener('click', () => window.location.hash = '#/procurement/po');
  document.getElementById('btnQuickReceive')?.addEventListener('click', () => window.location.hash = '#/procurement/receiving');
}

window.Pages = window.Pages || {};
window.Pages.overview = { render, init };

// Register page
window.Pages = window.Pages || {};
window.Pages.overview = { render, init };
