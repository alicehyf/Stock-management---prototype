function render(){
  return /*html*/`
    <div class="breadcrumb">
      <span>Stock management</span>
      <span class="crumb-dot">›</span>
      <span>Usage & issue-out</span>
    </div>

    <div class="page-head">
      <div>
        <h1 class="page-title">Usage / Issue-out</h1>
        <p class="page-desc">
          Record stock leaving inventory (sales usage, staff meal, waste, damage, transfers). Each issue creates <b>OUT</b> movements and updates on-hand balances.
        </p>
      </div>
      <div class="right-actions">
        <button class="primary-btn" id="btnNewIssue">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"></path></svg>
          New issue
        </button>
      </div>
    </div>

    <div class="split">
      <section class="card panel col-7">
        <div class="panel-head">
          <div>
            <div class="panel-title">Recent movement history</div>
            <div class="panel-sub">Latest IN/OUT events across key items.</div>
          </div>
          <div class="pill"><span class="dot"></span> Live</div>
        </div>

        <div class="table-wrap" style="margin-top:12px;">
          <table class="count-table" id="movTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Type</th>
                <th>Reference</th>
                <th class="mono">Qty</th>
                <th class="mono">Balance</th>
              </tr>
            </thead>
            <tbody id="movTbody"></tbody>
          </table>
        </div>
        <div class="hint" style="margin-top:10px;">Tip: create an Issue below to see balances change (“inventory starts breathing”).</div>
      </section>

      <section class="card panel col-5">
        <div class="panel-head">
          <div>
            <div class="panel-title">Issues</div>
            <div class="panel-sub">Each issue groups multiple OUT lines into one document.</div>
          </div>
          <button class="btn-secondary" id="btnViewAllIssues" type="button">View all</button>
        </div>

        <div class="table-wrap" style="margin-top:12px;">
          <table class="count-table" id="issuesTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Location</th>
                <th>Reason</th>
                <th class="right">Lines</th>
              </tr>
            </thead>
            <tbody id="issuesTbody"></tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Issue modal -->
    <div class="overlay" id="issueModal" aria-hidden="true">
      <div class="modal" style="max-width:980px;">
        <div class="modal-head">
          <div>
            <div class="modal-title">New issue-out</div>
            <div class="modal-sub">Choose items + quantities. UOM conversion is applied automatically.</div>
          </div>
          <button class="icon-btn" id="closeIssueModal" aria-label="Close">✕</button>
        </div>

        <div class="modal-body">
          <div class="grid" style="grid-template-columns: 1fr 1fr; gap:12px;">
            <div>
              <label class="label">Date</label>
              <input class="input" id="issDate" type="date" />
            </div>
            <div>
              <label class="label">Location</label>
              <select class="input" id="issLoc">
                <option>Main kitchen</option>
                <option>Beach restaurant</option>
                <option>Pool bar</option>
                <option>Outlet A</option>
              </select>
            </div>
            <div>
              <label class="label">Reason</label>
              <select class="input" id="issReason">
                <option>POS sales usage</option>
                <option>Staff meal</option>
                <option>Waste</option>
                <option>Damage</option>
                <option>Transfer out</option>
                <option>Recipe test</option>
              </select>
            </div>
            <div>
              <label class="label">Reference (optional)</label>
              <input class="input" id="issRef" placeholder="e.g., POS-2026-01-30 / Event / Note" />
            </div>
          </div>

          <div style="margin-top:14px; display:flex; align-items:center; justify-content:space-between;">
            <div style="font-weight:800;">Lines</div>
            <button class="btn-secondary" id="btnAddLine" type="button">Add line</button>
          </div>

          <div class="table-wrap" style="margin-top:10px;">
            <table class="count-table">
              <thead>
                <tr>
                  <th style="width:40%">Item</th>
                  <th style="width:14%" class="mono">On hand</th>
                  <th style="width:14%">Qty</th>
                  <th style="width:12%">UOM</th>
                  <th>Note</th>
                  <th class="right" style="width:60px">&nbsp;</th>
                </tr>
              </thead>
              <tbody id="linesTbody"></tbody>
            </table>
          </div>

          <div class="hint" style="margin-top:10px;">Quantities are stored and posted to inventory in the <b>base UOM</b>. If you issue in purchase UOM (e.g., 2 kg), we convert it into base (e.g., 2,000 g).</div>
        </div>

        <div class="modal-foot">
          <button class="btn" id="cancelIssue" type="button">Cancel</button>
          <button class="primary-btn" id="confirmIssue" type="button">Post issue</button>
        </div>
      </div>
    </div>
  `;
}

async function init(){
  const PD = window.ProcurementDemo || {};
  const getStore = PD.getStore;
  const saveStore = PD.saveStore;
  const toast = PD.toast || ((m)=>console.log(m));

  const movTbody = document.getElementById('movTbody');
  const issuesTbody = document.getElementById('issuesTbody');

  const modal = document.getElementById('issueModal');
  const linesTbody = document.getElementById('linesTbody');

  const dateEl = document.getElementById('issDate');
  const locEl = document.getElementById('issLoc');
  const reasonEl = document.getElementById('issReason');
  const refEl = document.getElementById('issRef');

  const qs = new URLSearchParams((window.location.hash.split('?')[1]||''));
  const presetSku = qs.get('sku') || '';

  function fmtQty(q, u){
    const n = Number(q||0);
    return (Number.isFinite(n) ? n.toLocaleString('en-US') : '0') + ' ' + (u||'');
  }

  function flattenMovements(store){
    const mv = (store.inventory && store.inventory.movements) ? store.inventory.movements : {};
    const itemsBySku = Object.fromEntries((store.items||[]).map(it=>[String(it.sku), it]));
    const all = [];
    Object.keys(mv||{}).forEach(sku=>{
      (mv[sku]||[]).slice(0,6).forEach(m=>{
        all.push({
          sku,
          name: (itemsBySku[sku] && itemsBySku[sku].name) ? itemsBySku[sku].name : ('SKU '+sku),
          date: m.date,
          type: m.type,
          reference: m.reference,
          qty: m.qty,
          unit: m.unit,
          balance: m.balance
        });
      });
    });
    all.sort((a,b)=> String(b.date||'').localeCompare(String(a.date||'')));
    return all.slice(0,18);
  }

  function renderMovementTable(){
    const store = getStore();
    const rows = flattenMovements(store);
    movTbody.innerHTML = rows.map(r=>{
      const tag = r.type==='OUT'
        ? '<span class="tag danger"><span class="dot"></span> OUT</span>'
        : '<span class="tag ok"><span class="dot"></span> IN</span>';
      return `
        <tr>
          <td class="mono cell-muted">${r.date||'—'}</td>
          <td style="font-weight:800;">${r.name}</td>
          <td>${tag}</td>
          <td class="mono">${(r.reference||'—').toString().slice(0,22)}</td>
          <td class="mono">${fmtQty(r.qty, r.unit)}</td>
          <td class="mono">${fmtQty(r.balance, r.unit)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderIssues(){
    const store = getStore();
    store.inventory = store.inventory || {};
    store.inventory.issues = store.inventory.issues || [];
    const rows = (store.inventory.issues||[]).slice(0,8);
    issuesTbody.innerHTML = rows.map(iss=>{
      return `
        <tr>
          <td class="mono">${iss.id}</td>
          <td class="mono cell-muted">${iss.date||'—'}</td>
          <td>${iss.location||'—'}</td>
          <td>${iss.reason||'—'}</td>
          <td class="right mono">${(iss.lines||[]).length}</td>
        </tr>
      `;
    }).join('') || `<tr><td colspan="5" class="cell-muted">No issues yet.</td></tr>`;
  }

  function openModal(){
    const store = getStore();
    if (dateEl) dateEl.value = new Date().toISOString().slice(0,10);
    if (locEl && !locEl.value) locEl.value = 'Main kitchen';
    if (reasonEl && !reasonEl.value) reasonEl.value = 'POS sales usage';
    if (refEl) refEl.value = '';

    linesTbody.innerHTML = '';
    addLine(presetSku || '');
    if (!presetSku) addLine('');

    modal.classList.add('open');
  }

  function closeModal(){
    modal.classList.remove('open');
  }

  function addLine(skuPreset){
    const store = getStore();
    const items = (store.items||[]).filter(it=>it.active!==false);
    const sku = String(skuPreset||'');

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <select class="input" data-line-sku style="height:38px;border-radius:12px;">
          <option value="">Select item</option>
          ${items.map(it=>`<option value="${it.sku}" ${String(it.sku)===sku?'selected':''}>${it.name} (SKU ${it.sku})</option>`).join('')}
        </select>
      </td>
      <td class="mono" data-line-onhand>—</td>
      <td><input class="input" data-line-qty type="number" min="0" step="1" value="0" style="height:38px;border-radius:12px;" /></td>
      <td>
        <select class="input" data-line-uom style="height:38px;border-radius:12px;"></select>
      </td>
      <td><input class="input" data-line-note placeholder="optional" style="height:38px;border-radius:12px;" /></td>
      <td class="right"><button class="icon-btn" data-line-remove title="Remove">✕</button></td>
    `;

    linesTbody.appendChild(row);

    function refreshLine(){
      const store = getStore();
      const skuEl = row.querySelector('[data-line-sku]');
      const uomSel = row.querySelector('[data-line-uom]');
      const onhandEl = row.querySelector('[data-line-onhand]');
      const sku = skuEl.value;
      if (!sku){
        onhandEl.textContent = '—';
        uomSel.innerHTML = '<option value="">—</option>';
        return;
      }
      const meta = PD.getUomMeta ? PD.getUomMeta(store, sku) : { baseUom:'unit', purchaseUom:'', purchaseToBase:0 };
      const base = meta.baseUom;
      const purchase = meta.purchaseUom;
      const bal = Number((store.inventory && store.inventory.balances && store.inventory.balances[sku]) || 0);
      const display = PD.formatQty ? PD.formatQty(store, sku, bal, true) : { primary: String(bal)+' '+base, secondary:'' };
      onhandEl.innerHTML = `<div class="mono">${display.primary}</div>${display.secondary?`<div class="cell-muted mono" style="margin-top:2px;">${display.secondary}</div>`:''}`;

      let opts = `<option value="${base}">${base} (base)</option>`;
      if (purchase && meta.purchaseToBase){
        opts += `<option value="${purchase}">${purchase} (purchase)</option>`;
      }
      uomSel.innerHTML = opts;
    }

    row.querySelector('[data-line-sku]')?.addEventListener('change', refreshLine);
    row.querySelector('[data-line-remove]')?.addEventListener('click', ()=> row.remove());
    refreshLine();
  }

  function collectLines(){
    const out = [];
    linesTbody.querySelectorAll('tr').forEach(tr=>{
      const sku = tr.querySelector('[data-line-sku]')?.value || '';
      const qty = Number(tr.querySelector('[data-line-qty]')?.value || 0);
      const uom = tr.querySelector('[data-line-uom]')?.value || '';
      const note = tr.querySelector('[data-line-note]')?.value || '';
      if (sku && qty>0) out.push({ sku, qty, uom, note });
    });
    return out;
  }

  function postIssue(){
    const lines = collectLines();
    if (!lines.length){ toast('Please add at least one line'); return; }
    const payload = {
      date: dateEl?.value || new Date().toISOString().slice(0,10),
      location: locEl?.value || 'Main kitchen',
      reason: reasonEl?.value || 'Usage',
      reference: (refEl?.value || '').trim(),
      lines
    };

    let res = null;
    try{
      res = PD.createStockIssue ? PD.createStockIssue(payload) : null;
    }catch(err){
      const msg = (err && err.message) ? err.message : 'Unable to post issue';
      toast(msg);
      return;
    }
    if (!res || !res.issue){ toast('Failed to post issue'); return; }
    closeModal();
    renderMovementTable();
    renderIssues();
    toast(`Posted ${res.issue.id} (${res.moved} item(s))`);
  }

  // UI events
  document.getElementById('btnNewIssue')?.addEventListener('click', openModal);
  document.getElementById('btnAddLine')?.addEventListener('click', ()=> addLine(''));
  document.getElementById('closeIssueModal')?.addEventListener('click', closeModal);
  document.getElementById('cancelIssue')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e)=>{ if (e.target===modal) closeModal(); });
  document.getElementById('confirmIssue')?.addEventListener('click', postIssue);

  document.getElementById('btnViewAllIssues')?.addEventListener('click', ()=>{
    toast('Showing latest issues');
  });

  document.addEventListener('keydown', (e)=>{ if (e.key==='Escape' && modal.classList.contains('open')) closeModal(); });

  // First render
  renderMovementTable();
  renderIssues();

  // Auto-open modal if deep link sku present
  if (presetSku) openModal();
}

window.Pages = window.Pages || {};
window.Pages.usage = { render, init };
