(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){ console.log(m); });

  // Small demo item catalog used by PR/PO add-item modals.
  const CATALOG = [
    { name:'Butter', sku:'1008', uom:'g', supplier:'Dairy Co.', estUnitPrice:0 },
    { name:'Milk', sku:'1012', uom:'ml', supplier:'Dairy Co.', estUnitPrice:0 },
    { name:'Eggs', sku:'1016', uom:'pcs', supplier:'Dairy Co.', estUnitPrice:0 },
    { name:'Avocado', sku:'2001', uom:'g', supplier:'Fresh Market', estUnitPrice:0 },
    { name:'Lettuce', sku:'2002', uom:'g', supplier:'Fresh Market', estUnitPrice:0 },
    { name:'Tomatoes', sku:'2006', uom:'g', supplier:'Fresh Market', estUnitPrice:0 },
    { name:'Bacon', sku:'3001', uom:'g', supplier:'Butcher', estUnitPrice:0 },
    { name:'Chicken breast', sku:'5001', uom:'g', supplier:'Butcher', estUnitPrice:0 },
  ];

  // Active catalog for the add-item modal (can be filtered by supplier context).
  let ACTIVE_CATALOG = CATALOG.slice();
  let ACTIVE_OFFERS_BY_SKU = {};

  function formatIDR(n){
    try{ return 'IDR ' + Number(n||0).toLocaleString('en-US'); }catch(e){ return 'IDR ' + (n||0); }
  }

  function calcPRTotal(pr){
    return (pr.items||[]).reduce((s,it)=> s + (Number(it.qty||0) * Number(it.estUnitPrice||0)), 0);
  }

  function statusTag(status){
    if (status==='Draft') return '<span class="tag neutral">Draft</span>';
    if (status==='Pending approval') return '<span class="tag pending">Pending approval</span>';
    if (status==='Approved') return '<span class="tag ok">Approved</span>';
    if (status==='Rejected') return '<span class="tag bad">Rejected</span>';
    if (status==='Converted') return '<span class="tag counted">Converted</span>';
    return '<span class="tag neutral">'+(status||'—')+'</span>';
  }

  function approvalsSummary(pr){
    const approvals = pr.approvals || [];
    if (!approvals.length) return '<span class="mini-muted">—</span>';
    const done = approvals.filter(a=>a.status==='Approved').length;
    return `<span class="mono">${done}/${approvals.length}</span>`;
  }

  function ensureSeedPRs(){
    if (!PD.getStore) return;
    const store = PD.getStore();
    if ((store.prs||[]).length) return;
    const nowISO = PD.nowISO ? PD.nowISO : ()=>new Date().toISOString();
    store.prs = store.prs || [];
    store.prs.unshift(
      {
        id: 'PR-10421', createdAt: nowISO(), requester:'HY', scope:'Full store', location:'Main kitchen',
        neededBy: new Date(Date.now()+4*86400000).toISOString().slice(0,10),
        status: 'Pending approval',
        approvals:[{role:'Outlet manager', status:'Approved', at: nowISO()},{role:'Finance', status:'Pending'}],
        items: [
          { name:'Butter', sku:'1008', uom:'g', qty:2000, estUnitPrice:0, supplierId:'SUP-10001', supplier:'Dairy Co.' },
          { name:'Avocado', sku:'2001', uom:'g', qty:3000, estUnitPrice:0, supplierId:'SUP-10002', supplier:'Fresh Market' }
        ],
        activity:[{ at: nowISO(), text:'Submitted for approval' }]
      },
      {
        id: 'PR-10388', createdAt: nowISO(), requester:'MS', scope:'Outlet A', location:'Outlet A',
        neededBy: new Date(Date.now()+6*86400000).toISOString().slice(0,10),
        status: 'Approved',
        approvals:[{role:'Outlet manager', status:'Approved', at: nowISO()},{role:'Finance', status:'Approved', at: nowISO()}],
        items: [
          { name:'Bacon', sku:'3001', uom:'g', qty:1500, estUnitPrice:0, supplierId:'SUP-10003', supplier:'Butcher' },
          { name:'Lettuce', sku:'2002', uom:'g', qty:1200, estUnitPrice:0, supplierId:'SUP-10002', supplier:'Fresh Market' }
        ],
        activity:[{ at: nowISO(), text:'Approved' }]
      },
      {
        id: 'PR-10302', createdAt: nowISO(), requester:'AR', scope:'Outlet B', location:'Outlet B',
        neededBy: new Date(Date.now()+10*86400000).toISOString().slice(0,10),
        status: 'Rejected',
        approvals:[{role:'Outlet manager', status:'Rejected', at: nowISO(), note:'Please use existing stock first.'}],
        items: [ { name:'Chicken breast', sku:'5001', uom:'g', qty:5000, estUnitPrice:0, supplierId:'SUP-10003', supplier:'Butcher' } ],
        activity:[{ at: nowISO(), text:'Rejected' }]
      }
    );
    PD.saveStore(store);
  }

  function render(){
    return /*html*/`
<div id="prListView">
  <div class="breadcrumb"><span>Procurement</span><span class="crumb-dot">›</span><span>Purchase requisitions</span></div>

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
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35" stroke-linecap="round"/><circle cx="11" cy="11" r="7"/></svg>
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
    <div class="table-wrap">
      <table class="data-table" id="prTable">
        <thead>
          <tr>
            <th style="width:12%;">PR #</th>
            <th style="width:18%;">Scope</th>
            <th style="width:13%;">Requester</th>
            <th style="width:12%;">Needed by</th>
            <th style="width:13%;">Total estimate</th>
            <th style="width:12%;">Status</th>
            <th style="width:12%;">Approvals</th>
            <th class="right" style="width:8%;">Action</th>
          </tr>
        </thead>
        <tbody id="prTbody"></tbody>
      </table>
    </div>
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
    <div class="card panel col-8">
      <div class="panel-head">
        <div>
          <div class="panel-title">Line items</div>
          <div class="panel-sub">Requested quantities and estimated costs.</div>
        </div>
        <div class="panel-head-actions">
          <button class="btn-secondary btn-add-item" id="btnAddPRItem" style="display:none;">Add item</button>
          <div class="tag neutral" id="prStatusTag">Status</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="table-wrap">
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
      </div>

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

      <div class="hint" style="margin-top:10px;">Tip: PR approvals are optional. Toggle approval workflow in “Approval settings”.</div>
    </div>

    <div class="card panel col-4">
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

<!-- Approval settings drawer -->
<div class="drawer" id="settingsDrawer">
  <div class="modal">
    <div class="modal-head">
      <div class="modal-title">Approval settings</div>
      <button class="icon-btn" id="closeSettings" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"></path></svg>
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
          <div class="label">Approval chain</div>
          <div class="muted-note">Configure the approval routing rules.</div>
          <div class="card" style="margin-top:10px; padding:12px;">
            <div class="table-wrap">
              <table class="data-table settings-table">
                <thead><tr><th class="col-level">Level</th><th class="col-role">Role</th><th class="col-rule">Rule</th></tr></thead>
                <tbody id="settingsApprovalRows"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="btn-row" style="justify-content:flex-end;">
        <button class="primary-btn" id="btnSaveSettings" type="button" style="box-shadow:none;">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V7l4-4h10l4 4v12a2 2 0 01-2 2z" stroke-linejoin="round"></path><path d="M9 21v-6h6v6" stroke-linejoin="round"></path></svg>
          Save
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Add item modal -->
<div class="modal-overlay" id="prItemModal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="prItemTitle">
    <div class="modal-head">
      <div>
        <div class="modal-title" id="prItemTitle">Add item</div>
        <div class="modal-sub">Add a line item to this requisition.</div>
      </div>
      <button class="icon-btn" id="closePRItemModal" title="Close" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"></path></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-field wide">
          <div class="k">Item</div>
          <div class="v"><select id="prItemSelect"></select></div>
        </div>
        <div class="form-field">
          <div class="k">Quantity</div>
          <div class="v"><input id="prItemQty" type="number" min="0" value="0" /></div>
        </div>
        <div class="form-field">
          <div class="k">Est. unit price</div>
          <div class="v"><input id="prItemPrice" type="number" min="0" value="0" /></div>
        </div>
        <div class="form-field wide">
          <div class="k">Supplier</div>
          <div class="v"><select id="prItemSupplierSelect"></select></div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn-secondary" id="cancelPRItem" type="button">Cancel</button>
      <button class="primary-btn" id="confirmPRItem" type="button">Add item</button>
    </div>
  </div>
</div>
    `;
  }

  async function init(){
    if (!PD.getStore || !PD.saveStore){
      console.warn('Store not loaded');
      return;
    }

    ensureSeedPRs();

    const prListView = document.getElementById('prListView');
    const prDetailView = document.getElementById('prDetailView');
    const prTbody = document.getElementById('prTbody');

    const prItemsTbody = document.getElementById('prItemsTbody');
    const prTimeline = document.getElementById('prTimeline');
    const approvalStepsEl = document.getElementById('approvalSteps');

    const settingsDrawer = document.getElementById('settingsDrawer');

    const itemModal = document.getElementById('prItemModal');

    let currentPRId = null;
    let prFilter = 'All';

    function getCurrentPR(){
      const store = PD.getStore();
      return (store.prs||[]).find(p=>p.id===currentPRId);
    }

    function renderPRList(){
      const store = PD.getStore();
      const q = (document.getElementById('prSearch')?.value || '').toLowerCase().trim();
      const rows = (store.prs||[]).filter(pr=>{
        const okFilter = (prFilter==='All') || (pr.status===prFilter);
        const hay = [pr.id, pr.requester, pr.scope, pr.location, (pr.items||[]).map(x=>x.name).join(' ')].join(' ').toLowerCase();
        const okQ = !q || hay.includes(q);
        return okFilter && okQ;
      });

      const allCount = document.getElementById('countAll');
      if (allCount) allCount.textContent = String((store.prs||[]).length);

      prTbody.innerHTML = rows.map(pr=>{
        const total = calcPRTotal(pr);
        return `
          <tr>
            <td class="mono">${pr.id}</td>
            <td>${pr.scope}</td>
            <td>${pr.requester}</td>
            <td class="mono">${pr.neededBy}</td>
            <td class="mono">${formatIDR(total)}</td>
            <td>${statusTag(pr.status)}</td>
            <td>${approvalsSummary(pr)}</td>
            <td class="right"><button class="link-btn" data-open-pr="${pr.id}">View</button></td>
          </tr>
        `;
      }).join('');

      document.querySelectorAll('[data-open-pr]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const prId = btn.getAttribute('data-open-pr');
          window.location.hash = '#/procurement/pr/' + encodeURIComponent(prId);
        });
      });
    }

    function renderApprovals(pr, store){
      const enabled = (store.settings||{}).approvalsEnabled !== false;
      const pill = document.getElementById('approvalEnabledPill');
      const note = document.getElementById('approvalNote');
      if (pill){
        pill.innerHTML = `<span class="dot"></span> ${enabled ? 'Enabled' : 'Disabled'}`;
        pill.classList.toggle('review', !enabled);
        pill.classList.toggle('counted', enabled);
      }
      if (note){
        note.textContent = enabled ? 'Optional approval workflow.' : 'Approvals disabled. PR can be converted directly.';
      }

      if (!enabled){
        approvalStepsEl.innerHTML = '<div class="hint">Approval workflow disabled.</div>';
        return;
      }

      const aps = pr.approvals || [];
      if (!aps.length){
        approvalStepsEl.innerHTML = '<div class="hint">No approval steps yet.</div>';
        return;
      }
      approvalStepsEl.innerHTML = aps.map(ap=>{
        const st = ap.status || 'Pending';
        const cls = st==='Approved' ? 'ok' : (st==='Rejected' ? 'bad' : 'pending');
        const when = ap.at ? `<div class="mini-muted mono" style="margin-top:4px;">${new Date(ap.at).toLocaleString()}</div>` : '';
        const noteHtml = ap.note ? `<div class="mini-muted" style="margin-top:4px;">Note: ${ap.note}</div>` : '';
        return `
          <div class="cell" style="border:1px solid #e5e7eb;border-radius:14px;padding:10px 12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div style="font-weight:950;">${ap.role}</div>
              <span class="tag ${cls}">${st}</span>
            </div>
            ${when}
            ${noteHtml}
          </div>
        `;
      }).join('');
    }

    function renderPRDetail(pr){
      const store = PD.getStore();
      currentPRId = pr.id;
      const total = calcPRTotal(pr);

      document.getElementById('prTitle').textContent = pr.id;
      document.getElementById('prSubtitle').textContent = `Requester ${pr.requester} • Created ${new Date(pr.createdAt).toLocaleString()}`;
      document.getElementById('prStatusTag').innerHTML = statusTag(pr.status);

      document.getElementById('kvScope').textContent = pr.scope;
      document.getElementById('kvRequester').textContent = pr.requester;
      document.getElementById('kvLocation').textContent = pr.location;
      document.getElementById('kvNeededBy').textContent = pr.neededBy;
      document.getElementById('kvTotal').textContent = formatIDR(total);

      const isDraft = pr.status==='Draft';
      const isPending = pr.status==='Pending approval';
      const isApproved = pr.status==='Approved';
      const isConverted = pr.status==='Converted';

      // Items
      prItemsTbody.innerHTML = (pr.items||[]).map(it=>{
        const sub = Number(it.qty||0) * Number(it.estUnitPrice||0);
        return `
          <tr>
            <td style="font-weight:950;">${it.name}</td>
            <td class="mono cell-muted">${it.sku}</td>
            <td class="cell-muted">${it.uom || 'g'}</td>
            <td class="mono">${Number(it.qty||0).toLocaleString('en-US')} ${it.uom||'g'}</td>
            <td class="cell-muted">${it.supplier || '—'}</td>
            <td class="mono">${formatIDR(it.estUnitPrice||0)}</td>
            <td class="right mono">${formatIDR(sub)}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="7" class="mini-muted">No items yet. Add items to this requisition.</td></tr>';

      // Timeline
      prTimeline.innerHTML = (pr.activity||[]).map(ev=>`
        <div class="t-item">
          <div class="t-dot"></div>
          <div>
            <div class="txt">${ev.text}</div>
            <div class="sub mono">${new Date(ev.at).toLocaleString()}</div>
          </div>
        </div>
      `).join('');

      renderApprovals(pr, store);

      // Stepper
      document.getElementById('stepPO').classList.toggle('done', isConverted);
      document.getElementById('stepRcv').classList.toggle('done', false);

      // Buttons
      const btnAdd = document.getElementById('btnAddPRItem');
      if (btnAdd) btnAdd.style.display = isDraft ? 'inline-flex' : 'none';

      const btnSaveDraft = document.getElementById('btnSaveDraft');
      const btnSubmit = document.getElementById('btnSubmitPR');
      const btnApprove = document.getElementById('btnApprovePR');
      const btnReject = document.getElementById('btnRejectPR');
      const btnConvert = document.getElementById('btnConvertPO');

      if (btnSaveDraft) btnSaveDraft.disabled = !(isDraft || isPending);
      if (btnSubmit) btnSubmit.disabled = !isDraft;
      if (btnApprove) btnApprove.disabled = !isPending;
      if (btnReject) btnReject.disabled = !(isPending || isApproved);

      const approvalsEnabled = (store.settings||{}).approvalsEnabled !== false;
      const canConvert = approvalsEnabled ? isApproved : (isDraft || isApproved);
      if (btnConvert){
        btnConvert.style.display = canConvert ? 'inline-flex' : 'none';
        btnConvert.disabled = !canConvert;
      }
    }

    function openPRDetail(prId){
      const store = PD.getStore();
      const pr = (store.prs||[]).find(p=>p.id===prId);
      if (!pr) return;
      prListView.style.display = 'none';
      prDetailView.style.display = 'block';
      renderPRDetail(pr);

      // If a flow (e.g., Supplier → Items → Create PR) requested auto-open of Add item, do it once.
      try{
        const key = sessionStorage.getItem('autoOpenPRAddItemFor');
        if (key && key === prId){
          sessionStorage.removeItem('autoOpenPRAddItemFor');
          setTimeout(()=>{ try{ openAddItem(); }catch(e){} }, 0);
        }
      }catch(e){}
    }

    function backToList(){
      prDetailView.style.display = 'none';
      prListView.style.display = 'block';
      currentPRId = null;
      window.location.hash = '#/procurement/pr';
    }

    function ensureApprovalSteps(pr, store){
      const enabled = (store.settings||{}).approvalsEnabled !== false;
      if (!enabled){
        pr.approvals = [];
        return;
      }

      // Prefer configured thresholds from Settings
      const steps = ((store.settings||{}).thresholds || []).filter(Boolean);
      if (!pr.approvals || pr.approvals.length===0){
        if (steps.length){
          pr.approvals = steps.map(t => ({
            level: t.level,
            role: t.role,
            rule: t.rule,
            status: 'Pending'
          }));
        } else {
          pr.approvals = [
            { level: 1, role:'Outlet manager', rule:'Required', status:'Pending' },
            { level: 2, role:'Finance', rule:'If total > IDR 5,000,000', status:'Pending' }
          ];
        }
      } else {
        // Backfill missing fields for older PRs
        pr.approvals.forEach((a,i)=>{
          if (!a.level) a.level = i+1;
          if (!a.status) a.status = 'Pending';
        });
      }
    }

    function submitPR(){
      const store = PD.getStore();
      const pr = (store.prs||[]).find(p=>p.id===currentPRId);
      if (!pr) return;
      if (!pr.items || pr.items.length===0){ toast('Add at least one item'); return; }

      ensureApprovalSteps(pr, store);
      const enabled = (store.settings||{}).approvalsEnabled !== false;

      if (enabled && (pr.approvals||[]).length){
        pr.status = 'Pending approval';
        (pr.approvals||[]).forEach(ap=>{ if (!ap.status || ap.status==='Draft') ap.status='Pending'; });
        pr.activity = pr.activity || [];
        pr.submittedAt = PD.nowISO();
        pr.activity.unshift({ at: pr.submittedAt, text:'Submitted for approval' });
      } else {
        pr.status = 'Approved';
        pr.activity = pr.activity || [];
        pr.activity.unshift({ at: PD.nowISO(), text:'Auto-approved (approvals disabled)' });
      }

      PD.saveStore(store);
      toast('PR submitted');
      renderPRDetail(pr);
      renderPRList();
    }

    function approvePR(){
      if (PD.can && !PD.can('approve_pr')){
        toast('No permission. Please wait for approval.');
        return;
      }
      const store = PD.getStore();
      const pr = (store.prs||[]).find(p=>p.id===currentPRId);
      if (!pr) return;
      if (pr.status !== 'Pending approval'){ toast('PR not pending'); return; }

      (pr.approvals||[]).forEach(ap=>{ if (ap.status!=='Approved'){ ap.status='Approved'; ap.at=PD.nowISO(); } });
      pr.status = 'Approved';
      pr.activity = pr.activity || [];
      pr.activity.unshift({ at: PD.nowISO(), text:'Approved' });

      PD.saveStore(store);
      toast('Approved');
      renderPRDetail(pr);
      renderPRList();
    }

    function rejectPR(){
      if (PD.can && !PD.can('reject_pr')){
        toast('No permission. Please wait for approval.');
        return;
      }
      const note = prompt('Reason (optional):', '') || '';
      const store = PD.getStore();
      const pr = (store.prs||[]).find(p=>p.id===currentPRId);
      if (!pr) return;

      pr.status = 'Rejected';
      if (pr.approvals && pr.approvals.length){
        pr.approvals[0].status = 'Rejected';
        pr.approvals[0].at = PD.nowISO();
        if (note.trim()) pr.approvals[0].note = note.trim();
      }
      pr.activity = pr.activity || [];
      pr.activity.unshift({ at: PD.nowISO(), text:'Rejected' + (note.trim()?(': '+note.trim()):'') });

      PD.saveStore(store);
      toast('Rejected');
      renderPRDetail(pr);
      renderPRList();
    }

    function saveDraft(){
      const store = PD.getStore();
      const pr = (store.prs||[]).find(p=>p.id===currentPRId);
      if (!pr) return;
      pr.activity = pr.activity || [];
      pr.activity.unshift({ at: PD.nowISO(), text:'Draft saved' });
      PD.saveStore(store);
      toast('Draft saved');
      renderPRDetail(pr);
      renderPRList();
    }

    function convertToPO(){
      if (PD.can && !PD.can('create_po')){
        toast('You don\'t have permission to create a PO. Please wait for approval.');
        return;
      }
      const store = PD.getStore();
      const pr = (store.prs||[]).find(p=>p.id===currentPRId);
      if (!pr) return;

      const approvalsEnabled = (store.settings||{}).approvalsEnabled !== false;
      if (approvalsEnabled && pr.status !== 'Approved'){
        toast('PR must be approved');
        return;
      }
      if (!pr.items || pr.items.length===0){ toast('Add at least one item'); return; }

      // Split PR to one PO per supplier
      const missingSup = (pr.items||[]).filter(it => !it.supplierId);
      if (missingSup.length){
        toast('Please select a supplier for all items');
        return;
      }

      const groups = {};
      (pr.items||[]).forEach(it => {
        const sid = String(it.supplierId);
        groups[sid] = groups[sid] || { supplierId: sid, supplier: it.supplier || '—', items: [] };
        groups[sid].items.push(it);
      });

      store.pos = store.pos || [];
      const created = [];
      Object.values(groups).forEach(g => {
        const po = {
          id: PD.id('PO'),
          createdAt: PD.nowISO(),
          supplierId: g.supplierId,
          supplier: g.supplier,
          location: pr.location || 'Main kitchen',
          expectedDate: pr.neededBy || new Date(Date.now()+5*86400000).toISOString().slice(0,10),
          status: 'Draft',
          linkedPR: pr.id,
          items: (g.items||[]).map(it=>({
            name: it.name, sku: it.sku, uom: it.uom||'g', orderedQty: Number(it.qty||0), receivedQty: 0, unitPrice: Number(it.estUnitPrice||0)
          })),
          activity: [{ at: PD.nowISO(), text:'PO created from ' + pr.id }]
        };
        store.pos.unshift(po);
        created.push(po);
      });

      pr.status = 'Converted';
      pr.linkedPOs = created.map(p=>p.id);
      pr.activity = pr.activity || [];
      pr.activity.unshift({ at: PD.nowISO(), text:'Converted to ' + pr.linkedPOs.join(', ') });

      PD.saveStore(store);
      toast(`Converted to ${created.length} PO(s)`);
      renderPRDetail(pr);
      renderPRList();
      window.location.hash = '#/procurement/po/' + encodeURIComponent(created[0].id);
    }

    // Settings drawer
    function openSettings(){
      if (settingsDrawer) settingsDrawer.classList.add('open');
      const store = PD.getStore();
      const enabled = (store.settings||{}).approvalsEnabled !== false;
      const toggle = document.getElementById('toggleApprovals');
      if (toggle) toggle.checked = !!enabled;

      const rows = document.getElementById('settingsApprovalRows');
      if (rows){
        rows.innerHTML = ((store.settings||{}).thresholds||[]).map(t=>`
          <tr>
            <td class="mono">${t.level}</td>
            <td style="font-weight:950;">${t.role}</td>
            <td class="cell-muted">${t.rule}</td>
          </tr>
        `).join('') || '<tr><td colspan="3" class="mini-muted">No rules configured.</td></tr>';
      }
    }
    function closeSettings(){
      if (settingsDrawer) settingsDrawer.classList.remove('open');
    }
    function saveSettings(){
      const store = PD.getStore();
      store.settings = store.settings || {};
      const toggle = document.getElementById('toggleApprovals');
      store.settings.approvalsEnabled = !!(toggle && toggle.checked);
      PD.saveStore(store);
      toast('Settings saved');
      closeSettings();
      // Refresh
      renderPRList();
      if (currentPRId){
        const pr = (store.prs||[]).find(p=>p.id===currentPRId);
        if (pr) renderPRDetail(pr);
      }
    }
    // Add item modal
    function openAddItem(){
      const pr = getCurrentPR();
      if (!pr) return;
      if (pr.status !== 'Draft'){ toast('Only Draft PR can be edited'); return; }

      // Build a supplier-scoped catalog when a preferred supplier is attached (e.g., launched from Supplier → Items).
      const store = PD.getStore();
      const preferredSupplierId = pr.preferredSupplierId ? String(pr.preferredSupplierId) : null;
      let supplierScoped = null;
      if (preferredSupplierId){
        const sup = (store.suppliers||[]).find(s => s.id === preferredSupplierId) || null;
        const supName = sup?.name || '';
        const priceRows = (store.supplierItems||[]).filter(x => String(x.supplierId)===preferredSupplierId && x.active !== false);
        const bySku = Object.fromEntries((store.items||[]).map(it => [String(it.sku), it]));
        supplierScoped = priceRows.map(p=>{
          const meta = bySku[String(p.sku)] || { sku: p.sku, name:'Item', uom:'—' };
          return {
            name: meta.name,
            sku: String(meta.sku),
            uom: meta.uom || '—',
            supplier: supName || '—',
            estUnitPrice: Number(p.unitPrice||0)
          };
        }).sort((a,b)=>a.name.localeCompare(b.name));
        if (!supplierScoped.length) supplierScoped = null;
      }

      ACTIVE_CATALOG = (supplierScoped || CATALOG).slice();

      const sel = document.getElementById('prItemSelect');
      const qty = document.getElementById('prItemQty');
      const price = document.getElementById('prItemPrice');
      const supSel = document.getElementById('prItemSupplierSelect');

      // Build supplier offers map for selected SKU
      const suppliersById = Object.fromEntries((store.suppliers||[]).map(s=>[String(s.id), s]));
      const offersBySku = {};
      (store.supplierItems||[]).forEach(row=>{
        if (row.active === false) return;
        const sku = String(row.sku);
        const sid = String(row.supplierId||'');
        if (!sid) return;
        const sup = suppliersById[sid];
        const supName = sup ? sup.name : '—';
        offersBySku[sku] = offersBySku[sku] || [];
        offersBySku[sku].push({ supplierId: sid, supplierName: supName, unitPrice: Number(row.unitPrice||0) });
      });

      // expose for confirmAddItem
      ACTIVE_OFFERS_BY_SKU = offersBySku;

      function refreshSuppliersForSku(sku){
        const offers = (offersBySku[String(sku)]||[]).slice();
        // If PR is created from a supplier context, lock to that supplier
        const lockedId = preferredSupplierId ? String(preferredSupplierId) : null;
        const filtered = lockedId ? offers.filter(o=>String(o.supplierId)===lockedId) : offers;
        const list = filtered.length ? filtered : offers;
        if (supSel){
          supSel.innerHTML = list.map(o=>`<option value="${o.supplierId}">${o.supplierName}</option>`).join('') || '<option value="">No supplier</option>';
        }
        // pick default supplier: locked > lowest price > first
        let pick = null;
        if (lockedId) pick = list.find(o=>String(o.supplierId)===lockedId) || null;
        if (!pick && list.length){
          pick = list.slice().sort((a,b)=>Number(a.unitPrice||0)-Number(b.unitPrice||0))[0];
        }
        if (supSel){ supSel.value = pick ? pick.supplierId : (list[0]?.supplierId || ''); }
        if (price){
          const chosen = pick || list.find(o=>String(o.supplierId)===String(supSel?.value||'')) || list[0];
          price.value = String(chosen ? (chosen.unitPrice||0) : 0);
        }
      }

      if (sel){
        sel.innerHTML = ACTIVE_CATALOG.map(it=>`<option value="${it.sku}">${it.name} (${it.sku})</option>`).join('');
        sel.value = ACTIVE_CATALOG[0]?.sku || '';
        sel.onchange = ()=>{
          const skuNow = sel.value;
          const it = ACTIVE_CATALOG.find(x=>x.sku===skuNow) || ACTIVE_CATALOG[0];
          if (!it) return;
          refreshSuppliersForSku(skuNow);
        };
      }
      if (qty) qty.value = '0';
      refreshSuppliersForSku(ACTIVE_CATALOG[0]?.sku || '');

      if (supSel) supSel.onchange = ()=>{
        // Update price when supplier changes (can be overridden after)
        const skuNow = sel ? sel.value : (ACTIVE_CATALOG[0]?.sku || '');
        const offers = (offersBySku[String(skuNow)]||[]);
        const chosen = offers.find(o=>String(o.supplierId)===String(supSel.value||'')) || offers[0];
        if (price && chosen) price.value = String(chosen.unitPrice||0);
      };

      if (itemModal) itemModal.classList.add('open');
    }

    function closeAddItem(){
      if (itemModal) itemModal.classList.remove('open');
    }

    function confirmAddItem(){
      const store = PD.getStore();
      const pr = (store.prs||[]).find(p=>p.id===currentPRId);
      if (!pr) return;

      const sel = document.getElementById('prItemSelect');
      const qtyEl = document.getElementById('prItemQty');
      const priceEl = document.getElementById('prItemPrice');
      const supSel = document.getElementById('prItemSupplierSelect');

      const sku = sel ? sel.value : '';
      const cat = ACTIVE_CATALOG.find(x=>x.sku===sku) || ACTIVE_CATALOG[0] || CATALOG[0];
      const qty = Math.max(0, Number(qtyEl?.value || 0));
      if (!qty){ toast('Please enter quantity'); return; }
      const estUnitPrice = Math.max(0, Number(priceEl?.value || cat.estUnitPrice || 0));
      const supplierId = String(supSel?.value || '').trim();
      const offerList = (ACTIVE_OFFERS_BY_SKU[String(sku)]||[]);
      const chosenOffer = offerList.find(o=>String(o.supplierId)===String(supplierId)) || offerList[0];
      const supplierName = (chosenOffer ? chosenOffer.supplierName : (cat.supplier||'—')).trim() || '—';
      if (!supplierId){ toast('Please select a supplier'); return; }

      pr.items = pr.items || [];
      const found = pr.items.find(x=>x.sku===sku && String(x.supplierId||'')===String(supplierId));
      if (found){
        found.qty = Number(found.qty||0) + qty;
        found.estUnitPrice = estUnitPrice;
        found.supplierId = supplierId;
        found.supplier = supplierName;
      } else {
        pr.items.push({ name: cat.name, sku: cat.sku, uom: cat.uom||'g', qty, estUnitPrice, supplierId, supplier: supplierName });
      }
      pr.activity = pr.activity || [];
      pr.activity.unshift({ at: PD.nowISO(), text:'Item added: ' + cat.name });

      PD.saveStore(store);
      toast('Item added');
      closeAddItem();
      renderPRDetail(pr);
      renderPRList();
    }

    // Wire events
    document.getElementById('backToPRList')?.addEventListener('click', (e)=>{ e.preventDefault(); backToList(); });
    document.getElementById('prSearch')?.addEventListener('input', renderPRList);
    document.querySelectorAll('.chip[data-filter]').forEach(ch=>{
      ch.addEventListener('click', ()=>{
        document.querySelectorAll('.chip[data-filter]').forEach(x=>x.classList.remove('active'));
        ch.classList.add('active');
        prFilter = ch.getAttribute('data-filter') || 'All';
        renderPRList();
      });
    });

    document.getElementById('btnNewPR')?.addEventListener('click', ()=>{
      const pr = PD.getOrCreateDraftPR ? PD.getOrCreateDraftPR() : null;
      if (!pr){ toast('Unable to create draft PR'); return; }
      toast('Draft PR ready');
      window.location.hash = '#/procurement/pr/' + encodeURIComponent(pr.id);
    });

    document.getElementById('btnAddPRItem')?.addEventListener('click', openAddItem);
    document.getElementById('btnSaveDraft')?.addEventListener('click', saveDraft);
    document.getElementById('btnSubmitPR')?.addEventListener('click', submitPR);
    document.getElementById('btnApprovePR')?.addEventListener('click', approvePR);
    document.getElementById('btnRejectPR')?.addEventListener('click', rejectPR);
    document.getElementById('btnConvertPO')?.addEventListener('click', convertToPO);

    document.getElementById('btnOpenSettings')?.addEventListener('click', openSettings);
    document.getElementById('closeSettings')?.addEventListener('click', closeSettings);
    document.getElementById('btnSaveSettings')?.addEventListener('click', saveSettings);

    document.getElementById('closePRItemModal')?.addEventListener('click', closeAddItem);
    document.getElementById('cancelPRItem')?.addEventListener('click', closeAddItem);
    document.getElementById('confirmPRItem')?.addEventListener('click', confirmAddItem);
    itemModal?.addEventListener('click', (e)=>{ if (e.target===itemModal) closeAddItem(); });

    document.getElementById('btnCopyPR')?.addEventListener('click', ()=>toast('Requisition duplicated'));
    document.getElementById('btnPrintPR')?.addEventListener('click', ()=>toast('Print job created'));

    // First paint
    renderPRList();

    // Deep-link open: #/procurement/pr/<PR-...>
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    const maybeId = parts.length >= 4 ? decodeURIComponent(parts.slice(3).join('/')) : null;
    if (maybeId && maybeId.startsWith('PR-')){
      openPRDetail(maybeId);
    } else {
      prDetailView.style.display = 'none';
      prListView.style.display = 'block';
    }
  }

  window.Pages = window.Pages || {};
  window.Pages.pr = { render, init };
})();
