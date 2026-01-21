function render(){
  return /*html*/`
<div class="breadcrumb">
      <span>Stock management</span>
      <span class="crumb-dot">›</span>
      <span>Stock count</span>
    </div>

    <div class="page-head">
      <div>
        <h1 class="page-title">Stock count</h1>
        <p class="page-desc">
          Create a stock count session, enter counted quantities (and batches/expiry if needed), then review variances before posting adjustments.
        </p>
      </div>

      <div class="right-actions">
        <button class="primary-btn" id="btnStartSession">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"></path>
          </svg>
          Start stock count
        </button>
      </div>
    </div>

    <!-- Stepper -->
    <div class="stepper" aria-label="Stock count steps">
      <div class="step active" id="step1"><span class="num">1</span> Setup</div>
      <div class="step-sep"></div>
      <div class="step" id="step2"><span class="num">2</span> Count</div>
      <div class="step-sep"></div>
      <div class="step" id="step3"><span class="num">3</span> Review &amp; Post</div>

      <div class="pill" style="margin-left:auto;" id="sessionPill">
        <span class="dot"></span>
        No active session
      </div>
    </div>

    <!-- STEP 2: COUNT (default empty until session created) -->
    <section id="viewCount" class="card" style="padding:14px;margin-top:14px; display:none;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:950;font-size:16px;">Count items</div>
          <div class="mini-muted" id="countSub">
            Session snapshot: <span class="mono" id="snapshotTime">2026-01-20 02:05</span> · Scope: <span id="scopeLabel">Full store</span>
          </div>
        </div>
        <div class="right-actions">
          <div class="chips" id="chips">
            <button class="chip active" data-filter="not">Not counted <span class="count" id="cNot">5</span></button>
            <button class="chip" data-filter="counted">Counted <span class="count" id="cCounted">0</span></button>
            <button class="chip" data-filter="all">All <span class="count" id="cAll">5</span></button>
          </div>
          <input class="input" id="searchCount" placeholder="Search / scan ingredient…" style="min-width:260px;" />
          <button class="primary-btn" id="btnGoReview" style="box-shadow:none;">
            Review &amp; post
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>

      <table class="count-table" aria-label="Count table">
        <thead>
          <tr>
            <th style="min-width:220px;">Ingredient</th>
            <th>Category</th>
            <th>Unit</th>
            <th style="min-width:240px;">Count entry</th>
            <th style="min-width:220px;">Batches / expiry</th>
            <th style="min-width:120px;">Status</th>
            <th style="min-width:120px;text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="countBody">
          <tr data-name="Anise Star" data-category="Spices" data-expected-qty="790" data-expected-exp="2026-02-14">
            <td class="name" style="font-weight:950;color:#0b2bd6;">Anise Star
              <div class="mini-muted">Expected (tap to view): <span class="mono">790 g</span> · <span class="mono">2026-02-14</span></div>
            </td>
            <td class="cell-muted">Spices</td>
            <td class="cell-muted">Gram (g)</td>
            <td>
              <div class="td-input">
                <input type="number" min="0" step="1" class="cntQty" value="" placeholder="Enter counted qty" />
                <span class="cell-muted">g</span>
              </div>
              <div class="mini-muted">Use total quantity (you can also add batches).</div>
            </td>
            <td>
              <button class="btn-secondary btnBatch" style="height:36px;border-radius:12px;">Add batch</button>
              <div class="mini-muted">Optional: log nearest expiry per batch.</div>
            </td>
            <td><span class="tag not"><span class="dot"></span> Not counted</span></td>
            <td style="text-align:right;">
              <button class="link-btn btnSave">Save</button>
            </td>
          </tr>

          <tr data-name="Avocado" data-category="Produce" data-expected-qty="0" data-expected-exp="">
            <td style="font-weight:950;">Avocado
              <div class="mini-muted">Expected (tap to view): <span class="mono">0 g</span> · <span class="mono">—</span></div>
            </td>
            <td class="cell-muted">Produce</td>
            <td class="cell-muted">Gram (g)</td>
            <td>
              <div class="td-input">
                <input type="number" min="0" step="1" class="cntQty" value="" placeholder="Enter counted qty" />
                <span class="cell-muted">g</span>
              </div>
            </td>
            <td>
              <button class="btn-secondary btnBatch" style="height:36px;border-radius:12px;">Add batch</button>
              <div class="mini-muted">Optional</div>
            </td>
            <td><span class="tag not"><span class="dot"></span> Not counted</span></td>
            <td style="text-align:right;"><button class="link-btn btnSave">Save</button></td>
          </tr>

          <tr data-name="Bacon" data-category="Meat" data-expected-qty="0" data-expected-exp="">
            <td style="font-weight:950;">Bacon
              <div class="mini-muted">Expected (tap to view): <span class="mono">0 g</span> · <span class="mono">—</span></div>
            </td>
            <td class="cell-muted">Meat</td>
            <td class="cell-muted">Gram (g)</td>
            <td>
              <div class="td-input">
                <input type="number" min="0" step="1" class="cntQty" value="" placeholder="Enter counted qty" />
                <span class="cell-muted">g</span>
              </div>
            </td>
            <td>
              <button class="btn-secondary btnBatch" style="height:36px;border-radius:12px;">Add batch</button>
              <div class="mini-muted">Optional</div>
            </td>
            <td><span class="tag not"><span class="dot"></span> Not counted</span></td>
            <td style="text-align:right;"><button class="link-btn btnSave">Save</button></td>
          </tr>

          <tr data-name="Balsamic Vinegar" data-category="Sauces" data-expected-qty="0" data-expected-exp="">
            <td style="font-weight:950;">Balsamic Vinegar
              <div class="mini-muted">Expected (tap to view): <span class="mono">0 g</span> · <span class="mono">—</span></div>
            </td>
            <td class="cell-muted">Sauces</td>
            <td class="cell-muted">Gram (g)</td>
            <td>
              <div class="td-input">
                <input type="number" min="0" step="1" class="cntQty" value="" placeholder="Enter counted qty" />
                <span class="cell-muted">g</span>
              </div>
            </td>
            <td>
              <button class="btn-secondary btnBatch" style="height:36px;border-radius:12px;">Add batch</button>
              <div class="mini-muted">Optional</div>
            </td>
            <td><span class="tag not"><span class="dot"></span> Not counted</span></td>
            <td style="text-align:right;"><button class="link-btn btnSave">Save</button></td>
          </tr>

          <tr data-name="Butter" data-category="Dairy" data-expected-qty="0" data-expected-exp="">
            <td style="font-weight:950;">Butter
              <div class="mini-muted">Expected (tap to view): <span class="mono">0 g</span> · <span class="mono">—</span></div>
            </td>
            <td class="cell-muted">Dairy</td>
            <td class="cell-muted">Gram (g)</td>
            <td>
              <div class="td-input">
                <input type="number" min="0" step="1" class="cntQty" value="" placeholder="Enter counted qty" />
                <span class="cell-muted">g</span>
              </div>
            </td>
            <td>
              <button class="btn-secondary btnBatch" style="height:36px;border-radius:12px;">Add batch</button>
              <div class="mini-muted">Optional</div>
            </td>
            <td><span class="tag not"><span class="dot"></span> Not counted</span></td>
            <td style="text-align:right;"><button class="link-btn btnSave">Save</button></td>
          </tr>
        </tbody>
      </table>

      <div class="hint" style="margin-top:10px;">
        Counting tip: keep it fast—search/scan, enter quantity, optionally add a batch with expiry, then Save. Review happens in the next step.
      </div>
    </section>

    <!-- STEP 3: REVIEW -->
    <section id="viewReview" class="card" style="padding:14px;margin-top:14px; display:none;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:950;font-size:16px;">Review &amp; post</div>
          <div class="mini-muted">
            Compare expected vs counted. Flagged items should be recounted before posting adjustments (prototype).
          </div>
        </div>
        <div class="right-actions">
          <button class="btn-secondary" id="btnBackCount" style="height:40px;border-radius:12px;">Back to counting</button>
          <button class="primary-btn" id="btnPost" style="box-shadow:none;">
            Post adjustments
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="banner ok" id="reviewBanner" style="margin-top:12px; display:flex;">
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div class="dot" style="width:10px;height:10px;border-radius:999px;margin-top:4px;"></div>
          <div>
            <div class="b-title" id="reviewTitle">Ready for review</div>
            <div class="b-sub" id="reviewSub">Run review to see variances.</div>
          </div>
        </div>
        <div class="impact" id="impactPill">Estimated impact: IDR —</div>
      </div>

      <div class="chips" style="margin-top:12px;">
        <button class="chip active" data-rfilter="variance">Variance only <span class="count" id="rVar">0</span></button>
        <button class="chip" data-rfilter="review">Needs recount <span class="count" id="rReview">0</span></button>
        <button class="chip" data-rfilter="all">All counted <span class="count" id="rAll">0</span></button>
        <button class="primary-btn" id="btnRunReview" style="height:34px;padding:0 12px;border-radius:999px;box-shadow:none;">
          Run review
        </button>
      </div>

      <table class="count-table" aria-label="Review table" id="reviewTable">
        <thead>
          <tr>
            <th style="min-width:220px;">Ingredient</th>
            <th>Expected qty</th>
            <th>Counted qty</th>
            <th>Variance</th>
            <th>Expected expiry</th>
            <th>Counted expiry</th>
            <th>Status</th>
            <th style="text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody id="reviewBody">
          <!-- filled by JS -->
        </tbody>
      </table>

      <div class="hint" style="margin-top:10px;">
        Note: “Needs recount” is suggested when qty variance &gt; 15% or counted expiry is 7+ days earlier than expected.
      </div>
    </section>

    <!-- Empty state -->
    <section id="viewEmpty" class="card" style="padding:16px;margin-top:14px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:950;font-size:16px;">No active stock count</div>
          <div class="mini-muted" style="margin-top:6px;">
            Start a new stock count session to freeze a snapshot and begin counting.
          </div>
        </div>
        <button class="primary-btn" id="btnStartSession2" style="box-shadow:none;">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"></path>
          </svg>
          Start stock count
        </button>
      </div>
    </section>

    <!-- Setup session modal -->
    <div class="modal-overlay" id="setupOverlay" aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Start stock count">
        <div class="modal-head">
          <div>
            <div class="modal-title">Start stock count</div>
            <div class="modal-sub">Choose scope and snapshot details (prototype).</div>
          </div>
          <button class="icon-btn" id="btnSetupClose" title="Close" style="background:#f3f4f6;border:1px solid var(--line);">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div>
              <label class="lbl">Scope</label>
              <select class="input" id="setupScope">
                <option value="all">Full store</option>
                <option value="category">By category</option>
              </select>
            </div>
            <div id="setupCatWrap" style="display:none;">
              <label class="lbl">Category</label>
              <select class="input" id="setupCategory">
                <option>Spices</option>
                <option>Produce</option>
                <option>Meat</option>
                <option>Sauces</option>
                <option>Dairy</option>
              </select>
            </div>
            <div>
              <label class="lbl">Location</label>
              <select class="input" id="setupLocation">
                <option>Main storage</option>
                <option>Kitchen</option>
                <option>Bar</option>
              </select>
            </div>
            <div>
              <label class="lbl">Snapshot time</label>
              <input class="input" id="setupSnapshot" placeholder="YYYY-MM-DD HH:MM" />
            </div>
          </div>
          <div style="margin-top:12px;">
            <label class="lbl">Note</label>
            <textarea class="input" id="setupNote" rows="3" placeholder="Optional" style="height:auto;"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-secondary" id="btnSetupCancel" style="height:40px;border-radius:12px;">Cancel</button>
          <button class="primary-btn" id="btnSetupCreate" style="box-shadow:none;">Create session</button>
        </div>
      </div>
    </div>

    <!-- Batch modal -->
    <div class="modal-overlay" id="batchOverlay" aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Batches">
        <div class="modal-head">
          <div>
            <div class="modal-title">Batches / expiry</div>
            <div class="modal-sub" id="batchSub">Ingredient</div>
          </div>
          <button class="icon-btn" id="btnBatchClose" title="Close" style="background:#f3f4f6;border:1px solid var(--line);">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div id="batchBox" style="display:grid;gap:10px;"></div>
          <button class="btn-secondary" id="btnAddBatch" style="margin-top:12px;height:38px;border-radius:12px;">Add another batch</button>
        </div>
        <div class="modal-foot">
          <button class="btn-secondary" id="btnBatchCancel" style="height:40px;border-radius:12px;">Cancel</button>
          <button class="primary-btn" id="btnBatchSave" style="box-shadow:none;">Save batches</button>
        </div>
      </div>
    </div>
  `;
}


async function init(){
  const showToast = (msg) => {
    if (window.UI && typeof window.UI.toast === 'function') return window.UI.toast(msg);
    alert(msg);
  };

  // Safe listener helper
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };
  
      // Stepper
      const step1 = document.getElementById('step1');
      const step2 = document.getElementById('step2');
      const step3 = document.getElementById('step3');
      function setStep(active){
        [step1, step2, step3].forEach((el, idx) => {
          el.classList.remove('active');
          el.classList.remove('done');
          const n = idx + 1;
          if (n < active) el.classList.add('done');
          if (n === active) el.classList.add('active');
        });
      }
  
      // Views
      const viewEmpty = document.getElementById('viewEmpty');
      const viewCount = document.getElementById('viewCount');
      const viewReview = document.getElementById('viewReview');
      function showView(which){
        viewEmpty.style.display = (which === 'empty') ? '' : 'none';
        viewCount.style.display = (which === 'count') ? '' : 'none';
        viewReview.style.display = (which === 'review') ? '' : 'none';
      }
  
      // Session state (UI only)
      let session = null; // {scope, category, location, snapshot, note}
      const sessionPill = document.getElementById('sessionPill');
      const snapshotTime = document.getElementById('snapshotTime');
      const scopeLabel = document.getElementById('scopeLabel');
      const countSub = document.getElementById('countSub');
  
      function updateSessionPill(){
        if (!session){
          sessionPill.innerHTML = '<span class="dot"></span> No active session';
          return;
        }
        sessionPill.innerHTML = '<span class="dot" style="background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.16)"></span> Active: ' 
          + (session.scope === 'all' ? 'Full store' : ('Category: ' + session.category)) + ' · ' + session.location;
      }
  
      // Setup modal
      const btnStartSession = document.getElementById('btnStartSession');
      const btnStartSession2 = document.getElementById('btnStartSession2');
      const setupOverlay = document.getElementById('setupOverlay');
      const btnSetupClose = document.getElementById('btnSetupClose');
      const btnSetupCancel = document.getElementById('btnSetupCancel');
      const btnSetupCreate = document.getElementById('btnSetupCreate');
      const setupScope = document.getElementById('setupScope');
      const setupCatWrap = document.getElementById('setupCatWrap');
      const setupCategory = document.getElementById('setupCategory');
      const setupLocation = document.getElementById('setupLocation');
      const setupSnapshot = document.getElementById('setupSnapshot');
      const setupNote = document.getElementById('setupNote');
  
      function openSetup(){
        setupOverlay.classList.add('open');
        setupOverlay.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
        setupNote.value = '';
        setupScope.value = 'all';
        setupCatWrap.style.display = 'none';
        setTimeout(() => setupScope.focus(), 30);
      }
      function closeSetup(){
        setupOverlay.classList.remove('open');
        setupOverlay.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
      }
      [btnSetupClose, btnSetupCancel].forEach(btn => on(btn,'click', closeSetup));
      on(setupOverlay,'click', (e) => { if (e.target === setupOverlay) closeSetup(); });
      on(setupScope,'change', () => {
        if (!setupCatWrap) return;
        setupCatWrap.style.display = (setupScope.value === 'category') ? '' : 'none';
      });
  
      function nowStamp(){
        const d = new Date();
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        const hh = String(d.getHours()).padStart(2,'0');
        const mi = String(d.getMinutes()).padStart(2,'0');
        return d.getFullYear() + '-' + mm + '-' + dd + ' ' + hh + ':' + mi;
      }
      // keep snapshot input fresh
      if (setupSnapshot) setupSnapshot.value = nowStamp();
  
      on(btnStartSession,'click', () => { if (setupSnapshot) setupSnapshot.value = nowStamp(); openSetup(); });
      on(btnStartSession2,'click', () => { if (setupSnapshot) setupSnapshot.value = nowStamp(); openSetup(); });
  
      on(btnSetupCreate,'click', () => {
        const scopeVal = setupScope ? setupScope.value : 'all';
        session = {
          scope: scopeVal,
          category: scopeVal === 'category' ? (setupCategory?.value || '') : null,
          location: setupLocation?.value || 'Main storage',
          snapshot: (setupSnapshot?.value || nowStamp()),
          note: (setupNote?.value || '').trim()
        };
        updateSessionPill();
  
        // Apply scope filter to count table
        const rows = Array.from(document.querySelectorAll('#countBody tr'));
        rows.forEach(tr => {
          if (session.scope === 'category'){
            tr.style.display = (tr.getAttribute('data-category') === session.category) ? '' : 'none';
          } else {
            tr.style.display = '';
          }
        });
  
        snapshotTime.textContent = session.snapshot;
        scopeLabel.textContent = session.scope === 'all' ? 'Full store' : ('Category: ' + session.category);
  
        // reset count entries
        rows.forEach(tr => {
          tr.dataset.countedQty = '';
          tr.dataset.countedExpiry = '';
          tr.dataset.batches = '[]';
          tr.querySelector('.cntQty').value = '';
          // reset status tag
          const tag = tr.querySelector('.tag');
          tag.className = 'tag not';
          tag.innerHTML = '<span class="dot"></span> Not counted';
        });
  
        closeSetup();
        setStep(2);
        showView('count');
        showToast('Session created');
        updateCounts();
      });
  
      // Count filters / search
      const chips = document.getElementById('chips');
      const searchCount = document.getElementById('searchCount');
      const cNot = document.getElementById('cNot');
      const cCounted = document.getElementById('cCounted');
      const cAll = document.getElementById('cAll');
      let countFilter = 'not';
  
      function visibleRows(){
        return Array.from(document.querySelectorAll('#countBody tr')).filter(tr => tr.style.display !== 'none');
      }
  
      function updateCounts(){
        const rows = visibleRows();
        const counted = rows.filter(r => (r.dataset.counted === 'true')).length;
        const all = rows.length;
        const not = all - counted;
        cNot.textContent = String(not);
        cCounted.textContent = String(counted);
        cAll.textContent = String(all);
      }
  
      function applyCountFilter(){
        const q = (searchCount.value || '').trim().toLowerCase();
        Array.from(document.querySelectorAll('#countBody tr')).forEach(tr => {
          // scope visibility already set by session; keep
          if (session && session.scope === 'category' && tr.getAttribute('data-category') !== session.category){
            tr.style.display = 'none';
            return;
          }
          const name = (tr.getAttribute('data-name') || '').toLowerCase();
          const matchesQ = !q || name.includes(q);
  
          const isCounted = tr.dataset.counted === 'true';
          const matchesStatus =
            countFilter === 'all' ? true :
            countFilter === 'counted' ? isCounted :
            !isCounted;
  
          tr.style.display = (matchesQ && matchesStatus) ? '' : 'none';
        });
        updateCounts();
      }
  
      on(chips,'click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        Array.from(chips.querySelectorAll('.chip')).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        countFilter = btn.dataset.filter;
        applyCountFilter();
      });
      on(searchCount,'input', applyCountFilter);
  
      // Batch modal
      const batchOverlay = document.getElementById('batchOverlay');
      const btnBatchClose = document.getElementById('btnBatchClose');
      const btnBatchCancel = document.getElementById('btnBatchCancel');
      const btnBatchSave = document.getElementById('btnBatchSave');
      const btnAddBatch = document.getElementById('btnAddBatch');
      const batchBox = document.getElementById('batchBox');
      const batchSub = document.getElementById('batchSub');
      let activeRow = null;
  
      function openBatch(row){
        activeRow = row;
        batchSub.textContent = 'Ingredient: ' + row.getAttribute('data-name') + ' · Add one or more batches (qty + expiry).';
        batchBox.innerHTML = '';
        const batches = JSON.parse(row.dataset.batches || '[]');
        if (batches.length === 0) batches.push({qty:'', exp:''});
        batches.forEach(b => addBatchRow(b.qty, b.exp));
        batchOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function closeBatch(){
        batchOverlay.classList.remove('open');
        document.body.style.overflow = '';
        activeRow = null;
      }
      [btnBatchClose, btnBatchCancel].forEach(btn => on(btn,'click', closeBatch));
      on(batchOverlay,'click', (e) => { if (e.target === batchOverlay) closeBatch(); });
  
      function addBatchRow(qty='', exp=''){
        const div = document.createElement('div');
        div.className = 'batch-row';
        div.innerHTML = `
          <input class="qty" type="number" min="0" step="1" placeholder="Qty" value="${qty}">
          <span class="cell-muted" style="font-weight:900;">g</span>
          <input class="date" type="date" value="${exp}">
          <button class="btn-secondary" style="height:34px;border-radius:12px;padding:0 10px;">Remove</button>
        `;
        const rm = div.querySelector('button');
        rm.addEventListener('click', () => div.remove());
        batchBox.appendChild(div);
      }
      on(btnAddBatch,'click', () => addBatchRow());
  
      // Open batch buttons in table
      document.querySelectorAll('.btnBatch').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const row = e.target.closest('tr');
          openBatch(row);
        });
      });
  
      on(btnBatchSave,'click', () => {
        if (!activeRow) return;
        const rows = Array.from(batchBox.querySelectorAll('.batch-row'));
        const batches = rows.map(r => ({
          qty: (r.querySelector('.qty').value || '').trim(),
          exp: (r.querySelector('.date').value || '').trim()
        })).filter(b => b.qty || b.exp);
  
        activeRow.dataset.batches = JSON.stringify(batches);
  
        // If batches exist, set nearest expiry to the earliest date, and sum qty if all provided
        let nearest = '';
        batches.forEach(b => {
          if (b.exp && (!nearest || b.exp < nearest)) nearest = b.exp;
        });
        if (nearest) activeRow.dataset.countedExpiry = nearest;
  
        // If user hasn't typed total qty, and batches have qty values, auto-sum
        const totalInput = activeRow.querySelector('.cntQty');
        if (totalInput && !totalInput.value){
          const nums = batches.map(b => parseInt(b.qty || '0', 10)).filter(n => !isNaN(n));
          if (nums.length > 0){
            const sum = nums.reduce((a,c)=>a+c,0);
            totalInput.value = String(sum);
          }
        }
  
        showToast('Batches saved');
        closeBatch();
      });
  
      // Save line (mark counted)
      document.querySelectorAll('.btnSave').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const row = e.target.closest('tr');
          const qty = (row.querySelector('.cntQty').value || '').trim();
          if (!qty){
            showToast('Enter counted qty first');
            row.querySelector('.cntQty').focus();
            return;
          }
          row.dataset.counted = 'true';
          row.dataset.countedQty = qty;
  
          // if batches set nearest expiry, keep; else use expected? leave blank
          const batches = JSON.parse(row.dataset.batches || '[]');
          if (batches.length > 0){
            // already computed in batch save; ensure
            let nearest = '';
            batches.forEach(b => { if (b.exp && (!nearest || b.exp < nearest)) nearest = b.exp; });
            row.dataset.countedExpiry = nearest || '';
          } else {
            row.dataset.countedExpiry = row.dataset.countedExpiry || '';
          }
  
          const tag = row.querySelector('.tag');
          tag.className = 'tag counted';
          tag.innerHTML = '<span class="dot"></span> Counted';
  
          showToast('Saved');
          updateCounts();
          applyCountFilter();
        });
      });
  
      // Count cell "tap to view expected" (quick modal via toast)
      document.querySelectorAll('#countBody .name, #countBody td:first-child').forEach(cell => {
        cell.addEventListener('click', (e) => {
          const row = e.target.closest('tr');
          const expQ = row.getAttribute('data-expected-qty') || '0';
          const expE = row.getAttribute('data-expected-exp') || '—';
          showToast('Expected: ' + expQ + ' g · ' + (expE || '—'));
        });
      });
  
      // Review building
      const btnGoReview = document.getElementById('btnGoReview');
      const btnBackCount = document.getElementById('btnBackCount');
      const btnRunReview = document.getElementById('btnRunReview');
      const btnPost = document.getElementById('btnPost');
      const reviewBody = document.getElementById('reviewBody');
      const reviewBanner = document.getElementById('reviewBanner');
      const reviewTitle = document.getElementById('reviewTitle');
      const reviewSub = document.getElementById('reviewSub');
      const impactPill = document.getElementById('impactPill');
  
      const rVar = document.getElementById('rVar');
      const rReview = document.getElementById('rReview');
      const rAll = document.getElementById('rAll');
  
      let reviewData = [];
      let reviewFilter = 'variance';
  
      function daysBetween(a, b){
        if (!a || !b) return null;
        const da = new Date(a + 'T00:00:00');
        const db = new Date(b + 'T00:00:00');
        return Math.round((db - da) / (1000*60*60*24));
      }
  
      function computeReview(){
        const rows = Array.from(document.querySelectorAll('#countBody tr')).filter(tr => tr.dataset.counted === 'true' && tr.style.display !== 'none');
        reviewData = rows.map(tr => {
          const name = tr.getAttribute('data-name');
          const expQty = parseInt(tr.getAttribute('data-expected-qty') || '0', 10) || 0;
          const cntQty = parseInt(tr.dataset.countedQty || '0', 10) || 0;
          const expExp = tr.getAttribute('data-expected-exp') || '';
          const cntExp = tr.dataset.countedExpiry || '';
  
          const diff = cntQty - expQty;
          const pct = expQty > 0 ? Math.round(Math.abs(diff) / expQty * 100) : (cntQty > 0 ? 999 : 0);
  
          let needs = false;
          if (expQty === 0 && cntQty > 0) needs = true;
          if (expQty > 0 && (Math.abs(diff) / expQty) > 0.15) needs = true;
  
          // expiry earlier by >=7 days
          let expiryFlag = false;
          if (expExp && cntExp){
            const d = daysBetween(cntExp, expExp); // exp - cnt
            if (d !== null && d >= 7) expiryFlag = true;
          }
          if (expiryFlag) needs = true;
  
          const varianceText = (expQty === 0 && cntQty > 0) ? '+∞ (from 0)' : ((diff>=0?'+':'') + diff + ' (' + pct + '%)');
  
          return {
            name, expQty, cntQty, diff, pct, expExp: expExp || '—', cntExp: cntExp || '—',
            varianceText,
            needsRecount: needs,
            expiryFlag
          };
        });
  
        // Counters
        const varianceOnly = reviewData.filter(d => d.diff !== 0 || (d.expExp !== d.cntExp && d.cntExp !== '—')).length;
        const needs = reviewData.filter(d => d.needsRecount).length;
  
        rVar.textContent = String(varianceOnly);
        rReview.textContent = String(needs);
        rAll.textContent = String(reviewData.length);
  
        // Estimated impact: fake using unit cost per g (IDR 2) for demo
        const impact = reviewData.reduce((acc, d) => acc + Math.abs(d.diff) * 2, 0);
        impactPill.textContent = 'Estimated impact: IDR ' + impact.toLocaleString();
  
        // Banner
        reviewBanner.className = needs > 0 ? 'banner warn' : 'banner ok';
        reviewTitle.textContent = needs > 0 ? 'Recount recommended' : 'Looks good';
        reviewSub.textContent = needs > 0
          ? (needs + ' item(s) require recount due to large variance or early expiry.')
          : 'No items exceed variance thresholds.';
      }
  
      function renderReview(){
        reviewBody.innerHTML = '';
        let items = reviewData.slice();
  
        if (reviewFilter === 'variance'){
          items = items.filter(d => d.diff !== 0 || d.expExp !== d.cntExp);
        } else if (reviewFilter === 'review'){
          items = items.filter(d => d.needsRecount);
        } // 'all' uses all
  
        items.forEach(d => {
          const status = d.needsRecount ? 'review' : 'counted';
          const statusText = d.needsRecount ? 'Needs recount' : 'OK';
          const actionText = d.needsRecount ? 'Mark recounted' : '—';
  
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-weight:950;">${d.name}</td>
            <td class="mono">${d.expQty} <span class="cell-muted">g</span></td>
            <td class="mono">${d.cntQty} <span class="cell-muted">g</span></td>
            <td class="mono">${d.varianceText}${d.expiryFlag ? ' · shelf earlier' : ''}</td>
            <td class="mono cell-muted">${d.expExp}</td>
            <td class="mono cell-muted">${d.cntExp}</td>
            <td><span class="tag ${d.needsRecount ? 'review' : 'counted'}"><span class="dot"></span> ${statusText}</span></td>
            <td style="text-align:right;">
              ${d.needsRecount ? '<button class="link-btn btnRecount">Mark recounted</button>' : '<span class="cell-muted">—</span>'}
            </td>
          `;
          if (d.needsRecount){
            tr.querySelector('.btnRecount').addEventListener('click', () => {
              // For prototype: just flip status to OK
              d.needsRecount = false;
              showToast('Marked recounted');
              computeReview();
              renderReview();
            });
          }
          reviewBody.appendChild(tr);
        });
      }
  
      // Review chips
      document.querySelectorAll('[data-rfilter]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-rfilter]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          reviewFilter = btn.dataset.rfilter;
          renderReview();
        });
      });
  
      on(btnRunReview,'click', () => {
        computeReview();
        renderReview();
        showToast('Review updated');
      });
  
      on(btnGoReview,'click', () => {
        if (!session){
          showToast('Create a session first');
          return;
        }
        setStep(3);
        showView('review');
        // auto compute
        computeReview();
        renderReview();
      });
  
      on(btnBackCount,'click', () => {
        setStep(2);
        showView('count');
      });
  
      on(btnPost,'click', () => {
        showToast('Posted (prototype)');
        // End session for prototype
        session = null;
        updateSessionPill();
        setStep(1);
        showView('empty');
      });
  
      // Escape closes modals
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (setupOverlay.classList.contains('open')) closeSetup();
        if (batchOverlay.classList.contains('open')) closeBatch();
      });
  
      // Initial state
      setStep(1);
      showView('empty');
      updateSessionPill();
}

window.Pages = window.Pages || {};
window.Pages.stockcount = { render, init };
