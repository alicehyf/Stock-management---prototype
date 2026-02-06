(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){ console.log(m); });

  const CATALOG = [
    { name:'Butter', sku:'1008', uom:'g', supplier:'Dairy Co.', unitPrice:0 },
    { name:'Milk', sku:'1012', uom:'ml', supplier:'Dairy Co.', unitPrice:0 },
    { name:'Eggs', sku:'1016', uom:'pcs', supplier:'Dairy Co.', unitPrice:0 },
    { name:'Avocado', sku:'2001', uom:'g', supplier:'Fresh Market', unitPrice:0 },
    { name:'Lettuce', sku:'2002', uom:'g', supplier:'Fresh Market', unitPrice:0 },
    { name:'Bacon', sku:'3001', uom:'g', supplier:'Butcher', unitPrice:0 },
    { name:'Chicken breast', sku:'5001', uom:'g', supplier:'Butcher', unitPrice:0 }
  ];

  function formatIDR(n){
    try{ return 'IDR ' + Number(n||0).toLocaleString('en-US'); }catch(e){ return 'IDR ' + (n||0); }
  }
  function statusTag(status){
    if (status==='Draft') return '<span class="tag neutral">Draft</span>';
    if (status==='Pending approval') return '<span class="tag pending">Pending approval</span>';
    if (status==='Approved') return '<span class="tag ok">Approved</span>';
    if (status==='Rejected') return '<span class="tag bad">Rejected</span>';
    if (status==='Sent') return '<span class="tag pending">Sent</span>';
    if (status==='Partially received') return '<span class="tag pending">Partially received</span>';
    if (status==='Received') return '<span class="tag ok">Received</span>';
    return '<span class="tag neutral">'+(status||'—')+'</span>';
  }
  function calcTotal(po){
    return (po.items||[]).reduce((s,it)=> s + (Number(it.orderedQty||0) * Number(it.unitPrice||0)), 0);
  }

  function approvalPill(st){
    if (st==='Approved') return '<span class="tag ok">Approved</span>';
    if (st==='Pending') return '<span class="tag pending">Pending</span>';
    if (st==='Blocked') return '<span class="tag neutral">Blocked</span>';
    if (st==='Rejected') return '<span class="tag bad">Rejected</span>';
    if (st==='Skipped') return '<span class="tag neutral">Skipped</span>';
    return '<span class="tag neutral">'+(st||'—')+'</span>';
  }

  function buildApprovalChain(total, settings){
    // Delegate to central approval builder (configurable in Settings)
    if (PD.buildApprovalChain) return PD.buildApprovalChain('PO', total, settings);
    return [];
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
    return /*html*/`
    <div id="poListView">
      <div class="breadcrumb"><span>Procurement</span><span class="crumb-dot">›</span><span>Purchase orders</span></div>

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
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35" stroke-linecap="round"/><circle cx="11" cy="11" r="7"/></svg>
          <input id="poSearch" placeholder="Search PO #, supplier, linked PR..." />
        </div>
        <div class="chips">
          <button class="chip active" data-filter="All">All</button>
          <button class="chip" data-filter="Draft">Draft</button>
          <button class="chip" data-filter="Pending approval">Pending approval</button>
          <button class="chip" data-filter="Approved">Approved</button>
          <button class="chip" data-filter="Rejected">Rejected</button>
          <button class="chip" data-filter="Sent">Sent</button>
          <button class="chip" data-filter="Partially received">Partially received</button>
          <button class="chip" data-filter="Received">Received</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px; padding:14px;">
        <div class="table-wrap">
          <table class="data-table" id="poTable">
            <thead>
              <tr>
                <th style="width:12%;">PO #</th>
                <th style="width:20%;">Supplier</th>
                <th style="width:16%;">Delivery to</th>
                <th style="width:12%;">Expected date</th>
                <th style="width:12%;">Total</th>
                <th style="width:12%;">Status</th>
                <th style="width:10%;">Linked PR</th>
                <th class="right" style="width:6%;">Action</th>
              </tr>
            </thead>
            <tbody id="poTbody"></tbody>
          </table>
        </div>
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
          <button class="btn-secondary" id="btnBillFromPO" style="height:40px;border-radius:12px;">Create bill</button>
          <button class="primary-btn" id="btnReceivePO" style="box-shadow:none;">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10H7z" stroke-linejoin="round"></path><path d="M9 11h6M9 14h6" stroke-linecap="round"></path></svg>
            Start receiving
          </button>
        </div>
      </div>

      <div class="split">
        <div class="card panel col-8">
          <div class="panel-head">
            <div>
              <div class="panel-title">Order lines</div>
              <div class="panel-sub">Add items while Draft. Receiving will update delivered quantities.</div>
            </div>
            <div class="panel-head-actions">
              <button class="btn-secondary btn-add-item" id="btnAddPOItem">Add item</button>
              <div class="tag neutral" id="poStatusTag">Status</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="table-wrap">
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
          </div>

          <div class="hint" style="margin-top:10px;">Submitting the PO will lock edits until approvals are completed (if enabled). Sending will unlock receiving for deliveries.</div>
        </div>

        <div class="card panel col-4">
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

          <div style="font-weight:950;">Approvals</div>
          <div class="muted-note">Approval steps are based on configured thresholds. Completed approvals will unlock sending.</div>
          <div id="poApprovals" style="margin-top:10px; display:flex; flex-direction:column; gap:8px;"></div>
          <div id="poApprovalActions" style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;"></div>

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

    <!-- Add item modal -->
    <div class="modal-overlay" id="poItemModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="poItemTitle">
        <div class="modal-head">
          <div>
            <div class="modal-title" id="poItemTitle">Add item</div>
            <div class="modal-sub">Add a line item to this PO.</div>
          </div>
          <button class="icon-btn" id="closePOItemModal" title="Close" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"></path></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field wide">
              <div class="k">Item</div>
              <div class="v"><select id="poItemSelect"></select></div>
            </div>
            <div class="form-field">
              <div class="k">Ordered qty</div>
              <div class="v"><input id="poItemQty" type="number" min="0" value="0" /></div>
            </div>
            <div class="form-field">
              <div class="k">Unit price</div>
              <div class="v"><input id="poItemPrice" type="number" min="0" value="0" /></div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-secondary" id="cancelPOItem" type="button">Cancel</button>
          <button class="primary-btn" id="addPOItemConfirm" type="button">Add item</button>
        </div>
      </div>
    </div>

    <!-- Create PO modal -->
    <div class="modal-overlay" id="poCreateModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="poCreateTitle">
        <div class="modal-head">
          <div>
            <div class="modal-title" id="poCreateTitle">New purchase order</div>
            <div class="modal-sub">Choose supplier and delivery details to create a draft PO.</div>
          </div>
          <button class="icon-btn" id="closePOCreateModal" title="Close" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"></path></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field wide">
              <div class="k">Supplier</div>
              <div class="v"><select id="poCreateSupplier" class="input"></select></div>
            </div>
            <div class="form-field">
              <div class="k">Delivery to</div>
              <div class="v"><input id="poCreateLocation" class="input" value="Main kitchen" /></div>
            </div>
            <div class="form-field">
              <div class="k">Expected date</div>
              <div class="v"><input id="poCreateExpected" class="input" type="date" /></div>
            </div>
            <div class="form-field wide">
              <div class="k">Linked PR (optional)</div>
              <div class="v"><select id="poCreateLinkedPR" class="input"></select></div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-secondary" id="cancelPOCreate" type="button">Cancel</button>
          <button class="primary-btn" id="confirmPOCreate" type="button">Create draft PO</button>
        </div>
      </div>
    </div>
    `;
  }

  function init(){
    if (!PD.getStore || !PD.saveStore || !PD.nowISO || !PD.id){
      console.warn('Store not loaded');
      return;
    }

    const { getStore, saveStore, nowISO, id } = PD;

    const poListView = document.getElementById('poListView');
    const poDetailView = document.getElementById('poDetailView');
    const poTbody = document.getElementById('poTbody');

    const poItemsTbody = document.getElementById('poItemsTbody');
    const poTimeline = document.getElementById('poTimeline');
    const poStatusTag = document.getElementById('poStatusTag');

    let currentPOId = null;
    let poFilter = 'All';

    function ensureSeedPOs(){
      const store = getStore();
      if ((store.pos||[]).length) return;
      store.pos = [
        {
          id: 'PO-41012', createdAt: nowISO(), supplier:'Dairy Co.', location:'Main kitchen', expectedDate: new Date(Date.now()+2*86400000).toISOString().slice(0,10),
          status:'Sent', linkedPR:'PR-10388',
          items:[
            { name:'Butter', sku:'1008', uom:'g', orderedQty:2000, receivedQty:0, unitPrice:0 },
            { name:'Avocado', sku:'2001', uom:'g', orderedQty:3000, receivedQty:0, unitPrice:0 }
          ],
          activity:[{ at: nowISO(), text:'PO created' },{ at: nowISO(), text:'PO sent' }]
        },
        {
          id: 'PO-40977', createdAt: nowISO(), supplier:'Butcher', location:'Outlet A', expectedDate: new Date(Date.now()+4*86400000).toISOString().slice(0,10),
          status:'Draft', linkedPR:'PR-10421',
          items:[{ name:'Bacon', sku:'3001', uom:'g', orderedQty:1500, receivedQty:0, unitPrice:0 }],
          activity:[{ at: nowISO(), text:'PO created from PR-10421' }]
        }
      ];
      saveStore(store);
    }

    function renderPOList(){
      const store = getStore();
      const q = (document.getElementById('poSearch')?.value || '').toLowerCase().trim();
      const rows = (store.pos||[]).filter(po=>{
        const okFilter = (poFilter==='All') || (po.status===poFilter);
        const hay = [po.id, po.supplier, po.location, po.linkedPR, (po.items||[]).map(x=>x.name).join(' ')].join(' ').toLowerCase();
        const okQ = !q || hay.includes(q);
        return okFilter && okQ;
      });

      poTbody.innerHTML = rows.map(po=>{
        const total = calcTotal(po);
        return `
          <tr>
            <td class="mono">${po.id}</td>
            <td>${po.supplier||'—'}</td>
            <td>${po.location||'—'}</td>
            <td class="mono">${po.expectedDate||'—'}</td>
            <td class="mono">${formatIDR(total)}</td>
            <td>${statusTag(po.status)}</td>
            <td class="mono">${po.linkedPR||'—'}</td>
            <td class="right"><button class="link-btn" data-open-po="${po.id}">View</button></td>
          </tr>
        `;
      }).join('');

      document.querySelectorAll('[data-open-po]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const poId = btn.getAttribute('data-open-po');
          window.location.hash = '#/procurement/po/' + poId;
        });
      });
    }

    function renderPODetail(po){
      currentPOId = po.id;
      const total = calcTotal(po);
      const isDraft = (po.status==='Draft');

      // Resolve supplier display (support legacy PO objects that stored only name)
      const storeForSupplier = getStore();
      const suppliers = (storeForSupplier.suppliers||[]);
      if (!po.supplierId && po.supplier && po.supplier !== '—'){
        const match = suppliers.find(s=> (s.name||'').toLowerCase() === String(po.supplier||'').toLowerCase());
        if (match) po.supplierId = match.id;
      }

      document.getElementById('poTitle').textContent = po.id;
      document.getElementById('poSubtitle').textContent = `Supplier ${po.supplier||'—'} • Created ${new Date(po.createdAt).toLocaleString()}`;
      poStatusTag.innerHTML = statusTag(po.status);

      // Supplier: editable on Draft
      const kvSup = document.getElementById('kvSupplier');
      if (kvSup){
        if (isDraft){
          const opts = suppliers
            .filter(s=> (s.status||'Active')==='Active')
            .map(s=>`<option value="${s.id}" ${s.id===po.supplierId?'selected':''}>${s.name}</option>`)
            .join('');
          kvSup.innerHTML = `
            <select id="poSupplierSelect" class="input" style="width:100%;height:38px;border-radius:12px;">
              <option value="">Select supplier</option>
              ${opts}
            </select>
          `;
        } else {
          kvSup.textContent = po.supplier||'—';
        }
      }
      document.getElementById('kvDelivery').textContent = po.location||'—';
      document.getElementById('kvExpected').textContent = po.expectedDate||'—';
      document.getElementById('kvLinkedPR').textContent = po.linkedPR||'—';
      document.getElementById('kvPOTotal').textContent = formatIDR(total);

      // Stepper
      document.getElementById('poStepRcv').classList.toggle('done', po.status==='Received');

      // Items
      poItemsTbody.innerHTML = (po.items||[]).map(it=>{
        const sub = (Number(it.orderedQty||0) * Number(it.unitPrice||0));
        const orderedCell = isDraft
          ? `<input class="input" style="width:110px" type="number" min="0" value="${Number(it.orderedQty||0)}" data-po-edit="qty" data-sku="${it.sku}" />`
          : `<span class="mono">${Number(it.orderedQty||0).toLocaleString('en-US')} ${it.uom||''}</span>`;
        const priceCell = isDraft
          ? `<input class="input" style="width:110px" type="number" min="0" value="${Number(it.unitPrice||0)}" data-po-edit="price" data-sku="${it.sku}" />`
          : `<span class="mono">${formatIDR(it.unitPrice||0)}</span>`;
        return `
          <tr>
            <td style="font-weight:950;">${it.name}</td>
            <td class="mono cell-muted">${it.sku}</td>
            <td class="cell-muted">${it.uom||'g'}</td>
            <td>${orderedCell}</td>
            <td class="mono">${Number(it.receivedQty||0).toLocaleString('en-US')} ${it.uom||'g'}</td>
            <td>${priceCell}</td>
            <td class="right mono">${formatIDR(sub)}</td>
          </tr>
        `;
      }).join('') || `
        <tr>
          <td colspan="7" class="mini-muted">No items yet. Click “Add item” to add your first order line.</td>
        </tr>
      `;

      // Item edits (draft only)
      if (isDraft){
        document.querySelectorAll('[data-po-edit]').forEach(inp=>{
          inp.addEventListener('input', ()=>{
            const sku = inp.getAttribute('data-sku');
            const type = inp.getAttribute('data-po-edit');
            const v = Math.max(0, Number(inp.value||0));
            const store = getStore();
            const p = store.pos.find(x=>x.id===currentPOId);
            if (!p) return;
            const line = (p.items||[]).find(x=>x.sku===sku);
            if (!line) return;
            if (type==='qty') line.orderedQty = v;
            if (type==='price') line.unitPrice = v;
            saveStore(store);
            renderPODetail(p);
            renderPOList();
          });
        });
      }

      // Timeline
      poTimeline.innerHTML = (po.activity||[]).map(ev=>`
        <div class="t-item">
          <div class="t-dot"></div>
          <div>
            <div class="txt">${ev.text}</div>
            <div class="sub mono">${new Date(ev.at).toLocaleString()}</div>
          </div>
        </div>
      `).join('');

      // Approvals
      const storeForApproval = getStore();
      const approvalsEnabled = !!(storeForApproval.settings && storeForApproval.settings.approvalsEnabled);
      const approvalsEl = document.getElementById('poApprovals');
      const approvalActionsEl = document.getElementById('poApprovalActions');
      const isOwner = (window.ProcurementDemo?.getRole && window.ProcurementDemo.getRole()==='owner');

      if (approvalsEl){
        if (!approvalsEnabled){
          approvalsEl.innerHTML = '<div class="hint">Approvals are disabled. Enable them in Settings to require multi-level approval.</div>';
        } else if (!po.approvals || !po.approvals.length){
          approvalsEl.innerHTML = isDraft
            ? '<div class="hint">Approvals will start after you submit this PO.</div>'
            : '<div class="hint">No approval chain found for this PO.</div>';
        } else {
          approvalsEl.innerHTML = (po.approvals||[]).map((a, idx)=>{
            const meta = [];
            if (a.by) meta.push('by ' + a.by);
            if (a.at) meta.push(new Date(a.at).toLocaleString());
            const metaTxt = meta.length ? (' • ' + meta.join(' • ')) : '';
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--border);border-radius:14px;padding:10px 12px;">
                <div>
                  <div style="font-weight:950;">Level ${idx+1}: ${a.role||'—'}</div>
                  <div class="mini-muted">${a.rule||''}${metaTxt}</div>
                </div>
                <div>${approvalPill(a.status)}</div>
              </div>
            `;
          }).join('');
        }
      }

      if (approvalActionsEl){
        approvalActionsEl.innerHTML = '';
        if (!approvalsEnabled){
          // nothing
        } else if (po.status==='Pending approval'){
          if (isOwner){
            approvalActionsEl.innerHTML = `
              <button class="primary-btn" id="btnApprovePOStep" style="box-shadow:none;">Approve step</button>
              <button class="ghost-btn" id="btnRejectPO">Reject</button>
              <button class="ghost-btn" id="btnWithdrawPO" title="Withdraw this approval request so you can edit and resubmit.">Withdraw request</button>
            `;
            document.getElementById('btnApprovePOStep')?.addEventListener('click', approveNextStep);
            document.getElementById('btnRejectPO')?.addEventListener('click', rejectPO);
            document.getElementById('btnWithdrawPO')?.addEventListener('click', withdrawPO);
          } else {
            approvalActionsEl.innerHTML = '<div class="hint">Waiting for approval.</div>';
          }
        } else if (po.status==='Approved'){
          approvalActionsEl.innerHTML = '<div class="hint">Approved. You can now send the PO.</div>';
        } else if (po.status==='Rejected'){
          if (isOwner){
            approvalActionsEl.innerHTML = `
              <button class="primary-btn" id="btnRevisePO" style="box-shadow:none;">Edit & resubmit</button>
            `;
            document.getElementById('btnRevisePO')?.addEventListener('click', reviseRejectedPO);
          } else {
            approvalActionsEl.innerHTML = '<div class="hint">Rejected.</div>';
          }
        } else if (isDraft){
          approvalActionsEl.innerHTML = '<div class="hint">Submit to start approvals.</div>';
        }
      }

      // Credits summary
      const store = getStore();
      const credits = (store.credits||[]).filter(c=>c.poId===po.id);
      const creditsEl = document.getElementById('poCredits');
      if (creditsEl){
        creditsEl.innerHTML = credits.length ? credits.map(c=>{
          const amt = (c.items||[]).reduce((s,it)=> s + Number(it.amount||0), 0);
          return `
            <div class="cell" style="border:1px solid #e5e7eb;border-radius:14px;padding:10px 12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div style="font-weight:950;">${c.id}</div>
                <div class="mono">${formatIDR(amt)}</div>
              </div>
              <div class="mini-muted">From ${c.receivingId} • ${c.status}</div>
            </div>
          `;
        }).join('') : '<div class="hint">No credits yet.</div>';
      }

      // Buttons
      const btnAdd = document.getElementById('btnAddPOItem');
      const btnSend = document.getElementById('btnSendPO');
      const btnRcv = document.getElementById('btnReceivePO');
      if (btnAdd) btnAdd.disabled = !isDraft;
      if (btnSend){
        if (approvalsEnabled){
          if (isDraft){
            btnSend.textContent = 'Submit for approval';
            btnSend.disabled = false;
          } else if (po.status==='Approved'){
            btnSend.textContent = 'Send PO';
            btnSend.disabled = false;
          } else if (po.status==='Pending approval'){
            btnSend.textContent = 'Awaiting approval';
            btnSend.disabled = true;
          } else {
            btnSend.textContent = 'Send PO';
            btnSend.disabled = true;
          }
        } else {
          btnSend.textContent = 'Send PO';
          btnSend.disabled = !isDraft;
        }
      }
      if (btnRcv) btnRcv.disabled = !(po.status==='Sent' || po.status==='Partially received' || po.status==='Received');

      // Supplier selector bind (draft only)
      const supSel = document.getElementById('poSupplierSelect');
      if (supSel){
        supSel.addEventListener('change', ()=>{
          const v = supSel.value;
          const store = getStore();
          const p = store.pos.find(x=>x.id===currentPOId);
          if (!p) return;
          p.supplierId = v || null;
          const s = (store.suppliers||[]).find(x=>x.id===v);
          p.supplier = s ? s.name : '—';
          p.activity = p.activity || [];
          p.activity.unshift({ at: nowISO(), text: s ? `Supplier set: ${s.name}` : 'Supplier cleared' });
          saveStore(store);
          renderPODetail(p);
          renderPOList();
        });
      }
    }

    function openPO(poId){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===poId);
      if (!po) return;
      poListView.style.display = 'none';
      poDetailView.style.display = 'block';
      renderPODetail(po);
    }

    function backToList(){
      poDetailView.style.display = 'none';
      poListView.style.display = 'block';
      currentPOId = null;
      window.location.hash = '#/procurement/po';
    }

    function approveNextStep(){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===currentPOId);
      if (!po) return;
      const isOwner = (window.ProcurementDemo?.getRole && window.ProcurementDemo.getRole()==='owner');
      if (!isOwner){ toast('No permission'); return; }
      if (po.status!=='Pending approval'){ toast('PO is not waiting for approval'); return; }
      po.approvals = po.approvals || buildApprovalChain(calcTotal(po), store.settings);
      const idx = firstPendingIdx(po.approvals);
      if (idx >= 0){
        po.approvals[idx].status = 'Approved';
        po.approvals[idx].at = nowISO();
        po.approvals[idx].by = 'Owner';
        po.activity = po.activity || [];
        po.activity.unshift({ at: nowISO(), text: `Approved step: ${po.approvals[idx].role}` });
      }
      unblockNext(po.approvals);
      if (!hasRemainingApproval(po.approvals)){
        po.status = 'Approved';
        po.approvedAt = nowISO();
        po.activity = po.activity || [];
        po.activity.unshift({ at: nowISO(), text:'PO approved (completed)' });
      }
      saveStore(store);
      toast(po.status==='Approved' ? 'PO approved' : 'Approval progressed');
      renderPODetail(po);
      renderPOList();
    }

    function rejectPO(){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===currentPOId);
      if (!po) return;
      const isOwner = (window.ProcurementDemo?.getRole && window.ProcurementDemo.getRole()==='owner');
      if (!isOwner){ toast('No permission'); return; }
      if (po.status!=='Pending approval'){ toast('PO is not waiting for approval'); return; }
      const note = (window.prompt && window.prompt('Rejection reason (optional):', '')) || '';
      po.approvals = po.approvals || buildApprovalChain(calcTotal(po), store.settings);
      const idx = firstPendingIdx(po.approvals);
      if (idx >= 0){
        po.approvals[idx].status = 'Rejected';
        po.approvals[idx].at = nowISO();
        po.approvals[idx].by = 'Owner';
        if (note) po.approvals[idx].note = note;
      }
      po.status = 'Rejected';
      po.rejectedAt = nowISO();
      po.activity = po.activity || [];
      po.activity.unshift({ at: nowISO(), text: note ? (`PO rejected: ${note}`) : 'PO rejected' });
      saveStore(store);
      toast('PO rejected');
      renderPODetail(po);
      renderPOList();
    }


    function withdrawPO(){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===currentPOId);
      if (!po) return;
      if (po.status!=='Pending approval'){ toast('PO is not waiting for approval'); return; }
      const ok = window.confirm ? window.confirm('Withdraw this approval request? You can edit the PO and submit again.') : true;
      if (!ok) return;

      po.status = 'Draft';
      po.submittedAt = null;
      po.approvedAt = null;
      po.rejectedAt = null;
      po.approvals = [];
      po.activity = po.activity || [];
      po.activity.unshift({ at: nowISO(), text:'Approval request withdrawn (back to Draft)' });

      saveStore(store);
      toast('Request withdrawn');
      renderPODetail(po);
      renderPOList();
    }

    function reviseRejectedPO(){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===currentPOId);
      if (!po) return;
      if (po.status!=='Rejected'){ toast('PO is not rejected'); return; }

      po.status = 'Draft';
      po.submittedAt = null;
      po.approvedAt = null;
      po.rejectedAt = null;
      po.approvals = [];
      po.activity = po.activity || [];
      po.activity.unshift({ at: nowISO(), text:'Reopened for changes (after rejection)' });

      saveStore(store);
      toast('Ready to edit');
      renderPODetail(po);
      renderPOList();
    }

    function sendPO(){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===currentPOId);
      if (!po) return;
      const approvalsEnabled = !!(store.settings && store.settings.approvalsEnabled);

      if (!po.supplier || po.supplier==='—'){ toast('Select a supplier'); return; }
      if (!po.items || po.items.length===0){ toast('Add at least one item'); return; }

      // With approvals enabled:
      // - Draft => Submit for approval
      // - Approved => Send
      if (approvalsEnabled){
        if (po.status==='Draft'){
          po.approvals = buildApprovalChain(calcTotal(po), store.settings);
          po.status = 'Pending approval';
          po.submittedAt = nowISO();
          po.activity = po.activity || [];
          po.activity.unshift({ at: nowISO(), text:'Submitted for approval' });
          saveStore(store);
          toast('Submitted for approval');
          renderPODetail(po);
          renderPOList();
          return;
        }
        if (po.status==='Approved'){
          po.status = 'Sent';
          po.sentAt = nowISO();
          po.activity = po.activity || [];
          po.activity.unshift({ at: nowISO(), text:'PO sent to supplier' });
          saveStore(store);
          toast('PO sent');
          renderPODetail(po);
          renderPOList();
          return;
        }
        if (po.status==='Pending approval'){ toast('Awaiting approval'); return; }
        toast('PO cannot be sent in its current status');
        return;
      }

      // Approvals disabled: Draft can be sent directly
      if (po.status !== 'Draft'){ toast('PO already sent'); return; }
      po.status = 'Sent';
      po.sentAt = nowISO();
      po.activity = po.activity || [];
      po.activity.unshift({ at: nowISO(), text:'PO sent to supplier' });
      saveStore(store);
      toast('PO sent');
      renderPODetail(po);
      renderPOList();
    }

    function startReceiving(){
      if (!currentPOId) return;
      window.location.hash = '#/procurement/receiving/' + currentPOId;
    }

    // Add item modal
    const modal = document.getElementById('poItemModal');
    const sel = document.getElementById('poItemSelect');
    const qtyEl = document.getElementById('poItemQty');
    const priceEl = document.getElementById('poItemPrice');

    function openItemModal(){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===currentPOId);
      if (!po || po.status!=='Draft'){ toast('Only Draft PO can be edited'); return; }
      if (!sel) return;
      sel.innerHTML = CATALOG.map(x=>`<option value="${x.sku}">${x.name} (SKU ${x.sku})</option>`).join('');
      qtyEl.value = '0';
      const first = CATALOG[0];
      priceEl.value = String(first ? Number(first.unitPrice||0) : 0);
      modal.classList.add('open');
    }
    function closeItemModal(){
      if (!modal) return;
      modal.classList.remove('open');
    }
    function addItemConfirm(){
      const sku = sel.value;
      const qty = Math.max(0, Number(qtyEl.value||0));
      const price = Math.max(0, Number(priceEl.value||0));
      if (!sku || qty<=0){ toast('Please enter quantity'); return; }
      const cat = CATALOG.find(x=>x.sku===sku);
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===currentPOId);
      if (!po) return;
      po.items = po.items || [];
      const found = po.items.find(x=>x.sku===sku);
      if (found){
        found.orderedQty = Number(found.orderedQty||0) + qty;
        found.unitPrice = price;
      } else {
        po.items.push({ name: cat?cat.name:'Item', sku, uom: (cat&&cat.uom)||'g', orderedQty: qty, receivedQty: 0, unitPrice: price });
      }
      po.activity = po.activity || [];
      po.activity.unshift({ at: nowISO(), text: `Item added: ${cat?cat.name:sku}` });
      saveStore(store);
      closeItemModal();
      renderPODetail(po);
      renderPOList();
      toast('Item added');
    }

    // Wire events
    document.getElementById('backToPOList')?.addEventListener('click', (e)=>{ e.preventDefault(); backToList(); });
    document.getElementById('poSearch')?.addEventListener('input', renderPOList);
    document.querySelectorAll('.chip[data-filter]').forEach(ch=>{
      ch.addEventListener('click', ()=>{
        document.querySelectorAll('.chip[data-filter]').forEach(x=>x.classList.remove('active'));
        ch.classList.add('active');
        poFilter = ch.getAttribute('data-filter') || 'All';
        renderPOList();
      });
    });

    document.getElementById('btnNewPO')?.addEventListener('click', openCreateModal);

    document.getElementById('btnSendPO')?.addEventListener('click', sendPO);
    document.getElementById('btnReceivePO')?.addEventListener('click', startReceiving);
    document.getElementById('btnBillFromPO')?.addEventListener('click', ()=>{
      const isOwner = (window.ProcurementDemo?.getRole && window.ProcurementDemo.getRole()==='owner');
      if (!isOwner){
        toast('No permission. Please wait for approval.');
        return;
      }
      const store = getStore();
      const po = (store.pos||[]).find(p=>String(p.id)===String(currentPOId));
      if (!po){ toast('PO not found'); return; }
      if (String(po.status||'Draft')==='Draft'){
        toast('Send PO first (Draft cannot be billed)');
        return;
      }
      const bill = window.ProcurementDemo?.createBillFromPO ? window.ProcurementDemo.createBillFromPO(po.id, { useReceivedQty:true }) : null;
      if (bill) window.location.hash = '#/procurement/bills/' + bill.id;
      else toast('Failed to create bill');
    });
    document.getElementById('btnAddPOItem')?.addEventListener('click', openItemModal);

    document.getElementById('closePOItemModal')?.addEventListener('click', closeItemModal);
    document.getElementById('cancelPOItem')?.addEventListener('click', closeItemModal);
    document.getElementById('addPOItemConfirm')?.addEventListener('click', addItemConfirm);
    modal?.addEventListener('click', (e)=>{ if (e.target===modal) closeItemModal(); });

    // Create PO modal
    const createModal = document.getElementById('poCreateModal');
    const createSup = document.getElementById('poCreateSupplier');
    const createLoc = document.getElementById('poCreateLocation');
    const createExp = document.getElementById('poCreateExpected');
    const createLinkedPR = document.getElementById('poCreateLinkedPR');

    function openCreateModal(){
      if (PD.can && !PD.can('create_po')){
        toast('You don\'t have permission to create a PO directly. Please create a PR first.');
        window.location.hash = '#/procurement/pr';
        return;
      }
      const store = getStore();
      const suppliers = (store.suppliers||[]).filter(s=> (s.status||'Active')==='Active');
      if (createSup){
        createSup.innerHTML = '<option value="">Select supplier</option>' + suppliers.map(s=>
          `<option value="${s.id}">${s.name}</option>`
        ).join('');
      }
      if (createLinkedPR){
        const prs = (store.prs||[]);
        // Show most relevant PRs first: Approved/Ready, then others
        const sorted = prs.slice().sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
        createLinkedPR.innerHTML = '<option value="">—</option>' + sorted.map(pr=>
          `<option value="${pr.id}">${pr.id} • ${pr.status||'—'} • ${pr.location||'—'}</option>`
        ).join('');
      }
      if (createLoc && !createLoc.value) createLoc.value = 'Main kitchen';
      if (createExp){
        createExp.value = new Date(Date.now()+5*86400000).toISOString().slice(0,10);
      }
      createModal?.classList.add('open');
    }
    function closeCreateModal(){ createModal?.classList.remove('open'); }
    function confirmCreatePO(){
      if (PD.can && !PD.can('create_po')){
        toast('You don\'t have permission to create a PO directly. Please create a PR first.');
        window.location.hash = '#/procurement/pr';
        closeCreateModal();
        return;
      }
      const supplierId = createSup?.value || '';
      if (!supplierId){ toast('Please select a supplier'); return; }
      const store = getStore();
      const s = (store.suppliers||[]).find(x=>x.id===supplierId);
      const po = {
        id: id('PO'),
        createdAt: nowISO(),
        supplierId: supplierId,
        supplier: s ? s.name : '—',
        location: (createLoc?.value || 'Main kitchen').trim() || 'Main kitchen',
        expectedDate: (createExp?.value || new Date(Date.now()+5*86400000).toISOString().slice(0,10)),
        status: 'Draft',
        linkedPR: (createLinkedPR?.value || '—') || '—',
        items: [],
        activity: [{ at: nowISO(), text:'PO created' }]
      };
      store.pos.unshift(po);
      saveStore(store);
      closeCreateModal();
      toast('Draft PO created');
      window.location.hash = '#/procurement/po/' + po.id;
    }

    // Create PO modal events (after functions/consts)
    document.getElementById('closePOCreateModal')?.addEventListener('click', closeCreateModal);
    document.getElementById('cancelPOCreate')?.addEventListener('click', closeCreateModal);
    document.getElementById('confirmPOCreate')?.addEventListener('click', confirmCreatePO);
    createModal?.addEventListener('click', (e)=>{ if (e.target===createModal) closeCreateModal(); });

    // Seed + initial render
    ensureSeedPOs();
    renderPOList();

    // Deep link
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    const maybeId = parts.length >= 4 ? decodeURIComponent(parts.slice(3).join('/')) : null;
    if (maybeId && maybeId.startsWith('PO-')) openPO(maybeId);
    else { poDetailView.style.display = 'none'; poListView.style.display = 'block'; }
  }

  window.Pages = window.Pages || {};
  window.Pages.po = { render, init };
})();
