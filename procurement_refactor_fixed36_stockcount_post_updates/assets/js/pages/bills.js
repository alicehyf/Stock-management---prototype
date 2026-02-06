(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){ console.log(m); });

  function formatIDR(n){
    try{ return 'IDR ' + Number(n||0).toLocaleString('en-US'); }catch(e){ return 'IDR ' + (n||0); }
  }

  function statusTag(s){
    const st = s || 'Draft';
    if (st==='Posted') return '<span class="tag ok">Posted</span>';
    if (st==='Draft') return '<span class="tag neutral">Draft</span>';
    return '<span class="tag neutral">'+st+'</span>';
  }

  function payTag(s){
    const st = s || 'Unpaid';
    if (st==='Paid') return '<span class="tag ok">Paid</span>';
    if (st==='Partially paid') return '<span class="tag pending">Partially paid</span>';
    return '<span class="tag neutral">Unpaid</span>';
  }

  function matchTag(s){
    const st = s || 'Matched';
    if (st==='Matched') return '<span class="tag ok">Matched</span>';
    return '<span class="tag pending">'+st+'</span>';
  }

  function render(){
    return /*html*/`
<div id="billListView">
  <div class="breadcrumb"><span>Procurement</span><span class="crumb-dot">›</span><span>Bills & payments</span></div>

  <div class="page-head">
    <div>
      <h1 class="page-title">Bills & payments</h1>
      <p class="page-desc">Enter supplier invoices, validate with 3-way matching (PO vs Receiving vs Invoice), and track payment status.</p>
      <div class="stepper">
        <div class="step done"><span class="num">1</span> PR</div>
        <div class="step done"><span class="num">2</span> PO</div>
        <div class="step done"><span class="num">3</span> Receiving</div>
        <div class="step active"><span class="num">4</span> Bill / Pay</div>
      </div>
    </div>
    <div class="right-actions">
      <button class="primary-btn" id="btnNewBill">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"></path></svg>
        New bill
      </button>
    </div>
  </div>

  <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;">
    <div class="search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35" stroke-linecap="round"/><circle cx="11" cy="11" r="7"/></svg>
      <input id="billSearch" placeholder="Search bill #, supplier, PO, invoice..." />
    </div>
    <div class="chips">
      <button class="chip active" data-filter="All">All</button>
      <button class="chip" data-filter="Draft">Draft</button>
      <button class="chip" data-filter="Posted">Posted</button>
      <button class="chip" data-filter="Unpaid">Unpaid</button>
      <button class="chip" data-filter="Paid">Paid</button>
    </div>
  </div>

  <div class="card" style="margin-top:14px; padding:14px;">
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:12%;">Bill #</th>
            <th style="width:18%;">Supplier</th>
            <th style="width:12%;">PO #</th>
            <th style="width:14%;">Invoice #</th>
            <th style="width:12%;">Invoice date</th>
            <th style="width:12%;">Due date</th>
            <th style="width:12%;">Total</th>
            <th style="width:12%;">Match</th>
            <th style="width:12%;">Payment</th>
            <th class="right" style="width:6%;">Action</th>
          </tr>
        </thead>
        <tbody id="billTbody"></tbody>
      </table>
    </div>
  </div>
</div>

<div id="billDetailView" style="display:none;">
  <div class="breadcrumb">
    <a href="#" id="backToBillList" class="mini-muted" style="text-decoration:none;font-weight:950;">← Back</a>
    <span class="crumb-dot">›</span>
    <span>Procurement</span><span class="crumb-dot">›</span><span>Bills & payments</span>
  </div>

  <div class="page-head" style="align-items:flex-start;">
    <div>
      <h1 class="page-title" id="billTitle">Bill</h1>
      <p class="page-desc" id="billSubtitle"></p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
        <div id="billStatusTag"></div>
        <div id="billPayTag"></div>
        <div id="billMatchTag"></div>
      </div>
    </div>
    <div class="right-actions">
      <button class="btn-secondary" id="btnPostBill" style="height:40px;border-radius:12px;">Post bill</button>
      <button class="btn-secondary" id="btnApplyCredit" style="height:40px;border-radius:12px;">Apply credit</button>
      <button class="primary-btn" id="btnRecordPayment" style="box-shadow:none;">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14" stroke-linecap="round"></path><path d="M7 10h10" stroke-linecap="round"></path></svg>
        Record payment
      </button>
    </div>
  </div>

  <div class="split">
    <div class="card panel col-8">
      <div class="panel-head">
        <div>
          <div class="panel-title">3-way match</div>
          <div class="panel-sub">Compare PO vs Receiving vs Invoice lines. Mismatches are highlighted for review.</div>
        </div>
        <div class="panel-head-actions">
          <div class="tag neutral" id="billTotalsPill">Total</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="table-wrap">
        <table class="data-table" id="billMatchTable">
          <thead>
            <tr>
              <th style="width:26%;">Item</th>
              <th style="width:10%;">SKU</th>
              <th style="width:10%;">UOM</th>
              <th style="width:12%;">PO qty</th>
              <th style="width:12%;">Received</th>
              <th style="width:12%;">Invoiced</th>
              <th style="width:10%;">PO price</th>
              <th style="width:10%;">Inv price</th>
              <th class="right" style="width:12%;">Line total</th>
            </tr>
          </thead>
          <tbody id="billLinesTbody"></tbody>
        </table>
      </div>

      <div class="hint" style="margin-top:10px;">Posting a bill locks invoice fields. Payment status updates as you record payments.</div>
    </div>

    <div class="card panel col-4">
      <div class="panel-title">Bill summary</div>
      <div class="panel-sub">Supplier, PO link, totals, credits, and payments.</div>

      <div class="kv">
        <div class="cell"><div class="k">Supplier</div><div class="v" id="kvBillSupplier">—</div></div>
        <div class="cell"><div class="k">PO #</div><div class="v mono" id="kvBillPO">—</div></div>
        <div class="cell"><div class="k">Receiving</div><div class="v mono" id="kvBillRcv">—</div></div>
        <div class="cell"><div class="k">Invoice #</div><div class="v" id="kvBillInvNo">—</div></div>
        <div class="cell"><div class="k">Invoice date</div><div class="v mono" id="kvBillInvDate">—</div></div>
        <div class="cell"><div class="k">Due date</div><div class="v mono" id="kvBillDue">—</div></div>
        <div class="cell full" style="grid-column: span 2;"><div class="k">Total due</div><div class="v" id="kvBillTotal">—</div></div>
        <div class="cell"><div class="k">Paid</div><div class="v" id="kvBillPaid">—</div></div>
        <div class="cell"><div class="k">Balance</div><div class="v" id="kvBillBalance">—</div></div>
      </div>

      <div class="divider"></div>

      <div style="font-weight:950;">Credits applied</div>
      <div class="muted-note">Vendor credits reduce what you pay (e.g., short shipments).</div>
      <div id="billCreditsBox" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>

      <div class="divider"></div>

      <div style="font-weight:950;">Payments</div>
      <div class="muted-note">Record partial payments and track balance.</div>
      <div id="billPaymentsBox" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>

      <div class="divider"></div>

      <div style="font-weight:950;">Activity</div>
      <div class="timeline" id="billTimeline"></div>
    </div>
  </div>
</div>

<!-- Create Bill modal -->
<div class="modal-overlay" id="billCreateModal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="billCreateTitle">
    <div class="modal-head">
      <div>
        <div class="modal-title" id="billCreateTitle">New bill</div>
        <div class="modal-sub">Create an invoice record from a PO / Receiving or enter manually.</div>
      </div>
      <button class="icon-btn" id="closeBillCreate" title="Close" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"></path></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-field wide">
          <div class="k">Supplier</div>
          <div class="v"><select id="billCreateSupplier" class="input"></select></div>
        </div>
        <div class="form-field wide">
          <div class="k">Source PO (optional)</div>
          <div class="v"><select id="billCreatePO" class="input"></select></div>
        </div>
        <div class="form-field">
          <div class="k">Invoice #</div>
          <div class="v"><input id="billCreateInvNo" class="input" placeholder="e.g., INV-000123" /></div>
        </div>
        <div class="form-field">
          <div class="k">Invoice date</div>
          <div class="v"><input id="billCreateInvDate" class="input" type="date" /></div>
        </div>
        <div class="form-field">
          <div class="k">Use received qty as invoiced</div>
          <div class="v" style="display:flex;align-items:center;gap:8px;">
            <input id="billCreateUseReceived" type="checkbox" checked />
            <span class="muted-note">Recommended</span>
          </div>
        </div>
      </div>
      <div class="hint" style="margin-top:10px;">If you select a PO, the bill lines are pre-filled and ready for 3-way matching.</div>
    </div>
    <div class="modal-foot">
      <button class="btn-secondary" id="cancelBillCreate" type="button">Cancel</button>
      <button class="primary-btn" id="confirmBillCreate" type="button">Create bill</button>
    </div>
  </div>
</div>

<!-- Record payment modal -->
<div class="modal-overlay" id="billPayModal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="billPayTitle">
    <div class="modal-head">
      <div>
        <div class="modal-title" id="billPayTitle">Record payment</div>
        <div class="modal-sub">Add a payment record for this bill.</div>
      </div>
      <button class="icon-btn" id="closeBillPay" title="Close" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"></path></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-field">
          <div class="k">Payment date</div>
          <div class="v"><input id="billPayDate" class="input" type="date" /></div>
        </div>
        <div class="form-field">
          <div class="k">Amount</div>
          <div class="v"><input id="billPayAmount" class="input" type="number" min="0" value="0" /></div>
        </div>
        <div class="form-field wide">
          <div class="k">Method</div>
          <div class="v"><select id="billPayMethod" class="input">
            <option>Bank transfer</option>
            <option>Cash</option>
            <option>Card</option>
            <option>Other</option>
          </select></div>
        </div>
        <div class="form-field wide">
          <div class="k">Reference</div>
          <div class="v"><input id="billPayRef" class="input" placeholder="e.g., TRX-12345" /></div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn-secondary" id="cancelBillPay" type="button">Cancel</button>
      <button class="primary-btn" id="confirmBillPay" type="button">Record payment</button>
    </div>
  </div>
</div>

<!-- Apply credit modal -->
<div class="modal-overlay" id="billCreditModal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="billCreditTitle">
    <div class="modal-head">
      <div>
        <div class="modal-title" id="billCreditTitle">Apply vendor credit</div>
        <div class="modal-sub">Select an open vendor credit for this supplier.</div>
      </div>
      <button class="icon-btn" id="closeBillCredit" title="Close" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"></path></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-field wide">
          <div class="k">Vendor credit</div>
          <div class="v"><select id="billCreditSelect" class="input"></select></div>
          <div class="muted-note" id="billCreditHint" style="margin-top:6px;">—</div>
        </div>
        <div class="form-field">
          <div class="k">Apply amount</div>
          <div class="v"><input id="billCreditAmount" class="input" type="number" min="0" value="0" /></div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn-secondary" id="cancelBillCredit" type="button">Cancel</button>
      <button class="primary-btn" id="confirmBillCredit" type="button">Apply credit</button>
    </div>
  </div>
</div>
`;
  }

  function init(){
    if (!PD.getStore || !PD.saveStore){ console.warn('Store not loaded'); return; }

    const { getStore, saveStore, nowISO, createBillFromPO, recordPayment, applyCreditToBill, billTotal, billPaid, billPaymentStatus, billMatchSummary, can } = PD;

    const listView = document.getElementById('billListView');
    const detailView = document.getElementById('billDetailView');
    const tbody = document.getElementById('billTbody');

    let filter = 'All';
    let currentBillId = null;

    function getBillById(id){
      const store = getStore();
      return (store.bills||[]).find(b=>String(b.id)===String(id));
    }

    function openCreateModal(){
      if (!can || !can('create_po')){
        toast('No permission. Please create a PR and wait for approval.');
        return;
      }
      const store = getStore();
      const supSel = document.getElementById('billCreateSupplier');
      const poSel = document.getElementById('billCreatePO');
      const invDate = document.getElementById('billCreateInvDate');
      const invNo = document.getElementById('billCreateInvNo');

      supSel.innerHTML = (store.suppliers||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');

      const poOptions = (store.pos||[]);
      poSel.innerHTML = [`<option value="">— No PO (manual) —</option>`].concat(
        poOptions.map(po=>`<option value="${po.id}">${po.id} • ${po.supplier||'—'} • ${po.status||'—'}</option>`)
      ).join('');

      invDate.value = new Date().toISOString().slice(0,10);
      invNo.value = '';
      document.getElementById('billCreateUseReceived').checked = true;

      document.getElementById('billCreateModal').style.display = 'flex';
    }

    function closeModal(id){
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    }

    function renderList(){
      const store = getStore();
      const q = (document.getElementById('billSearch')?.value || '').trim().toLowerCase();

      let bills = (store.bills||[]).slice();

      bills = bills.filter(b=>{
        const payS = billPaymentStatus(store, b);
        if (filter==='All') return true;
        if (filter==='Draft') return String(b.status)==='Draft';
        if (filter==='Posted') return String(b.status)==='Posted';
        if (filter==='Unpaid') return payS==='Unpaid' || payS==='Partially paid';
        if (filter==='Paid') return payS==='Paid';
        return true;
      });

      if (q){
        bills = bills.filter(b=>{
          const blob = [b.id, b.supplier, b.poId, b.invoiceNo].join(' ').toLowerCase();
          return blob.includes(q);
        });
      }

      tbody.innerHTML = bills.map(b=>{
        const total = billTotal(b);
        const match = billMatchSummary(b);
        const payS = billPaymentStatus(store, b);
        return `
          <tr>
            <td class="mono">${b.id}</td>
            <td>${b.supplier||'—'}</td>
            <td class="mono">${b.poId||'—'}</td>
            <td>${b.invoiceNo||'—'}</td>
            <td class="mono">${b.invoiceDate||'—'}</td>
            <td class="mono">${b.dueDate||'—'}</td>
            <td>${formatIDR(total)}</td>
            <td>${matchTag(match)}</td>
            <td>${payTag(payS)}</td>
            <td class="right"><button class="link-btn" data-open="${b.id}">View</button></td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('[data-open]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const id = btn.getAttribute('data-open');
          if (id) window.location.hash = '#/procurement/bills/' + id;
        });
      });
    }

    function renderDetail(bill){
      const store = getStore();
      currentBillId = bill.id;

      listView.style.display = 'none';
      detailView.style.display = 'block';

      const total = billTotal(bill);
      const paid = billPaid(store, bill.id);
      const balance = Math.max(0, total - paid);
      const payS = billPaymentStatus(store, bill);
      const match = billMatchSummary(bill);

      document.getElementById('billTitle').textContent = bill.id;
      document.getElementById('billSubtitle').textContent = `${bill.supplier||'—'} • Invoice ${bill.invoiceNo||'—'} • Due ${bill.dueDate||'—'}`;
      document.getElementById('billStatusTag').innerHTML = statusTag(bill.status);
      document.getElementById('billPayTag').innerHTML = payTag(payS);
      document.getElementById('billMatchTag').innerHTML = matchTag(match);
      document.getElementById('billTotalsPill').textContent = `Total ${formatIDR(total)}`;

      document.getElementById('kvBillSupplier').textContent = bill.supplier||'—';
      document.getElementById('kvBillPO').textContent = bill.poId||'—';
      document.getElementById('kvBillRcv').textContent = bill.receivingId||'—';
      document.getElementById('kvBillInvNo').textContent = bill.invoiceNo||'—';
      document.getElementById('kvBillInvDate').textContent = bill.invoiceDate||'—';
      document.getElementById('kvBillDue').textContent = bill.dueDate||'—';
      document.getElementById('kvBillTotal').textContent = formatIDR(total);
      document.getElementById('kvBillPaid').textContent = formatIDR(paid);
      document.getElementById('kvBillBalance').textContent = formatIDR(balance);

      // Lines
      const tb = document.getElementById('billLinesTbody');
      tb.innerHTML = (bill.lines||[]).map(ln=>{
        const qtyMismatch = Number(ln.invoicedQty||0) > Number(ln.receivedQty||0) + 1e-9;
        const priceMismatch = (Number(ln.poUnitPrice||0) > 0) && (Number(ln.invoicedUnitPrice||0) > Number(ln.poUnitPrice||0) + 1e-9);
        const cls = (qtyMismatch || priceMismatch) ? 'row-warn' : '';
        const lineTotal = Number(ln.invoicedQty||0) * Number(ln.invoicedUnitPrice||0);
        return `
          <tr class="${cls}">
            <td>${ln.name||'—'}</td>
            <td class="mono">${ln.sku||'—'}</td>
            <td class="mono">${ln.uom||'—'}</td>
            <td class="mono">${Number(ln.poOrderedQty||0)}</td>
            <td class="mono">${Number(ln.receivedQty||0)}</td>
            <td class="mono">${Number(ln.invoicedQty||0)}</td>
            <td class="mono">${formatIDR(Number(ln.poUnitPrice||0))}</td>
            <td class="mono">${formatIDR(Number(ln.invoicedUnitPrice||0))}</td>
            <td class="right mono">${formatIDR(lineTotal)}</td>
          </tr>
        `;
      }).join('');

      // Credits
      const creditsBox = document.getElementById('billCreditsBox');
      const applied = bill.appliedCredits||[];
      if (!applied.length){
        creditsBox.innerHTML = '<div class="muted-note">No credits applied.</div>';
      } else {
        creditsBox.innerHTML = applied.map(c=>{
          return `<div class="mini-card"><div style="display:flex;justify-content:space-between;gap:10px;">
            <div><div style="font-weight:950;" class="mono">${c.creditId}</div><div class="muted-note">Applied</div></div>
            <div style="font-weight:950;">-${formatIDR(c.amount)}</div>
          </div></div>`;
        }).join('');
      }

      // Payments
      const payBox = document.getElementById('billPaymentsBox');
      const pays = (store.payments||[]).filter(p=>String(p.billId)===String(bill.id));
      if (!pays.length){
        payBox.innerHTML = '<div class="muted-note">No payments recorded.</div>';
      } else {
        payBox.innerHTML = pays.map(p=>{
          return `<div class="mini-card"><div style="display:flex;justify-content:space-between;gap:10px;">
            <div><div style="font-weight:950;" class="mono">${p.date||'—'}</div><div class="muted-note">${p.method||'—'} ${p.reference?('• '+p.reference):''}</div></div>
            <div style="font-weight:950;">${formatIDR(p.amount)}</div>
          </div></div>`;
        }).join('');
      }

      // Activity
      const tl = document.getElementById('billTimeline');
      tl.innerHTML = (bill.activity||[]).map(a=>`<div class="tl-item"><div class="at mono">${(a.at||'').replace('T',' ').slice(0,16)}</div><div class="tx">${a.text||''}</div></div>`).join('');

      // Buttons / permissions
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      document.getElementById('btnPostBill').disabled = !isOwner || bill.status==='Posted';
      document.getElementById('btnRecordPayment').disabled = !isOwner;
      document.getElementById('btnApplyCredit').disabled = !isOwner;

      if (!isOwner){
        document.getElementById('btnPostBill').title = 'No permission';
        document.getElementById('btnRecordPayment').title = 'No permission';
        document.getElementById('btnApplyCredit').title = 'No permission';
      }
    }

    function backToList(){
      currentBillId = null;
      detailView.style.display = 'none';
      listView.style.display = 'block';
      renderList();
      window.location.hash = '#/procurement/bills';
    }

    function openPaymentModal(){
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      if (!isOwner){ toast('No permission. Please wait for approval.'); return; }
      const d = document.getElementById('billPayDate');
      d.value = new Date().toISOString().slice(0,10);
      document.getElementById('billPayAmount').value = 0;
      document.getElementById('billPayRef').value = '';
      document.getElementById('billPayMethod').value = 'Bank transfer';
      document.getElementById('billPayModal').style.display = 'flex';
    }

    function openCreditModal(){
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      if (!isOwner){ toast('No permission. Please wait for approval.'); return; }
      const store = getStore();
      const bill = getBillById(currentBillId);
      if (!bill) return;
      const sel = document.getElementById('billCreditSelect');
      const open = (store.credits||[]).filter(c=>c.supplier===bill.supplier && String(c.status)==='Open');
      if (!open.length){ toast('No open vendor credits for this supplier'); return; }
      sel.innerHTML = open.map(c=>{
        const amt = (c.items||[]).reduce((s,it)=> s + Number(it.amount||0), 0);
        return `<option value="${c.id}" data-amt="${amt}">${c.id} • ${formatIDR(amt)} • ${c.reason||''}</option>`;
      }).join('');
      const firstAmt = Number(sel.selectedOptions?.[0]?.getAttribute('data-amt')||0);
      document.getElementById('billCreditAmount').value = firstAmt;
      document.getElementById('billCreditHint').textContent = `Available: ${formatIDR(firstAmt)} (Open)`;
      sel.onchange = ()=>{
        const amt = Number(sel.selectedOptions?.[0]?.getAttribute('data-amt')||0);
        document.getElementById('billCreditAmount').value = amt;
        document.getElementById('billCreditHint').textContent = `Available: ${formatIDR(amt)} (Open)`;
      };
      document.getElementById('billCreditModal').style.display = 'flex';
    }

    function postBill(){
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      if (!isOwner){ toast('No permission. Please wait for approval.'); return; }
      const store = getStore();
      const bill = (store.bills||[]).find(b=>String(b.id)===String(currentBillId));
      if (!bill) return;
      if (bill.status==='Posted'){ toast('Already posted'); return; }
      bill.status = 'Posted';
      bill.activity = bill.activity || [];
      bill.activity.unshift({ at: nowISO(), text:'Bill posted' });
      saveStore(store);
      toast('Bill posted');
      renderDetail(bill);
      renderList();
    }

    function createBillFromModal(){
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      if (!isOwner){ toast('No permission.'); return; }
      const store = getStore();
      const supplierId = document.getElementById('billCreateSupplier').value;
      const poId = document.getElementById('billCreatePO').value;
      const invNo = document.getElementById('billCreateInvNo').value.trim();
      const invDate = document.getElementById('billCreateInvDate').value;
      const useReceived = document.getElementById('billCreateUseReceived').checked;

      let bill = null;
      if (poId){
        bill = createBillFromPO(poId, { invoiceNo: invNo || undefined, invoiceDate: invDate || undefined, useReceivedQty: useReceived });
      } else {
        const sup = (store.suppliers||[]).find(s=>String(s.id)===String(supplierId));
        const invoiceDate = invDate || new Date().toISOString().slice(0,10);
        const dueDate = PD.computeDueDateForSupplier ? PD.computeDueDateForSupplier(store, supplierId, invoiceDate) : invoiceDate;
        bill = {
          id: PD.id ? PD.id('BILL') : ('BILL-' + Math.floor(Math.random()*90000+10000)),
          createdAt: nowISO(),
          status: 'Draft',
          supplierId,
          supplier: sup ? sup.name : '—',
          poId: null,
          receivingId: null,
          invoiceNo: invNo || ('INV-' + Math.floor(Math.random()*9000+1000)),
          invoiceDate,
          dueDate,
          currency: 'IDR',
          notes: '',
          appliedCredits: [],
          lines: [],
          activity: [{ at: nowISO(), text:'Bill created (manual)' }]
        };
        store.bills = store.bills || [];
        store.bills.unshift(bill);
        saveStore(store);
      }

      closeModal('billCreateModal');
      if (bill){
        toast('Bill created');
        window.location.hash = '#/procurement/bills/' + bill.id;
      }
    }

    function confirmPayment(){
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      if (!isOwner){ toast('No permission'); return; }
      const amount = Number(document.getElementById('billPayAmount').value||0);
      if (amount<=0){ toast('Enter amount'); return; }
      const date = document.getElementById('billPayDate').value;
      const method = document.getElementById('billPayMethod').value;
      const ref = document.getElementById('billPayRef').value.trim();
      recordPayment(currentBillId, { amount, date, method, reference: ref });
      closeModal('billPayModal');
      toast('Payment recorded');
      const b = getBillById(currentBillId);
      if (b) renderDetail(b);
      renderList();
    }

    function confirmCredit(){
      const isOwner = (PD.getRole && PD.getRole()==='owner');
      if (!isOwner){ toast('No permission'); return; }
      const crdId = document.getElementById('billCreditSelect').value;
      const amt = Number(document.getElementById('billCreditAmount').value||0);
      if (!crdId){ toast('Select credit'); return; }
      if (amt<=0){ toast('Enter amount'); return; }
      const ok = applyCreditToBill(currentBillId, crdId, amt);
      if (!ok){ toast('Failed to apply credit'); return; }
      closeModal('billCreditModal');
      toast('Credit applied');
      const b = getBillById(currentBillId);
      if (b) renderDetail(b);
      renderList();
    }

    // Wiring
    document.getElementById('btnNewBill')?.addEventListener('click', openCreateModal);
    document.getElementById('closeBillCreate')?.addEventListener('click', ()=>closeModal('billCreateModal'));
    document.getElementById('cancelBillCreate')?.addEventListener('click', ()=>closeModal('billCreateModal'));
    document.getElementById('confirmBillCreate')?.addEventListener('click', createBillFromModal);

    document.getElementById('backToBillList')?.addEventListener('click', (e)=>{ e.preventDefault(); backToList(); });

    document.getElementById('btnRecordPayment')?.addEventListener('click', openPaymentModal);
    document.getElementById('closeBillPay')?.addEventListener('click', ()=>closeModal('billPayModal'));
    document.getElementById('cancelBillPay')?.addEventListener('click', ()=>closeModal('billPayModal'));
    document.getElementById('confirmBillPay')?.addEventListener('click', confirmPayment);

    document.getElementById('btnApplyCredit')?.addEventListener('click', openCreditModal);
    document.getElementById('closeBillCredit')?.addEventListener('click', ()=>closeModal('billCreditModal'));
    document.getElementById('cancelBillCredit')?.addEventListener('click', ()=>closeModal('billCreditModal'));
    document.getElementById('confirmBillCredit')?.addEventListener('click', confirmCredit);

    document.getElementById('btnPostBill')?.addEventListener('click', postBill);

    document.getElementById('billSearch')?.addEventListener('input', renderList);
    document.querySelectorAll('.chip[data-filter]').forEach(ch=>{
      ch.addEventListener('click', ()=>{
        document.querySelectorAll('.chip[data-filter]').forEach(x=>x.classList.remove('active'));
        ch.classList.add('active');
        filter = ch.getAttribute('data-filter') || 'All';
        renderList();
      });
    });

    // Start
    renderList();

    // Deep-link
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    if (parts.length>=4){
      const maybeId = parts[3];
      const b = getBillById(maybeId);
      if (b) renderDetail(b);
    }
  }

  window.Pages = window.Pages || {};
  window.Pages.bills = { render, init };
})();
