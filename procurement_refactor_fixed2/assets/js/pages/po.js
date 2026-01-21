function render(){
  return /*html*/`
<div id="poListView">
      <div class="breadcrumb">
        <span>Procurement</span><span class="crumb-dot">›</span><span>Purchase orders</span>
      </div>

      <div class="page-head">
        <div>
          <h1 class="page-title">Purchase orders</h1>
          <p class="page-desc">Send orders to suppliers, track expected deliveries, and move to receiving when items arrive.</p>
          <div class="stepper">
            <div class="step done"><span class="num">1</span> PR</div>
            <div class="step active"><span class="num">2</span> PO</div>
            <div class="step"><span class="num">3</span> Receiving</div>
          </div>
        </div>
        <div class="right-actions">
          <button class="primary-btn" id="btnNewPO">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"></path></svg>
            New purchase order
          </button>
        </div>
      </div>

      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;">
        <div class="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
            <circle cx="11" cy="11" r="7"/>
          </svg>
          <input id="poSearch" placeholder="Search PO #, supplier, linked PR..." />
        </div>

        <div class="chips">
          <button class="chip active" data-filter="All">All</button>
          <button class="chip" data-filter="Draft">Draft</button>
          <button class="chip" data-filter="Sent">Sent</button>
          <button class="chip" data-filter="Partially received">Partially received</button>
          <button class="chip" data-filter="Received">Received</button>
          <button class="chip" data-filter="Closed">Closed</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px; padding:14px;">
        <table class="data-table" id="poTable">
          <thead>
            <tr>
              <th style="width:14%;">PO #</th>
              <th style="width:22%;">Supplier</th>
              <th style="width:16%;">Delivery to</th>
              <th style="width:14%;">Expected date</th>
              <th style="width:14%;">Total</th>
              <th style="width:14%;">Status</th>
              <th style="width:14%;">Linked PR</th>
              <th class="right" style="width:10%;">Action</th>
            </tr>
          </thead>
          <tbody id="poTbody"></tbody>
        </table>
      </div>
    </div>

    <div id="poDetailView" style="display:none;">
      <div class="breadcrumb">
        <a href="#" id="backToPOList" class="mini-muted" style="text-decoration:none;font-weight:950;">← Back</a>
        <span class="crumb-dot">›</span>
        <span>Procurement</span><span class="crumb-dot">›</span><span>Purchase orders</span>
      </div>

      <div class="page-head" style="align-items:flex-start;">
        <div>
          <h1 class="page-title" id="poTitle">PO</h1>
          <p class="page-desc" id="poSubtitle"></p>
          <div class="stepper">
            <div class="step done"><span class="num">1</span> PR</div>
            <div class="step active"><span class="num">2</span> PO</div>
            <div class="step" id="poStepRcv"><span class="num">3</span> Receiving</div>
          </div>
        </div>
        <div class="right-actions">
          <button class="btn-secondary" id="btnSendPO" style="height:40px;border-radius:12px;">Send PO</button>
          <button class="primary-btn" id="btnReceivePO" style="box-shadow:none;">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10H7z" stroke-linejoin="round"></path><path d="M9 11h6M9 14h6" stroke-linecap="round"></path></svg>
            Start receiving
          </button>
        </div>
      </div>

      <div class="split">
        <div class="card panel" style="grid-column: span 8;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div>
              <div class="panel-title">Order lines</div>
              <div class="panel-sub">Ordered quantities and pricing. Receiving will update delivered quantities.</div>
            </div>
            <div class="tag neutral" id="poStatusTag">Status</div>
          </div>

          <div class="divider"></div>

          <table class="data-table" id="poItemsTable">
            <thead>
              <tr>
                <th style="width:26%;">Item</th>
                <th style="width:10%;">SKU</th>
                <th style="width:10%;">UOM</th>
                <th style="width:14%;">Ordered qty</th>
                <th style="width:14%;">Received qty</th>
                <th style="width:14%;">Unit price</th>
                <th class="right" style="width:12%;">Subtotal</th>
              </tr>
            </thead>
            <tbody id="poItemsTbody"></tbody>
          </table>

          <div class="hint" style="margin-top:10px;">
            Prototype: “Send PO” won’t email suppliers, but it changes PO status to Sent.
          </div>
        </div>

        <div class="card panel" style="grid-column: span 4;">
          <div class="panel-title">Order details</div>
          <div class="panel-sub">Supplier, linked PR, totals and activity.</div>

          <div class="kv">
            <div class="cell"><div class="k">Supplier</div><div class="v" id="kvSupplier">—</div></div>
            <div class="cell"><div class="k">Delivery to</div><div class="v" id="kvDelivery">—</div></div>
            <div class="cell"><div class="k">Expected date</div><div class="v mono" id="kvExpected">—</div></div>
            <div class="cell"><div class="k">Linked PR</div><div class="v mono" id="kvLinkedPR">—</div></div>
            <div class="cell full" style="grid-column: span 2;"><div class="k">Total</div><div class="v" id="kvPOTotal">—</div></div>
          </div>

          <div class="divider"></div>

          <div style="font-weight:950;">Activity</div>
          <div class="timeline" id="poTimeline"></div>

          <div class="divider"></div>

          <div style="font-weight:950;">Credits (auto)</div>
          <div class="muted-note">Credits appear after receiving when delivered qty is less than ordered.</div>
          <div id="poCredits" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>
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
window.Pages.po = { render, init };

window.Pages = window.Pages || {};
window.Pages.po = { render, init };
