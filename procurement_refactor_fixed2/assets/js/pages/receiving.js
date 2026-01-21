function render(){
  return /*html*/`
<div id="rcvListView">
      <div class="breadcrumb">
        <span>Procurement</span><span class="crumb-dot">›</span><span>Receiving</span>
      </div>

      <div class="page-head">
        <div>
          <h1 class="page-title">Receiving</h1>
          <p class="page-desc">Record delivered quantities, detect short shipments, and auto-log credits so you only pay for what’s delivered.</p>
          <div class="stepper">
            <div class="step done"><span class="num">1</span> PR</div>
            <div class="step done"><span class="num">2</span> PO</div>
            <div class="step active"><span class="num">3</span> Receiving</div>
          </div>
        </div>
        <div class="right-actions">
          <button class="primary-btn" id="btnQuickReceive">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            Quick receive
          </button>
        </div>
      </div>

      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;">
        <div class="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
            <circle cx="11" cy="11" r="7"/>
          </svg>
          <input id="rcvSearch" placeholder="Search PO #, supplier..." />
        </div>

        <div class="chips">
          <button class="chip active" data-filter="All">All</button>
          <button class="chip" data-filter="Waiting">Waiting</button>
          <button class="chip" data-filter="Receiving">Receiving</button>
          <button class="chip" data-filter="Received">Received</button>
          <button class="chip" data-filter="Reconciled">Reconciled</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px; padding:14px;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:16%;">PO #</th>
              <th style="width:22%;">Supplier</th>
              <th style="width:16%;">Expected date</th>
              <th style="width:18%;">Delivery to</th>
              <th style="width:14%;">Status</th>
              <th style="width:14%;">Credits</th>
              <th class="right" style="width:10%;">Action</th>
            </tr>
          </thead>
          <tbody id="rcvTbody"></tbody>
        </table>
      </div>
    </div>

    <div id="rcvDetailView" style="display:none;">
      <div class="breadcrumb">
        <a href="#" id="backToRcvList" class="mini-muted" style="text-decoration:none;font-weight:950;">← Back</a>
        <span class="crumb-dot">›</span>
        <span>Procurement</span><span class="crumb-dot">›</span><span>Receiving</span>
      </div>

      <div class="page-head" style="align-items:flex-start;">
        <div>
          <h1 class="page-title" id="rcvTitle">Receiving</h1>
          <p class="page-desc" id="rcvSubtitle"></p>
          <div class="stepper">
            <div class="step done"><span class="num">1</span> PR</div>
            <div class="step done"><span class="num">2</span> PO</div>
            <div class="step active"><span class="num">3</span> Receiving</div>
          </div>
        </div>
        <div class="right-actions">
          <button class="btn-secondary" id="btnMarkOK" style="height:40px;border-radius:12px;">All OK</button>
          <button class="primary-btn" id="btnConfirmReceiving" style="box-shadow:none;">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            Confirm receiving
          </button>
        </div>
      </div>

      <div class="split">
        <div class="card panel" style="grid-column: span 8;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div>
              <div class="panel-title">Receive items</div>
              <div class="panel-sub">Enter delivered quantity and expiry. Credits are auto-logged if short shipped.</div>
            </div>
            <div class="tag neutral" id="rcvStatusTag">Receiving</div>
          </div>

          <div class="divider"></div>

          <table class="data-table" id="rcvItemsTable">
            <thead>
              <tr>
                <th style="width:22%;">Item</th>
                <th style="width:10%;">SKU</th>
                <th style="width:10%;">UOM</th>
                <th style="width:14%;">Ordered</th>
                <th style="width:14%;">Delivered</th>
                <th style="width:16%;">Expiry</th>
                <th style="width:14%;">Condition</th>
                <th class="right" style="width:10%;">Variance</th>
              </tr>
            </thead>
            <tbody id="rcvItemsTbody"></tbody>
          </table>

          <div class="hint" style="margin-top:10px;">
            Credit management: if delivered &lt; ordered, credits are logged automatically so you only pay for what’s delivered.
          </div>
        </div>

        <div class="card panel" style="grid-column: span 4;">
          <div class="panel-title">Receiving summary</div>
          <div class="panel-sub">Short shipments and credits to verify.</div>

          <div class="kv">
            <div class="cell"><div class="k">PO #</div><div class="v mono" id="sumPO">—</div></div>
            <div class="cell"><div class="k">Supplier</div><div class="v" id="sumSupplier">—</div></div>
            <div class="cell"><div class="k">Ordered total</div><div class="v" id="sumOrdered">—</div></div>
            <div class="cell"><div class="k">Delivered total</div><div class="v" id="sumDelivered">—</div></div>
            <div class="cell full" style="grid-column: span 2;"><div class="k">Credits to verify</div><div class="v" id="sumCredits">—</div></div>
          </div>

          <div class="divider"></div>

          <div style="font-weight:950;">Credits</div>
          <div class="muted-note">Auto-logged on confirm. Review and verify with supplier invoice.</div>
          <div id="rcvCredits" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>
        </div>
      </div>
    </div>
  `;
}


async function init(){
  const PD = window.ProcurementDemo || {};
  const { getStore, saveStore, getOrCreateDraftPR, addItemToDraftPR, nowISO, id } = PD;
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){console.log(m);});
  if (!getStore){ console.warn('Store not loaded'); }

}

window.Pages = window.Pages || {};
window.Pages.receiving = { render, init };

window.Pages = window.Pages || {};
window.Pages.receiving = { render, init };
