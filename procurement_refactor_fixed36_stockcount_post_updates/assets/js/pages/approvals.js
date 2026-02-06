(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (msg)=> (window.UI?.toast ? window.UI.toast(msg) : alert(msg));

  let view = 'PR'; // PR | PO
  let filter = 'Pending'; // Pending | Approved | Rejected | All
  let q = '';

  function fmtIDR(n){
    const v = Number(n||0);
    try{ return v.toLocaleString('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }); }
    catch(e){ return 'IDR ' + Math.round(v).toLocaleString('id-ID'); }
  }
  function fmtDate(s){
    if (!s) return '—';
    try{
      const d = new Date(s);
      if (String(s).length===10) return s;
      return d.toISOString().slice(0,10);
    }catch(e){ return String(s); }
  }
  function fmtTime(s){
    if (!s) return '';
    try{ return new Date(s).toISOString().slice(11,16); }catch(e){ return ''; }
  }

  function approvalsStepLabel(approvals){
    const aps = approvals || [];
    if (!aps.length) return '—';
    const pend = aps.find(a => String(a.status||'').toLowerCase()==='pending');
    if (pend) return pend.role || 'Pending';
    return 'Complete';
  }

  function tag(status){
    const s = String(status||'');
    if (s==='Pending approval') return '<span class="tag pending">Pending approval</span>';
    if (s==='Approved') return '<span class="tag ok">Approved</span>';
    if (s==='Rejected') return '<span class="tag bad">Rejected</span>';
    if (s==='Converted') return '<span class="tag counted">Converted</span>';
    if (s==='Draft') return '<span class="tag neutral">Draft</span>';
    if (s==='Sent') return '<span class="tag pending">Sent</span>';
    return '<span class="tag neutral">'+s+'</span>';
  }

  function prTotal(pr){
    return (pr.items||[]).reduce((acc,it)=> acc + Number(it.qty||0)*Number(it.estUnitPrice||0), 0);
  }
  function prSuppliers(pr){
    const items = pr.items || [];
    const names = [];
    items.forEach(it=>{
      const n = (it.supplier || '').trim();
      if (n && !names.includes(n)) names.push(n);
    });
    if (!names.length) return '—';
    if (names.length===1) return names[0];
    return names[0] + ` +${names.length-1}`;
  }

  function poTotal(po){
    return (po.items||[]).reduce((acc,it)=> acc + Number(it.orderedQty||0)*Number(it.unitPrice||0), 0);
  }
  function poSubmittedAt(po){
    return po.submittedAt || (po.activity||[]).find(x=>String(x.text||'').toLowerCase().includes('submitted'))?.at || po.createdAt;
  }

  function rowMatches(rec, type){
    if (filter!=='All'){
      if (filter==='Pending' && rec.status!=='Pending approval') return false;
      if (filter==='Approved' && rec.status!=='Approved') return false;
      if (filter==='Rejected' && rec.status!=='Rejected') return false;
    }
    const qq = (q||'').trim().toLowerCase();
    if (!qq) return true;

    let hay = '';
    if (type==='PR'){
      hay = [rec.id, rec.requester, rec.location, rec.scope, prSuppliers(rec), String(prTotal(rec))].join(' ');
    } else {
      hay = [rec.id, rec.supplier, rec.location, rec.expectedDate, String(poTotal(rec)), rec.linkedPR].join(' ');
    }
    return hay.toLowerCase().includes(qq);
  }

  function buildApprovalChain(total, settings){
    const t = Number(total||0);
    const levels = (settings && Array.isArray(settings.thresholds) && settings.thresholds.length)
      ? settings.thresholds
      : [
          { level: 1, role: 'Outlet manager', rule: 'Required' },
          { level: 2, role: 'Finance', rule: 'If total > IDR 5,000,000' },
          { level: 3, role: 'Owner', rule: 'If total > IDR 20,000,000' }
        ];

    const need2 = t > 5000000;
    const need3 = t > 20000000;
    let hasPending = false;
    return levels.map((lvl, idx)=>{
      const role = (lvl && lvl.role) ? String(lvl.role) : ('Level ' + (idx+1));
      const levelNum = (lvl && lvl.level) ? Number(lvl.level) : (idx+1);
      let required = true;
      if (levelNum===2) required = need2;
      if (levelNum===3) required = need3;
      if (!required) return { role, status:'Skipped', rule: lvl.rule || '' };
      if (!hasPending){
        hasPending = true;
        return { role, status:'Pending', rule: lvl.rule || '' };
      }
      return { role, status:'Blocked', rule: lvl.rule || '' };
    });
  }
  function firstPendingIdx(approvals){
    return (approvals||[]).findIndex(a=>a && a.status==='Pending');
  }
  function hasRemainingApproval(approvals){
    return (approvals||[]).some(a=>a && (a.status==='Pending' || a.status==='Blocked'));
  }
  function unblockNext(approvals){
    const next = (approvals||[]).find(a=>a && a.status==='Blocked');
    if (next) next.status = 'Pending';
  }

  function render(){
    const store = PD.getStore ? PD.getStore() : { prs: [], pos: [], settings: {} };
    const list = (view==='PR') ? (store.prs||[]) : (store.pos||[]);

    const pending = list.filter(p=>p.status==='Pending approval').length;
    const approved = list.filter(p=>p.status==='Approved').length;
    const rejected = list.filter(p=>p.status==='Rejected').length;

    const role = PD.getRole ? PD.getRole() : 'staff';
    const canApprove = PD.can ? PD.can(view==='PR' ? 'approve_pr' : 'approve_po') : (role==='owner');
    const queueLabel = (view==='PR') ? 'Requisitions' : 'Purchase orders';
    const desc = (view==='PR')
      ? 'Review and action purchase requisitions that require approval.'
      : 'Review and action purchase orders that require approval before sending.';

    const rows = list.filter(rec=>rowMatches(rec, view));

    return /*html*/`
<div class="breadcrumb"><span>Procurement</span><span class="crumb-dot">›</span><span>Approvals</span></div>

<div class="page-head">
  <div>
    <h1 class="page-title">Approvals inbox</h1>
    <p class="page-desc">${desc}</p>
  </div>
</div>

<div class="card" style="padding:10px 12px;margin-top:10px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
  <div class="chip-row" style="display:flex;gap:8px;flex-wrap:wrap;">
    <button class="chip ${view==='PR'?'active':''}" data-ap-view="PR">Requisitions</button>
    <button class="chip ${view==='PO'?'active':''}" data-ap-view="PO">Purchase orders</button>
  </div>
  <div class="muted" style="font-size:12px;">Approvals can be enabled/disabled and threshold rules can be adjusted in <b>Settings → Permissions</b>.</div>
</div>

<div class="kpi-grid dense" style="margin-top:10px;">
  <div class="card kpi">
    <div class="kpi-label">Pending</div>
    <div class="kpi-value">${pending}</div>
  </div>
  <div class="card kpi">
    <div class="kpi-label">Approved</div>
    <div class="kpi-value">${approved}</div>
  </div>
  <div class="card kpi">
    <div class="kpi-label">Rejected</div>
    <div class="kpi-value">${rejected}</div>
  </div>
  <div class="card kpi">
    <div class="kpi-label">Queue</div>
    <div class="kpi-value" style="font-size:16px;font-weight:700">${queueLabel}</div>
    <div class="kpi-sub">${rows.length} shown</div>
  </div>
  <div class="card kpi">
    <div class="kpi-label">Your role</div>
    <div class="kpi-value" style="font-size:16px;font-weight:700">${role==='owner'?'Owner':'Staff'}</div>
    <div class="kpi-sub">${canApprove?'Can approve and reject':'Read-only'}</div>
  </div>
</div>

${!canApprove ? `
  <div class="card" style="padding:12px;margin-top:10px;border:1px solid var(--border);border-left:4px solid var(--warn);">
    <div style="font-weight:700">You don't have approval permissions</div>
    <div class="muted" style="margin-top:4px">Switch to Owner in <b>Settings → Permissions</b> to action approvals.</div>
  </div>
` : ''}

<div class="card panel" style="margin-top:12px;">
  <div class="panel-head">
    <div>
      <div class="panel-title">${queueLabel}</div>
      <div class="panel-sub">Click a record to open details. Use quick actions to approve or reject.</div>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <div class="chip-row">
        <button class="chip ${filter==='Pending'?'active':''}" data-ap-filter="Pending">Pending</button>
        <button class="chip ${filter==='Approved'?'active':''}" data-ap-filter="Approved">Approved</button>
        <button class="chip ${filter==='Rejected'?'active':''}" data-ap-filter="Rejected">Rejected</button>
        <button class="chip ${filter==='All'?'active':''}" data-ap-filter="All">All</button>
      </div>
      <div class="search" style="width:280px;">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5" stroke-linecap="round"></path></svg>
        <input id="apSearch" type="text" placeholder="Search ID, supplier, requester..." value="${(q||'').replace(/"/g,'&quot;')}" />
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="table-wrap">
    ${view==='PR' ? `
      <table class="table">
        <thead>
          <tr>
            <th style="width:120px">PR</th>
            <th style="width:140px">Requester</th>
            <th style="width:140px">Needed by</th>
            <th style="width:200px">Suppliers</th>
            <th style="width:140px">Total</th>
            <th style="width:160px">Submitted</th>
            <th style="width:180px">Current step</th>
            <th style="width:220px">Actions</th>
          </tr>
        </thead>
        <tbody id="apTbody">
          ${rows.map(pr=>{
            const subAt = pr.submittedAt || (pr.activity||[]).find(x=>String(x.text||'').toLowerCase().includes('submitted'))?.at || pr.createdAt;
            const canApproveThis = PD.can ? PD.can('approve_pr', { docType:'PR', doc: pr }) : false;
            const canRejectThis = PD.can ? PD.can('reject_pr', { docType:'PR', doc: pr }) : false;
            const disabledApprove = (!canApproveThis || pr.status!=='Pending approval') ? 'disabled' : '';
            const disabledReject = (!canRejectThis || pr.status!=='Pending approval') ? 'disabled' : '';
            return `
            <tr class="row-click" data-type="PR" data-id="${pr.id}">
              <td><div class="mono">${pr.id}</div><div class="mini-muted">${tag(pr.status)}</div></td>
              <td>${pr.requester||'—'}</td>
              <td>${fmtDate(pr.neededBy)}</td>
              <td>${prSuppliers(pr)}</td>
              <td class="mono">${fmtIDR(prTotal(pr))}</td>
              <td>${fmtDate(subAt)} <span class="mini-muted">${fmtTime(subAt)}</span></td>
              <td>${approvalsStepLabel(pr.approvals)}</td>
              <td>
                <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
                  <button class="btn sm" data-act="open" data-type="PR" data-id="${pr.id}">View</button>
                  <button class="btn sm primary" ${disabledApprove} data-act="approve" data-type="PR" data-id="${pr.id}">Approve</button>
                  <button class="btn sm" ${disabledReject} data-act="reject" data-type="PR" data-id="${pr.id}">Reject</button>
                </div>
              </td>
            </tr>`;
          }).join('') || `<tr><td colspan="8" class="muted" style="padding:14px">No requisitions</td></tr>`}
        </tbody>
      </table>
    ` : `
      <table class="table">
        <thead>
          <tr>
            <th style="width:140px">PO</th>
            <th style="width:220px">Supplier</th>
            <th style="width:160px">Expected date</th>
            <th style="width:150px">Total</th>
            <th style="width:160px">Submitted</th>
            <th style="width:200px">Current step</th>
            <th style="width:220px">Actions</th>
          </tr>
        </thead>
        <tbody id="apTbody">
          ${rows.map(po=>{
            const subAt = poSubmittedAt(po);
            const canApproveThis = PD.can ? PD.can('approve_po', { docType:'PO', doc: po }) : false;
            const canRejectThis = PD.can ? PD.can('reject_po', { docType:'PO', doc: po }) : false;
            const disabledApprove = (!canApproveThis || po.status!=='Pending approval') ? 'disabled' : '';
            const disabledReject = (!canRejectThis || po.status!=='Pending approval') ? 'disabled' : '';
            return `
            <tr class="row-click" data-type="PO" data-id="${po.id}">
              <td><div class="mono">${po.id}</div><div class="mini-muted">${tag(po.status)}</div></td>
              <td>${po.supplier||'—'}</td>
              <td class="mono">${fmtDate(po.expectedDate)}</td>
              <td class="mono">${fmtIDR(poTotal(po))}</td>
              <td>${fmtDate(subAt)} <span class="mini-muted">${fmtTime(subAt)}</span></td>
              <td>${approvalsStepLabel(po.approvals)}</td>
              <td>
                <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
                  <button class="btn sm" data-act="open" data-type="PO" data-id="${po.id}">View</button>
                  <button class="btn sm primary" ${disabledApprove} data-act="approve" data-type="PO" data-id="${po.id}">Approve step</button>
                  <button class="btn sm" ${disabledReject} data-act="reject" data-type="PO" data-id="${po.id}">Reject</button>
                </div>
              </td>
            </tr>`;
          }).join('') || `<tr><td colspan="7" class="muted" style="padding:14px">No purchase orders</td></tr>`}
        </tbody>
      </table>
    `}
  </div>
</div>

<!-- Reject modal -->
<div class="modal" id="apRejectModal" style="display:none">
  <div class="modal-card" style="max-width:540px">
    <div class="modal-head">
      <div>
        <div class="modal-title" id="apRejectTitle">Reject</div>
        <div class="modal-sub" id="apRejectSub">Add a short reason (optional).</div>
      </div>
      <button class="icon-btn" id="apCloseReject" title="Close">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="field">
        <label>Reason</label>
        <textarea id="apRejectNote" rows="3" placeholder="Optional"></textarea>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn" id="apCancelReject">Cancel</button>
      <button class="btn primary" id="apConfirmReject">Reject</button>
    </div>
  </div>
</div>
`;
  }

  let pendingReject = null; // {type, id}

  function approveRecord(type, id){
    const store = PD.getStore();
    const docType = (type==='PR') ? 'PR' : 'PO';
    const doc = (docType==='PR') ? (store.prs||[]).find(p=>p.id===id) : (store.pos||[]).find(p=>p.id===id);
    if (!doc){ toast(docType + ' not found'); return; }

    const act = (docType==='PR') ? 'approve_pr' : 'approve_po';
    if (!PD.can || !PD.can(act, { docType, doc })) { toast('No permission. Please wait for approval.'); return; }
    if (doc.status !== 'Pending approval'){ toast(docType + ' not pending'); return; }

    const total = (docType==='PR') ? prTotal(doc) : poTotal(doc);
    doc.approvals = doc.approvals || [];
    if (!doc.approvals.length && PD.buildApprovalChain){
      doc.approvals = PD.buildApprovalChain(docType, total, store.settings);
    }

    const idx = PD.firstPendingIdx ? PD.firstPendingIdx(doc.approvals) : firstPendingIdx(doc.approvals);
    if (idx < 0){
      // No pending steps -> treat as approved
      doc.status = 'Approved';
      doc.approvedAt = PD.nowISO();
      doc.activity = doc.activity || [];
      doc.activity.unshift({ at: PD.nowISO(), text: docType + ' approved (completed)' });
      PD.saveStore(store);
      toast('Approved');
      window.RouterApp?.render?.();
      return;
    }

    doc.approvals[idx].status = 'Approved';
    doc.approvals[idx].at = PD.nowISO();
    doc.approvals[idx].by = PD.getRoleName ? PD.getRoleName(PD.getRole()) : (PD.getRole?PD.getRole():'');
    doc.activity = doc.activity || [];
    doc.activity.unshift({ at: PD.nowISO(), text: `Approved step: ${(doc.approvals[idx].roleName||doc.approvals[idx].role||'')}` });

    if (PD.unblockNext) PD.unblockNext(doc.approvals); else unblockNext(doc.approvals);
    const remaining = PD.hasRemainingApproval ? PD.hasRemainingApproval(doc.approvals) : hasRemainingApproval(doc.approvals);
    if (!remaining){
      doc.status = 'Approved';
      doc.approvedAt = PD.nowISO();
      doc.activity.unshift({ at: PD.nowISO(), text: docType + ' approved (completed)' });
    }

    PD.saveStore(store);
    toast(doc.status==='Approved' ? 'Approved' : 'Approval progressed');
    window.RouterApp?.render?.();
  }

  function openReject(type, id){
    const store = PD.getStore();
    const docType = (type==='PR') ? 'PR' : 'PO';
    const doc = (docType==='PR') ? (store.prs||[]).find(p=>p.id===id) : (store.pos||[]).find(p=>p.id===id);
    const can = PD.can ? PD.can(type==='PR' ? 'reject_pr' : 'reject_po', { docType, doc }) : false;
    if (!can){ toast('No permission. Please wait for approval.'); return; }
    pendingReject = { type, id };
    document.getElementById('apRejectNote') && (document.getElementById('apRejectNote').value='');
    document.getElementById('apRejectTitle') && (document.getElementById('apRejectTitle').textContent = (type==='PR'?'Reject requisition':'Reject purchase order'));
    document.getElementById('apRejectSub') && (document.getElementById('apRejectSub').textContent = 'Add a short reason (optional). This will be recorded in the activity log.');
    const m = document.getElementById('apRejectModal');
    if (m) m.style.display = 'flex';
    setTimeout(()=> document.getElementById('apRejectNote')?.focus?.(), 50);
  }
  function closeReject(){
    pendingReject = null;
    const m = document.getElementById('apRejectModal');
    if (m) m.style.display = 'none';
  }
  function confirmReject(){
    if (!pendingReject) return;
    const { type, id } = pendingReject;
    const note = (document.getElementById('apRejectNote')?.value || '').trim();
    const store = PD.getStore();
    const docType = (type==='PR') ? 'PR' : 'PO';
    const doc = (docType==='PR') ? (store.prs||[]).find(p=>p.id===id) : (store.pos||[]).find(p=>p.id===id);
    if (!doc){ toast(docType + ' not found'); closeReject(); return; }

    const act = (docType==='PR') ? 'reject_pr' : 'reject_po';
    if (!PD.can || !PD.can(act, { docType, doc })) { toast('No permission. Please wait for approval.'); return; }
    if (String(doc.status||'')!=='Pending approval'){ toast(docType + ' not pending'); closeReject(); return; }

    const total = (docType==='PR') ? prTotal(doc) : poTotal(doc);
    doc.approvals = doc.approvals || [];
    if (!doc.approvals.length && PD.buildApprovalChain){
      doc.approvals = PD.buildApprovalChain(docType, total, store.settings);
    }

    const idx = PD.firstPendingIdx ? PD.firstPendingIdx(doc.approvals) : firstPendingIdx(doc.approvals);
    if (idx < 0){ toast('No pending step'); closeReject(); return; }

    doc.approvals[idx].status = 'Rejected';
    doc.approvals[idx].at = PD.nowISO();
    doc.approvals[idx].by = PD.getRoleName ? PD.getRoleName(PD.getRole()) : (PD.getRole?PD.getRole():'');
    if (note) doc.approvals[idx].note = note;

    doc.status = 'Rejected';
    doc.rejectedAt = PD.nowISO();
    doc.activity = doc.activity || [];
    doc.activity.unshift({ at: PD.nowISO(), text: docType + ' rejected (from inbox)' + (note?(': '+note):'') });

    PD.saveStore(store);
    closeReject();
    toast('Rejected');
    window.RouterApp?.render?.();
  }

  function init(){
    document.querySelectorAll('[data-ap-view]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        view = btn.getAttribute('data-ap-view') || 'PR';
        window.RouterApp?.render?.();
      });
    });

    document.querySelectorAll('[data-ap-filter]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        filter = btn.getAttribute('data-ap-filter') || 'Pending';
        window.RouterApp?.render?.();
      });
    });

    document.getElementById('apSearch')?.addEventListener('input', (e)=>{
      q = e.target.value || '';
      window.RouterApp?.render?.();
    });

    // Row click
    document.querySelectorAll('#apTbody tr[data-id]').forEach(tr=>{
      tr.addEventListener('click', (e)=>{
        if ((e.target||{}).closest && (e.target.closest('button'))) return;
        const id = tr.getAttribute('data-id');
        const type = tr.getAttribute('data-type');
        if (!id || !type) return;
        window.location.hash = (type==='PR')
          ? ('#/procurement/pr/' + encodeURIComponent(id))
          : ('#/procurement/po/' + encodeURIComponent(id));
      });
    });

    document.querySelectorAll('button[data-act]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        const act = btn.getAttribute('data-act');
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        if (!id || !type) return;
        if (act==='open'){
          window.location.hash = (type==='PR')
            ? ('#/procurement/pr/' + encodeURIComponent(id))
            : ('#/procurement/po/' + encodeURIComponent(id));
        }
        if (act==='approve') approveRecord(type, id);
        if (act==='reject') openReject(type, id);
      });
    });

    document.getElementById('apCloseReject')?.addEventListener('click', closeReject);
    document.getElementById('apCancelReject')?.addEventListener('click', closeReject);
    document.getElementById('apConfirmReject')?.addEventListener('click', confirmReject);
    document.getElementById('apRejectModal')?.addEventListener('click', (e)=>{ if (e.target && e.target.id==='apRejectModal') closeReject(); });
  }

  window.Pages = window.Pages || {};
  window.Pages.approvals = { render, init };
})();
