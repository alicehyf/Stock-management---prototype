function render(){
  return /*html*/`
<div id="prListView">
      <div class="breadcrumb">
        <span>Procurement</span><span class="crumb-dot">›</span><span>Purchase requisitions</span>
      </div>

      <div class="page-head">
        <div>
          <h1 class="page-title">Purchase requisitions</h1>
          <p class="page-desc">Create internal requests, route optional approvals, then convert approved requisitions into purchase orders.</p>
          <div class="stepper">
            <div class="step active"><span class="num">1</span> PR</div>
            <div class="step"><span class="num">2</span> PO</div>
            <div class="step"><span class="num">3</span> Receiving</div>
          </div>
        </div>
        <div class="right-actions">
          <button class="btn-secondary" id="btnOpenSettings" style="height:40px;border-radius:12px;">Approval settings</button>
          <button class="primary-btn" id="btnNewPR">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"></path></svg>
            New requisition
          </button>
        </div>
      </div>

      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;">
        <div class="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
            <circle cx="11" cy="11" r="7"/>
          </svg>
          <input id="prSearch" placeholder="Search PR #, item, requester..." />
        </div>

        <div class="chips">
          <button class="chip active" data-filter="All">All <span class="count" id="countAll">0</span></button>
          <button class="chip" data-filter="Draft">Draft</button>
          <button class="chip" data-filter="Pending approval">Pending approval</button>
          <button class="chip" data-filter="Approved">Approved</button>
          <button class="chip" data-filter="Rejected">Rejected</button>
          <button class="chip" data-filter="Converted">Converted</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px; padding:14px;">
        <table class="data-table" id="prTable">
          <thead>
            <tr>
              <th style="width:14%;">PR #</th>
              <th style="width:18%;">Scope</th>
              <th style="width:14%;">Requester</th>
              <th style="width:14%;">Needed by</th>
              <th style="width:14%;">Total estimate</th>
              <th style="width:14%;">Status</th>
              <th style="width:12%;">Approvals</th>
              <th class="right" style="width:10%;">Action</th>
            </tr>
          </thead>
          <tbody id="prTbody"></tbody>
        </table>
      </div>
    </div>

    <div id="prDetailView" style="display:none;">
      <div class="breadcrumb">
        <a href="#" id="backToPRList" class="mini-muted" style="text-decoration:none;font-weight:950;">← Back</a>
        <span class="crumb-dot">›</span>
        <span>Procurement</span><span class="crumb-dot">›</span><span>Purchase requisitions</span>
      </div>

      <div class="page-head" style="align-items:flex-start;">
        <div>
          <h1 class="page-title" id="prTitle">PR</h1>
          <p class="page-desc" id="prSubtitle"></p>
          <div class="stepper">
            <div class="step active"><span class="num">1</span> PR</div>
            <div class="step" id="stepPO"><span class="num">2</span> PO</div>
            <div class="step" id="stepRcv"><span class="num">3</span> Receiving</div>
          </div>
        </div>
        <div class="right-actions">
          <button class="btn-secondary" id="btnCopyPR" style="height:40px;border-radius:12px;">Duplicate</button>
          <button class="btn-secondary" id="btnPrintPR" style="height:40px;border-radius:12px;">Print</button>
        </div>
      </div>

      <div class="split">
        <div class="card panel" style="grid-column: span 8;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div>
              <div class="panel-title">Line items</div>
              <div class="panel-sub">Requested quantities and estimated costs. (Prototype UI)</div>
            </div>
            <div class="tag neutral" id="prStatusTag">Status</div>
          </div>

          <div class="divider"></div>

          <table class="data-table" id="prItemsTable">
            <thead>
              <tr>
                <th style="width:24%;">Item</th>
                <th style="width:10%;">SKU</th>
                <th style="width:10%;">UOM</th>
                <th style="width:12%;">Requested qty</th>
                <th style="width:18%;">Preferred supplier</th>
                <th style="width:14%;">Est. unit price</th>
                <th class="right" style="width:12%;">Subtotal</th>
              </tr>
            </thead>
            <tbody id="prItemsTbody"></tbody>
          </table>

          <div class="btn-row">
            <button class="ghost-btn" id="btnSaveDraft">Save draft</button>
            <button class="ghost-btn" id="btnSubmitPR">Submit for approval</button>
            <button class="danger-btn" id="btnRejectPR">Reject</button>
            <button class="primary-btn" id="btnApprovePR" style="box-shadow:none;">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              Approve
            </button>
            <button class="primary-btn" id="btnConvertPO" style="display:none; box-shadow:none;">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10H7z" stroke-linejoin="round"></path><path d="M9 11h6M9 14h6" stroke-linecap="round"></path></svg>
              Convert to PO
            </button>
          </div>

          <div class="hint" style="margin-top:10px;">
            Tip: In real systems, PR approvals are optional. Enable/disable approval workflow in “Approval settings”.
          </div>
        </div>

        <div class="card panel" style="grid-column: span 4;">
          <div class="panel-title">Requisition details</div>
          <div class="panel-sub">Scope, dates, approvals and activity.</div>

          <div class="kv">
            <div class="cell"><div class="k">Scope</div><div class="v" id="kvScope">—</div></div>
            <div class="cell"><div class="k">Location</div><div class="v" id="kvLocation">—</div></div>
            <div class="cell"><div class="k">Requester</div><div class="v" id="kvRequester">—</div></div>
            <div class="cell"><div class="k">Needed by</div><div class="v mono" id="kvNeededBy">—</div></div>
            <div class="cell full" style="grid-column: span 2;"><div class="k">Total estimate</div><div class="v" id="kvTotal">—</div></div>
          </div>

          <div class="divider"></div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div>
              <div style="font-weight:950;">Approvals</div>
              <div class="muted-note" id="approvalNote">Optional approval workflow.</div>
            </div>
            <div class="pill" id="approvalEnabledPill"><span class="dot"></span> Enabled</div>
          </div>

          <div id="approvalSteps" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>

          <div class="divider"></div>

          <div style="font-weight:950;">Activity</div>
          <div class="timeline" id="prTimeline"></div>
        </div>
      </div>
    </div>

    <!-- Settings modal -->
    <div class="drawer" id="settingsDrawer">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">Approval settings (prototype)</div>
          <button class="icon-btn" id="closeSettings">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field full">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div class="label">Enable approval workflow</div>
                  <div class="muted-note">If disabled, PRs can be converted to PO directly.</div>
                </div>
                <label style="display:flex;gap:10px;align-items:center;font-weight:950;">
                  <input type="checkbox" id="toggleApprovals" style="width:18px;height:18px;" />
                  Enabled
                </label>
              </div>
            </div>

            <div class="field full">
              <div class="label">Approval chain (demo)</div>
              <div class="muted-note">This is a UI-only configuration. In real systems, rules are based on total, category, supplier, or location.</div>
              <div class="card" style="margin-top:10px; padding:12px;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width:16%;">Level</th>
                      <th style="width:34%;">Role</th>
                      <th style="width:50%;">Rule</th>
                    </tr>
                  </thead>
                  <tbody id="settingsApprovalRows"></tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="btn-row" style="justify-content:flex-end;">
            <button class="ghost-btn" id="btnResetDemo">Reset demo data</button>
            <button class="primary-btn" id="btnSaveSettings" style="box-shadow:none;">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V7l4-4h10l4 4v12a2 2 0 01-2 2z" stroke-linejoin="round"></path><path d="M9 21v-6h6v6" stroke-linejoin="round"></path></svg>
              Save
            </button>
          </div>
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
window.Pages.pr = { render, init };
