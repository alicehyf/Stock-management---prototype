(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){ console.log(m); });

  function formatIDR(n){
    try{ return 'IDR ' + Number(n||0).toLocaleString('en-US'); }catch(e){ return 'IDR ' + (n||0); }
  }
  function statusTag(status){
    if (status==='Draft') return '<span class="tag neutral">Draft</span>';
    if (status==='Receiving') return '<span class="tag pending">Receiving</span>';
    if (status==='Completed') return '<span class="tag ok">Received</span>';
    if (status==='Partially received') return '<span class="tag pending">Partially received</span>';
    if (status==='Received') return '<span class="tag ok">Received</span>';
    return '<span class="tag neutral">'+(status||'—')+'</span>';
  }

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
          <button class="chip" data-filter="Draft">Draft</button>
          <button class="chip" data-filter="Receiving">Receiving</button>
          <button class="chip" data-filter="Completed">Received</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px; padding:14px;">
        <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:14%;">Receiving</th>
              <th style="width:14%;">PO #</th>
              <th style="width:22%;">Supplier</th>
              <th style="width:14%;">Received date</th>
              <th style="width:14%;">Status</th>
              <th style="width:14%;">Credits</th>
              <th class="right" style="width:8%;">Action</th>
            </tr>
          </thead>
          <tbody id="rcvTbody"></tbody>
        </table>
        </div>
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
          <button class="btn-secondary" id="btnSaveReceiving" style="height:40px;border-radius:12px;">Save draft</button>
          <button class="btn-secondary" id="btnMarkOK" style="height:40px;border-radius:12px;">All OK</button>
          <button class="btn-secondary" id="btnBillFromReceiving" style="height:40px;border-radius:12px;">Create bill</button>
          <button class="primary-btn" id="btnCompleteReceiving" style="box-shadow:none;">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            Confirm receiving
          </button>
        </div>
      </div>

      <div class="split">
        <div class="card panel col-8">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div>
              <div class="panel-title">Receive items</div>
              <div class="panel-sub">Enter delivered quantity. Credits are auto-logged if short shipped.</div>
            </div>
            <div class="tag neutral" id="rcvStatusTag">Receiving</div>
          </div>

          <div class="divider"></div>

          <div class="table-wrap">
          <table class="data-table" id="rcvItemsTable">
            <thead>
              <tr>
                <th style="width:28%;">Item</th>
                <th style="width:10%;">SKU</th>
                <th style="width:8%;">UOM</th>
                <th style="width:14%;">Ordered</th>
                <th style="width:16%;">Delivered</th>
                <th class="right" style="width:12%;">Variance</th>
              </tr>
            </thead>
            <tbody id="rcvItemsTbody"></tbody>
          </table>
          </div>

          <div class="hint" style="margin-top:10px;">
            Credit management: if delivered &lt; ordered, credits are logged automatically so you only pay for what’s delivered.
          </div>
        </div>

        <div class="card panel col-4">
          <div class="panel-title">Receiving summary</div>
          <div class="panel-sub">Short shipments and credits to verify.</div>

          <div class="kv">
            <div class="cell"><div class="k">Receiving</div><div class="v mono" id="sumRcv">—</div></div>
            <div class="cell"><div class="k">PO #</div><div class="v mono" id="sumPO">—</div></div>
            <div class="cell"><div class="k">Supplier</div><div class="v" id="sumSupplier">—</div></div>
            <div class="cell"><div class="k">Ordered total</div><div class="v" id="sumOrdered">—</div></div>
            <div class="cell"><div class="k">Delivered total</div><div class="v" id="sumDelivered">—</div></div>
            <div class="cell full" style="grid-column: span 2;"><div class="k">Credits (auto)</div><div class="v" id="sumCredits">—</div></div>
          </div>

          <div class="divider"></div>
          <div style="font-weight:950;">Credits created</div>
          <div class="muted-note">Review in Vendor credits after confirming.</div>
          <div id="rcvCredits" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>

          <div class="divider"></div>
          <div style="font-weight:950;">Activity</div>
          <div class="timeline" id="rcvTimeline"></div>
        </div>
      </div>
    </div>

    <!-- Quick receive modal -->
    <div class="modal-overlay" id="quickReceiveModal" style="display:none;">
      <div class="modal">
        <div class="modal-head">
          <div>
            <div class="modal-title">Quick receive</div>
            <div class="modal-sub">Pick a PO to start receiving.</div>
          </div>
          <button class="icon-btn" id="closeQuickReceive" title="Close" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"></path></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field wide">
              <label>Purchase order</label>
              <select id="qrPoSelect"></select>
              <div class="muted-note" style="margin-top:6px;">Only Sent / Partially received POs are available.</div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-secondary" id="cancelQuickReceive" type="button">Cancel</button>
          <button class="primary-btn" id="startQuickReceive" type="button">Start</button>
        </div>
      </div>
    </div>

    <!-- Confirm receiving modal -->
    <div class="modal-overlay" id="confirmReceivingModal" style="display:none;">
      <div class="modal" style="max-width:620px;">
        <div class="modal-head">
          <div>
            <div class="modal-title">Confirm receiving</div>
            <div class="modal-sub">Please verify delivered quantities before completing.</div>
          </div>
          <button class="icon-btn" id="closeConfirmReceiving" title="Close" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"></path></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="kv" style="margin-top:0;">
            <div class="cell"><div class="k">PO #</div><div class="v mono" id="cr_po">—</div></div>
            <div class="cell"><div class="k">Supplier</div><div class="v" id="cr_supplier">—</div></div>
            <div class="cell"><div class="k">Resulting PO status</div><div class="v" id="cr_status">—</div></div>
            <div class="cell"><div class="k">Credits to create</div><div class="v" id="cr_credits">—</div></div>
          </div>

          <div class="divider"></div>
          <div style="font-weight:950;">Short shipped items</div>
          <div class="muted-note">If delivered is lower than ordered, a vendor credit will be logged automatically.</div>
          <div id="cr_variances" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>

          <div class="hint" style="margin-top:12px;">This action will lock receiving quantities and post inventory movements.</div>
        </div>
        <div class="modal-foot">
          <button class="btn-secondary" id="confirmReceivingNo" type="button">Cancel</button>
          <button class="primary-btn" id="confirmReceivingYes" type="button">Confirm</button>
        </div>
      </div>
    </div>

`;
  }

  function init(){
    if (!PD.getStore || !PD.saveStore){ console.warn('Store not loaded'); return; }
    const { getStore, saveStore, nowISO, id } = PD;

    const rcvTbody = document.getElementById('rcvTbody');
    const rcvListView = document.getElementById('rcvListView');
    const rcvDetailView = document.getElementById('rcvDetailView');
    const rcvItemsTbody = document.getElementById('rcvItemsTbody');
    const rcvTimeline = document.getElementById('rcvTimeline');

    let currentRcvId = null;
    let rcvFilter = 'All';

    function seedReceivings(){
      const store = getStore();
      store.receivings = store.receivings || [];
      if (store.receivings.length) return;
      // Keep empty by default; receiving is driven from POs.
      saveStore(store);
    }

    function calcCreditsForReceiving(rcv){
      const variances = (rcv.items||[]).map(it=>{
        const ordered = Number(it.orderedQty||0);
        const received = Number(it.receivedQty||0);
        const diff = Math.max(0, ordered - received);
        const unit = Number(it.unitPrice||0);
        return { ...it, diff, amount: diff * unit };
      }).filter(v=>v.diff>0 && v.amount>0);
      const total = variances.reduce((s,v)=>s+v.amount,0);
      return { variances, total };
    }

    function hasCreditsForReceiving(rcvId){
      const store = getStore();
      return (store.credits||[]).some(c=>c.receivingId===rcvId);
    }

    function upsertReceivingFromPO(poId){
      const store = getStore();
      const po = (store.pos||[]).find(p=>p.id===poId);
      if (!po){ toast('PO not found'); return null; }

      store.receivings = store.receivings || [];
      let rcv = store.receivings.find(r=>r.status!=='Completed' && r.poId===poId);
      if (!rcv){
        rcv = {
          id: id('RCV'),
          createdAt: nowISO(),
          poId: po.id,
          supplier: po.supplier,
          receivedAt: new Date().toISOString().slice(0,10),
          status: 'Draft',
          items: (po.items||[]).map(it=>({
            name: it.name, sku: it.sku, uom: it.uom||'g', orderedQty: Number(it.orderedQty||0), receivedQty: Number(it.receivedQty||0), unitPrice: Number(it.unitPrice||0)
          })),
          activity: [{ at: nowISO(), text: 'Receiving draft created from ' + po.id }]
        };
        store.receivings.unshift(rcv);
        saveStore(store);
      }
      return rcv;
    }

    function renderList(){
      const store = getStore();
      const q = (document.getElementById('rcvSearch')?.value||'').toLowerCase().trim();

      // Receiving list should surface ALL issued POs (Sent / Partially received / Received)
      const issuedPOs = (store.pos||[]).filter(po=> ['Sent','Partially received','Received'].includes(po.status));

      // Build a unified view-model: one row per PO, enriched with latest receiving if exists
      const rows = issuedPOs.map(po=>{
        const rcv = (store.receivings||[])
          .filter(r=> r.poId===po.id)
          .sort((a,b)=> String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0];

        return {
          poId: po.id,
          supplier: po.supplier,
          poStatus: po.status,
          receivingId: rcv ? rcv.id : null,
          receivedAt: rcv ? rcv.receivedAt : '—',
          status: rcv ? rcv.status : 'Not started'
        };
      }).filter(r=>{
        const okFilter = (rcvFilter==='All') || (r.status===rcvFilter);
        const hay = [r.receivingId||'', r.poId, r.supplier, r.poStatus].join(' ').toLowerCase();
        const okQ = !q || hay.includes(q);
        // Rows without a receiving only show under All (or if we later add a dedicated chip)
        const okNotStarted = (r.status!=='Not started') ? true : (rcvFilter==='All');
        return okFilter && okQ && okNotStarted;
      });

      rcvTbody.innerHTML = rows.map(r=>{
        let amt = 0;
        if (r.receivingId){
          const cr = (store.credits||[]).filter(c=>c.receivingId===r.receivingId);
          amt = cr.reduce((s,c)=> s + (c.items||[]).reduce((ss,it)=> ss + Number(it.amount||0), 0), 0);
        }

        const tag = (r.status==='Not started')
          ? '<span class="tag neutral">Not started</span>'
          : statusTag(r.status);

        const actionBtn = r.receivingId
          ? `<button class="link-btn" data-open="${r.receivingId}">Open</button>`
          : `<button class="link-btn" data-start="${r.poId}">Start</button>`;

        return `
          <tr>
            <td class="mono">${r.receivingId || '<span class="mini-muted">—</span>'}</td>
            <td class="mono">${r.poId||'—'}</td>
            <td>${r.supplier||'—'}</td>
            <td class="mono">${r.receivedAt||'—'}</td>
            <td>${tag}</td>
            <td class="mono">${amt ? formatIDR(amt) : '<span class="mini-muted">—</span>'}</td>
            <td class="right">${actionBtn}</td>
          </tr>
        `;
      }).join('') || `<tr><td colspan="7" class="mini-muted" style="padding:14px;">No issued purchase orders yet. Send a PO first, then start receiving.</td></tr>`;

      // Open existing receiving
      document.querySelectorAll('[data-open]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const rid = btn.getAttribute('data-open');
          window.location.hash = '#/procurement/receiving/' + rid;
        });
      });

      // Start receiving for a PO (creates a draft receiving if missing)
      document.querySelectorAll('[data-start]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const poId = btn.getAttribute('data-start');
          const rcv = upsertReceivingFromPO(poId);
          if (rcv){
            window.location.hash = '#/procurement/receiving/' + rcv.id;
          }
        });
      });
    }

    function renderDetail(rcv){
      currentRcvId = rcv.id;
      document.getElementById('rcvTitle').textContent = rcv.id;
      document.getElementById('rcvSubtitle').textContent = `${rcv.poId||'—'} • ${rcv.supplier||'—'} • Received ${rcv.receivedAt||'—'}`;
      // Right-side tag should reflect PO outcome after confirmation
      const _storeForTag = getStore();
      const _poForTag = (_storeForTag.pos||[]).find(p=>String(p.id)===String(rcv.poId));
      const _displayStatus = (String(rcv.status)==='Completed' && _poForTag) ? _poForTag.status : rcv.status;
      document.getElementById('rcvStatusTag').innerHTML = statusTag(_displayStatus);

      // table
      rcvItemsTbody.innerHTML = (rcv.items||[]).map(it=>{
        const ordered = Number(it.orderedQty||0);
        const received = Number(it.receivedQty||0);
        const diff = Math.max(0, ordered - received);
        const disabled = (rcv.status==='Completed') ? 'disabled' : '';
        return `
          <tr>
            <td style="font-weight:950;">${it.name}</td>
            <td class="mono cell-muted">${it.sku}</td>
            <td class="cell-muted">${it.uom||'g'}</td>
            <td class="mono">${ordered.toLocaleString('en-US')} ${it.uom||'g'}</td>
            <td>
              <input class="input" style="height:36px;border-radius:12px;width:140px;" type="number" min="0" value="${received}" data-rcv-sku="${it.sku}" ${disabled} />
            </td>
            <td class="right mono">${diff ? ('-' + diff.toLocaleString('en-US') + ' ' + (it.uom||'g')) : '<span class="mini-muted">—</span>'}</td>
          </tr>
        `;
      }).join('');

      // summary
      const orderedTotal = (rcv.items||[]).reduce((s,it)=> s + Number(it.orderedQty||0) * Number(it.unitPrice||0), 0);
      const deliveredTotal = (rcv.items||[]).reduce((s,it)=> s + Number(it.receivedQty||0) * Number(it.unitPrice||0), 0);
      const creditInfo = calcCreditsForReceiving(rcv);

      document.getElementById('sumRcv').textContent = rcv.id;
      document.getElementById('sumPO').textContent = rcv.poId||'—';
      document.getElementById('sumSupplier').textContent = rcv.supplier||'—';
      document.getElementById('sumOrdered').textContent = formatIDR(orderedTotal);
      document.getElementById('sumDelivered').textContent = formatIDR(deliveredTotal);
      document.getElementById('sumCredits').textContent = creditInfo.total ? formatIDR(creditInfo.total) : '—';

      // credits preview
      const creditsEl = document.getElementById('rcvCredits');
      if (creditsEl){
        creditsEl.innerHTML = creditInfo.variances.length ? creditInfo.variances.map(v=>`
          <div class="card" style="padding:10px 12px;border-radius:14px;">
            <div style="display:flex;justify-content:space-between;gap:10px;">
              <div style="font-weight:950;">${v.name}</div>
              <div class="mono">${formatIDR(v.amount)}</div>
            </div>
            <div class="mini-muted">Short shipped ${v.diff.toLocaleString('en-US')} ${v.uom||'g'} • Unit ${formatIDR(v.unitPrice||0)}</div>
          </div>
        `).join('') : '<div class="mini-muted">No credits expected.</div>';
      }

      // activity
      rcvTimeline.innerHTML = (rcv.activity||[]).map(ev=>`
        <div class="t-item">
          <div class="t-dot"></div>
          <div>
            <div class="txt">${ev.text}</div>
            <div class="sub mono">${new Date(ev.at).toLocaleString()}</div>
          </div>
        </div>
      `).join('');

      const btnSave = document.getElementById('btnSaveReceiving');
      const btnDone = document.getElementById('btnCompleteReceiving');
      const btnOK = document.getElementById('btnMarkOK');
      const isDone = rcv.status==='Completed';
      if (btnSave) btnSave.disabled = isDone;
      if (btnDone) btnDone.disabled = isDone;
      if (btnOK) btnOK.disabled = isDone;
    }

    function openDetail(rid){
      const store = getStore();
      const rcv = (store.receivings||[]).find(r=>r.id===rid);
      if (!rcv) return;
      rcvListView.style.display = 'none';
      rcvDetailView.style.display = 'block';
      renderDetail(rcv);
    }

    function backToList(){
      rcvDetailView.style.display = 'none';
      rcvListView.style.display = 'block';
      currentRcvId = null;
      window.location.hash = '#/procurement/receiving';
    }

    function saveDraft(){
      const store = getStore();
      const rcv = (store.receivings||[]).find(r=>r.id===currentRcvId);
      if (!rcv) return;
      document.querySelectorAll('[data-rcv-sku]').forEach(inp=>{
        const sku = inp.getAttribute('data-rcv-sku');
        const v = Math.max(0, Number(inp.value||0));
        const it = (rcv.items||[]).find(x=>x.sku===sku);
        if (it) it.receivedQty = v;
      });
      rcv.status = 'Receiving';
      rcv.activity = rcv.activity || [];
      rcv.activity.unshift({ at: nowISO(), text:'Receiving saved' });
      saveStore(store);
      toast('Receiving saved');
      renderDetail(rcv);
      renderList();
    }

    function markAllOK(){
      const store = getStore();
      const rcv = (store.receivings||[]).find(r=>r.id===currentRcvId);
      if (!rcv) return;
      (rcv.items||[]).forEach(it=>{ it.receivedQty = Number(it.orderedQty||0); });
      saveStore(store);
      renderDetail(rcv);
      toast('Delivered qty set to ordered');
    }


    function snapshotReceivingFromInputs(rcv){
      const snap = JSON.parse(JSON.stringify(rcv||{}));
      // Pull current input values without mutating store yet
      document.querySelectorAll('[data-rcv-sku]').forEach(inp=>{
        const sku = inp.getAttribute('data-rcv-sku');
        const v = Math.max(0, Number(inp.value||0));
        const it = (snap.items||[]).find(x=>x.sku===sku);
        if (it) it.receivedQty = v;
      });
      return snap;
    }

    function openConfirmReceiving(){
      const store = getStore();
      const rcv = (store.receivings||[]).find(r=>r.id===currentRcvId);
      if (!rcv){ toast('Receiving not found'); return; }
      if (String(rcv.status||'')==='Completed'){ toast('Receiving already completed'); return; }

      const snap = snapshotReceivingFromInputs(rcv);
      const allReceived = (snap.items||[]).every(it => Number(it.receivedQty||0) >= Number(it.orderedQty||0));
      const nextPoStatus = allReceived ? 'Received' : 'Partially received';
      const creditInfo = calcCreditsForReceiving(snap);

      const modal = document.getElementById('confirmReceivingModal');
      if (!modal){
        // Fallback: if modal isn't available, proceed directly
        completeReceiving();
        return;
      }

      const poEl = document.getElementById('cr_po');
      const supEl = document.getElementById('cr_supplier');
      const stEl = document.getElementById('cr_status');
      const crEl = document.getElementById('cr_credits');
      const vEl = document.getElementById('cr_variances');

      if (poEl) poEl.textContent = snap.poId || '—';
      if (supEl) supEl.textContent = snap.supplier || '—';
      if (stEl) stEl.innerHTML = statusTag(nextPoStatus);
      if (crEl) crEl.textContent = creditInfo.total ? formatIDR(creditInfo.total) : '—';

      if (vEl){
        vEl.innerHTML = creditInfo.variances.length ? creditInfo.variances.map(v=>`
          <div class="card" style="padding:10px 12px;border-radius:14px;">
            <div style="display:flex;justify-content:space-between;gap:10px;">
              <div style="font-weight:950;">${v.name}</div>
              <div class="mono">${formatIDR(v.amount)}</div>
            </div>
            <div class="mini-muted">Ordered ${Number(v.orderedQty||0).toLocaleString('en-US')} ${v.uom||'g'} • Delivered ${Number(v.receivedQty||0).toLocaleString('en-US')} ${v.uom||'g'}</div>
          </div>
        `).join('') : '<div class="mini-muted">No short shipments detected.</div>';
      }

      modal.style.display = 'flex';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeConfirmReceiving(){
      const modal = document.getElementById('confirmReceivingModal');
      if (modal){ modal.style.display = 'none'; modal.classList.remove('open'); }
      document.body.style.overflow = '';
    }

    // Click outside to close confirm
    document.getElementById('confirmReceivingModal')?.addEventListener('click', (e)=>{
      if (e.target && e.target.id==='confirmReceivingModal') closeConfirmReceiving();
    });


    function completeReceiving(){
      const store = getStore();
      let rcv = (store.receivings||[]).find(r=>r.id===currentRcvId);
      if (!rcv) return;
      // pull values from inputs
      document.querySelectorAll('[data-rcv-sku]').forEach(inp=>{
        const sku = inp.getAttribute('data-rcv-sku');
        const v = Math.max(0, Number(inp.value||0));
        const it = (rcv.items||[]).find(x=>x.sku===sku);
        if (it) it.receivedQty = v;
      });

      // Update PO received qty + status
      const po = (store.pos||[]).find(p=>p.id===rcv.poId);
      if (po){
        (po.items||[]).forEach(it=>{
          const r = (rcv.items||[]).find(x=>x.sku===it.sku);
          if (r) it.receivedQty = Number(r.receivedQty||0);
        });
        const allReceived = (po.items||[]).every(it => Number(it.receivedQty||0) >= Number(it.orderedQty||0));
        po.status = allReceived ? 'Received' : 'Partially received';
        po.activity = po.activity || [];
        po.activity.unshift({ at: nowISO(), text:'Receiving completed: ' + rcv.id });
      }

      // Auto-log vendor credits once
      if (!hasCreditsForReceiving(rcv.id)){
        const info = calcCreditsForReceiving(rcv);
        if (info.variances.length){
          store.credits = store.credits || [];
          store.credits.unshift({
            id: id('CRD'),
            createdAt: nowISO(),
            supplier: rcv.supplier,
            poId: rcv.poId,
            receivingId: rcv.id,
            status: 'Open',
            reason: 'Short shipped',
            items: info.variances.map(v=>({
              sku: v.sku,
              name: v.name,
              uom: v.uom,
              orderedQty: Number(v.orderedQty||0),
              receivedQty: Number(v.receivedQty||0),
              unitPrice: Number(v.unitPrice||0),
              amount: Number(v.amount||0)
            })),
            activity: [{ at: nowISO(), text:'Credit created from receiving variance' }]
          });
          rcv.activity = rcv.activity || [];
          rcv.activity.unshift({ at: nowISO(), text:'Vendor credit created for short shipped items' });
        }
      }

      rcv.status = 'Completed';
      rcv.activity = rcv.activity || [];
      rcv.activity.unshift({ at: nowISO(), text:'Receiving completed' });
      saveStore(store);

      // Goods receipt should automatically move stock into inventory
      let completeMsg = 'Receiving completed';
      if (PD.postInventoryFromReceiving){
        const res = PD.postInventoryFromReceiving(rcv.id);
        if (res && res.ok){
          completeMsg += (res.already ? ' • Inventory already updated' : ' • Inventory updated');
        }
      }

      // Refresh local object after potential inventory posting
      const store2 = getStore();
      const rcv2 = (store2.receivings||[]).find(x=>String(x.id)===String(rcv.id));
      if (rcv2) rcv = rcv2;
      toast(completeMsg);
      renderDetail(rcv);
      renderList();
    }

    // Quick receive modal
    const modal = document.getElementById('quickReceiveModal');
    const sel = document.getElementById('qrPoSelect');
    function openQuickReceive(){
      const store = getStore();
      const options = (store.pos||[]).filter(p=> p.status==='Sent' || p.status==='Partially received');
      if (!options.length){ toast('No PO available (Sent/Partially received)'); return; }
      sel.innerHTML = options.map(po=>`<option value="${po.id}">${po.id} • ${po.supplier||'—'} • ${po.expectedDate||'—'}</option>`).join('');
      modal.style.display = 'flex';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeQuickReceive(){ modal.style.display = 'none'; modal.classList.remove('open'); document.body.style.overflow=''; }

    // Click outside to close
    modal.addEventListener('click', (e)=>{
      if (e.target === modal) closeQuickReceive();
    });


    // Wire events
    document.getElementById('backToRcvList')?.addEventListener('click', (e)=>{ e.preventDefault(); backToList(); });
    document.getElementById('rcvSearch')?.addEventListener('input', renderList);
    document.querySelectorAll('.chip[data-filter]').forEach(ch=>{
      ch.addEventListener('click', ()=>{
        document.querySelectorAll('.chip[data-filter]').forEach(x=>x.classList.remove('active'));
        ch.classList.add('active');
        rcvFilter = ch.getAttribute('data-filter') || 'All';
        renderList();
      });
    });

    document.getElementById('btnQuickReceive')?.addEventListener('click', openQuickReceive);
    document.getElementById('closeQuickReceive')?.addEventListener('click', closeQuickReceive);
    document.getElementById('cancelQuickReceive')?.addEventListener('click', closeQuickReceive);
    document.getElementById('startQuickReceive')?.addEventListener('click', ()=>{
      const poId = sel.value;
      if (!poId){ toast('Pick a PO'); return; }
      const rcv = upsertReceivingFromPO(poId);
      closeQuickReceive();
      if (rcv) window.location.hash = '#/procurement/receiving/' + rcv.id;
    });



    // Confirm receiving modal events
    document.getElementById('closeConfirmReceiving')?.addEventListener('click', closeConfirmReceiving);
    document.getElementById('confirmReceivingNo')?.addEventListener('click', closeConfirmReceiving);
    document.getElementById('confirmReceivingYes')?.addEventListener('click', ()=>{
      closeConfirmReceiving();
      completeReceiving();
    });

    document.getElementById('btnSaveReceiving')?.addEventListener('click', saveDraft);
    document.getElementById('btnMarkOK')?.addEventListener('click', markAllOK);
    document.getElementById('btnCompleteReceiving')?.addEventListener('click', openConfirmReceiving);
    document.getElementById('btnBillFromReceiving')?.addEventListener('click', ()=>{
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      if (!isOwner){ toast('No permission. Please wait for approval.'); return; }
      const store = getStore();
      const rcv = (store.receivings||[]).find(r=>String(r.id)===String(currentRcvId));
      if (!rcv){ toast('Receiving not found'); return; }
      if (String(rcv.status||'')!=='Completed'){
        toast('Complete receiving first');
        return;
      }
      const po = (store.pos||[]).find(p=>String(p.id)===String(rcv.poId));
      if (!po){ toast('Linked PO not found'); return; }
      const bill = PD.createBillFromPO ? PD.createBillFromPO(po.id, { useReceivedQty:true }) : null;
      if (bill){
        window.location.hash = '#/procurement/bills/' + bill.id;
      } else toast('Failed to create bill');
    });

    // Seed + list
    seedReceivings();
    renderList();

    // Deep-link: #/procurement/receiving/<RCV-...> OR /<PO-...>
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    const maybeId = parts.length >= 4 ? decodeURIComponent(parts.slice(3).join('/')) : null;
    if (maybeId){
      if (maybeId.startsWith('RCV-')){
        openDetail(maybeId);
      } else if (maybeId.startsWith('PO-')){
        const r = upsertReceivingFromPO(maybeId);
        if (r) openDetail(r.id);
      } else {
        rcvDetailView.style.display='none';
        rcvListView.style.display='block';
      }
    } else {
      rcvDetailView.style.display='none';
      rcvListView.style.display='block';
    }
  }

  window.Pages = window.Pages || {};
  window.Pages.receiving = { render, init };
})();
