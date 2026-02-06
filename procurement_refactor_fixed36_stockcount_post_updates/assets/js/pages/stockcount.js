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
            <button class="chip active" data-filter="not">Not counted <span class="count" id="cNot">0</span></button>
            <button class="chip" data-filter="counted">Counted <span class="count" id="cCounted">0</span></button>
            <button class="chip" data-filter="all">All <span class="count" id="cAll">0</span></button>
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
        <tbody id="countBody"></tbody>
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
            Compare expected vs counted. For flagged items, update the recounted result here, then mark recounted.
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
        Note: “Needs recount” is suggested when qty variance &gt; 15% or counted expiry is 7+ days earlier than expected. You can update the counted result in this table.
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
            <div class="modal-sub">Choose scope and snapshot details.</div>
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
                <option>Condiments</option>
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
  const PD = window.ProcurementDemo;
  const UI = window.UI;

  const showToast = (msg) => {
    if (UI && typeof UI.toast === 'function') return UI.toast(msg);
    alert(msg);
  };

  // Safe listener helper
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  const SC_KEY = (PD?.STORE_KEY || 'procurement_demo') + '_stock_count_session_v1';

  // Keep category + expiry aligned with Ingredients page
  const meta = {
    '1001': { category:'Spices', nearestExpiry:'2026-06-30' },
    '1002': { category:'Condiments', nearestExpiry:'2027-01-10' },
    '1005': { category:'Spices', nearestExpiry:'2026-05-15' },
    '1008': { category:'Dairy', nearestExpiry:'2026-03-10' },
    '1012': { category:'Dairy', nearestExpiry:'2026-02-05' },
    '1016': { category:'Dairy', nearestExpiry:'2026-02-07' },
    '2001': { category:'Produce', nearestExpiry:'2026-01-31' },
    '2002': { category:'Produce', nearestExpiry:'2026-01-30' },
    '2006': { category:'Produce', nearestExpiry:'—' },
    '3001': { category:'Meat', nearestExpiry:'2026-02-12' },
    '5001': { category:'Meat', nearestExpiry:'2026-02-02' }
  };
  const allowSkus = new Set(Object.keys(meta));
  const uomLabels = { g: 'Gram (g)', ml: 'Milliliter (ml)', pcs: 'Piece (pcs)' };

  function nowStamp(){
    const d = new Date();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    const hh = String(d.getHours()).padStart(2,'0');
    const mi = String(d.getMinutes()).padStart(2,'0');
    return d.getFullYear() + '-' + mm + '-' + dd + ' ' + hh + ':' + mi;
  }

  function normalizeISODate(val){
    const s = (val || '').trim();
    if (!s) return '';
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m){
      const y = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10);
      const d = parseInt(m[3], 10);
      const dt = new Date(Date.UTC(y, mo - 1, d));
      if (!isNaN(dt.getTime()) && dt.getUTCFullYear() === y && (dt.getUTCMonth()+1) === mo && dt.getUTCDate() === d){
        return `${m[1]}-${m[2]}-${m[3]}`;
      }
      return '';
    }
    const dt = new Date(s);
    if (isNaN(dt.getTime())) return '';
    const y = dt.getFullYear();
    const mo = String(dt.getMonth()+1).padStart(2,'0');
    const d = String(dt.getDate()).padStart(2,'0');
    return `${y}-${mo}-${d}`;
  }

  function loadSession(){
    try{
      const raw = localStorage.getItem(SC_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.id || !s.items) return null;
      return s;
    }catch(e){
      return null;
    }
  }
  function saveSession(s){
    try{ localStorage.setItem(SC_KEY, JSON.stringify(s)); }catch(e){}
  }
  function clearSession(){
    try{ localStorage.removeItem(SC_KEY); }catch(e){}
  }

  function getStore(){
    return PD?.getStore?.() || {};
  }

  function buildSnapshotItems(store){
    const list = (store.items || [])
      .map(it => ({
        sku: String(it.sku || '').trim(),
        name: it.name || '—',
        baseUom: (PD?.getUomMeta ? (PD.getUomMeta(store, String(it.sku||'')).baseUom) : (it.uom || 'unit'))
      }))
      .filter(it => it.sku && allowSkus.has(it.sku));

    // stable order: Category then Name
    list.sort((a,b) => {
      const ca = (meta[a.sku]?.category || '').toLowerCase();
      const cb = (meta[b.sku]?.category || '').toLowerCase();
      if (ca !== cb) return ca.localeCompare(cb);
      return String(a.name||'').toLowerCase().localeCompare(String(b.name||'').toLowerCase());
    });

    const items = {};
    const order = [];
    list.forEach(it => {
      const sku = it.sku;
      const expectedQty = Number(store.inventory?.balances?.[sku] || 0);
      const expectedExp = String(
        (store.inventory && store.inventory.expiryBySku && store.inventory.expiryBySku[sku] != null)
          ? (store.inventory.expiryBySku[sku] || '—')
          : (meta[sku]?.nearestExpiry || '—')
      );
      const category = String(meta[sku]?.category || '—');
      items[sku] = {
        sku,
        name: it.name,
        category,
        unit: it.baseUom || 'unit',
        expectedQty,
        expectedExp,
        counted: false,
        countedQty: '',
        countedExp: '',
        batches: [],
        recounted: false,
        recountedAt: ''
      };
      order.push(sku);
    });
    return { items, order };
  }

  function reconcileSession(s, store){
    if (!s || !s.items) return null;
    // If schema changes or missing snapshot, rebuild while keeping any previous counts
    if (!Array.isArray(s.order)) s.order = Object.keys(s.items);
    s.items = s.items || {};
    s.step = Number(s.step || 2);
    s.scope = s.scope || 'all';
    s.category = (s.scope === 'category') ? (s.category || 'Spices') : null;
    s.location = s.location || 'Main storage';
    s.snapshot = s.snapshot || nowStamp();
    s.note = String(s.note || '');
    s.countFilter = s.countFilter || 'not';
    s.search = String(s.search || '');

    // Ensure items in snapshot still exist, and ensure required fields exist
    const existing = new Set(s.order);
    const snap = buildSnapshotItems(store);
    // If a SKU exists in store snapshot but not in session, add it (keeps UI stable)
    snap.order.forEach(sku => {
      if (!existing.has(sku)){
        s.order.push(sku);
        s.items[sku] = snap.items[sku];
      }
    });
    // Fill missing fields and refresh expected snapshot values only if they were missing
    s.order.forEach(sku => {
      const it = s.items[sku] || {};
      const fallback = snap.items[sku];
      if (!fallback) return;

      it.sku = sku;
      it.name = it.name || fallback.name;
      it.category = it.category || fallback.category;
      it.unit = it.unit || fallback.unit;
      if (it.expectedQty == null || isNaN(Number(it.expectedQty))) it.expectedQty = fallback.expectedQty;
      it.expectedExp = (it.expectedExp == null || it.expectedExp === '') ? fallback.expectedExp : it.expectedExp;

      it.counted = !!it.counted;
      it.countedQty = (it.countedQty == null) ? '' : String(it.countedQty);
      it.countedExp = (it.countedExp == null) ? '' : String(it.countedExp);
      if (!Array.isArray(it.batches)) it.batches = [];
      it.recounted = !!it.recounted;
      it.recountedAt = (it.recountedAt == null) ? '' : String(it.recountedAt);

      s.items[sku] = it;
    });
    return s;
  }

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

  // Session state (persisted)
  let session = null;

  const sessionPill = document.getElementById('sessionPill');
  const snapshotTime = document.getElementById('snapshotTime');
  const scopeLabel = document.getElementById('scopeLabel');

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
    if (setupSnapshot) setupSnapshot.value = nowStamp();
    if (setupNote) setupNote.value = '';
    if (setupScope) setupScope.value = 'all';
    if (setupCatWrap) setupCatWrap.style.display = 'none';
    setTimeout(() => setupScope?.focus?.(), 30);
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

  on(btnStartSession,'click', openSetup);
  on(btnStartSession2,'click', openSetup);

  const countBody = document.getElementById('countBody');
  const chips = document.getElementById('chips');
  const searchCount = document.getElementById('searchCount');
  const cNot = document.getElementById('cNot');
  const cCounted = document.getElementById('cCounted');
  const cAll = document.getElementById('cAll');
  let countFilter = 'not';

  function fmt(n){
    try{ return Number(n||0).toLocaleString('en-US'); }catch(e){ return String(n||0); }
  }
  function uomLabel(u){
    const key = String(u || '').trim();
    return uomLabels[key] || (key ? (key.toUpperCase() + ` (${key})`) : '—');
  }

  function renderCountRows(){
    if (!countBody) return;
    countBody.innerHTML = '';
    if (!session) return;

    session.order.forEach(sku => {
      const it = session.items[sku];
      if (!it) return;

      const expQty = Number(it.expectedQty || 0);
      const expExp = (it.expectedExp && it.expectedExp !== '') ? it.expectedExp : '—';
      const unit = it.unit || 'unit';
      const counted = !!it.counted;
      const cntQty = (it.countedQty || '').trim();

      const tr = document.createElement('tr');
      tr.setAttribute('data-sku', sku);
      tr.setAttribute('data-name', it.name);
      tr.setAttribute('data-category', it.category);
      tr.setAttribute('data-expected-qty', String(expQty));
      tr.setAttribute('data-expected-exp', (expExp === '—') ? '' : expExp);

      tr.dataset.counted = counted ? 'true' : 'false';
      tr.dataset.countedQty = it.countedQty || '';
      tr.dataset.countedExpiry = it.countedExp || '';
      tr.dataset.batches = JSON.stringify(it.batches || []);
      tr.dataset.unit = unit;

      tr.innerHTML = `
        <td class="name" style="font-weight:950;">
          ${it.name}
          <div class="mini-muted">Expected (tap to view): <span class="mono">${fmt(expQty)} ${unit}</span> · <span class="mono">${expExp}</span></div>
        </td>
        <td class="cell-muted">${it.category}</td>
        <td class="cell-muted">${uomLabel(unit)}</td>
        <td>
          <div class="td-input">
            <input type="number" min="0" step="1" class="cntQty" value="${cntQty}" placeholder="Enter counted qty" />
            <span class="cell-muted">${unit}</span>
          </div>
          <div class="mini-muted">Use total quantity (you can also add batches).</div>
        </td>
        <td>
          <button class="btn-secondary btnBatch" style="height:36px;border-radius:12px;">Add batch</button>
          <div class="mini-muted">Optional: log nearest expiry per batch.</div>
        </td>
        <td>${counted ? '<span class="tag counted"><span class="dot"></span> Counted</span>' : '<span class="tag not"><span class="dot"></span> Not counted</span>'}</td>
        <td style="text-align:right;">
          <button class="link-btn btnSave">${counted ? 'Update' : 'Save'}</button>
        </td>
      `;
      countBody.appendChild(tr);
    });
  }

  // Items within scope + search (NOT filtered by status)
  function baseSkus(){
    if (!session) return [];
    const q = (searchCount?.value || session.search || '').trim().toLowerCase();
    const inScope = (sku) => {
      if (session.scope !== 'category') return true;
      return (session.items[sku]?.category || '') === session.category;
    };
    return session.order.filter(sku => {
      if (!session.items[sku]) return false;
      if (!inScope(sku)) return false;
      const name = String(session.items[sku].name || '').toLowerCase();
      return (!q || name.includes(q));
    });
  }

  function updateCounts(){
    if (!session){
      cNot.textContent = '0';
      cCounted.textContent = '0';
      cAll.textContent = '0';
      return;
    }
    const skus = baseSkus();
    const counted = skus.filter(sku => !!session.items[sku]?.counted).length;
    const all = skus.length;
    const not = all - counted;
    cNot.textContent = String(not);
    cCounted.textContent = String(counted);
    cAll.textContent = String(all);
  }

  function applyCountFilter(){
    if (!session) return;
    const q = (searchCount?.value || '').trim().toLowerCase();
    session.search = q;
    saveSession(session);

    Array.from(document.querySelectorAll('#countBody tr')).forEach(tr => {
      const sku = tr.getAttribute('data-sku');
      const it = session.items[sku];
      if (!it){ tr.style.display = 'none'; return; }

      const inScope = (session.scope !== 'category') || (it.category === session.category);
      const name = String(it.name||'').toLowerCase();
      const matchesQ = !q || name.includes(q);
      const inBase = inScope && matchesQ;

      const isCounted = !!it.counted;
      const matchesStatus =
        countFilter === 'all' ? true :
        countFilter === 'counted' ? isCounted :
        !isCounted;

      tr.style.display = (inBase && matchesStatus) ? '' : 'none';
    });
    updateCounts();
  }

  on(chips,'click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    Array.from(chips.querySelectorAll('.chip')).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    countFilter = btn.dataset.filter;
    if (session){
      session.countFilter = countFilter;
      saveSession(session);
    }
    applyCountFilter();
  });
  on(searchCount,'input', applyCountFilter);

  function focusDefaultChip(){
    if (!chips) return;
    Array.from(chips.querySelectorAll('.chip')).forEach(b => b.classList.remove('active'));
    const sel = chips.querySelector(`[data-filter="${countFilter}"]`) || chips.querySelector('[data-filter="not"]');
    sel?.classList?.add('active');
  }

  function startNewSession(){
    const store = getStore();
    const scopeVal = setupScope ? setupScope.value : 'all';
    const snapshot = buildSnapshotItems(store);
    session = {
      id: (PD?.id ? PD.id('SC') : ('SC-' + Math.random().toString(16).slice(2))),
      createdAt: new Date().toISOString(),
      scope: scopeVal,
      category: scopeVal === 'category' ? (setupCategory?.value || 'Spices') : null,
      location: setupLocation?.value || 'Main storage',
      snapshot: (setupSnapshot?.value || nowStamp()),
      note: (setupNote?.value || '').trim(),
      step: 2,
      countFilter: 'not',
      search: '',
      order: snapshot.order,
      items: snapshot.items
    };
    saveSession(session);
  }

  on(btnSetupCreate,'click', () => {
    startNewSession();
    closeSetup();
    renderCountRows();
    snapshotTime.textContent = session.snapshot;
    scopeLabel.textContent = session.scope === 'all' ? 'Full store' : ('Category: ' + session.category);
    updateSessionPill();
    countFilter = session.countFilter || 'not';
    focusDefaultChip();
    setStep(2);
    showView('count');
    applyCountFilter();
    showToast('Session created');
  });

  // Batch modal
  const batchOverlay = document.getElementById('batchOverlay');
  const btnBatchClose = document.getElementById('btnBatchClose');
  const btnBatchCancel = document.getElementById('btnBatchCancel');
  const btnBatchSave = document.getElementById('btnBatchSave');
  const btnAddBatch = document.getElementById('btnAddBatch');
  const batchBox = document.getElementById('batchBox');
  const batchSub = document.getElementById('batchSub');
  let activeSku = null;

  function openBatch(sku){
    if (!session) return;
    const it = session.items[sku];
    if (!it) return;
    activeSku = sku;
    const unit = it.unit || 'unit';
    batchSub.textContent = 'Ingredient: ' + it.name + ' · Add one or more batches (qty + expiry).';
    batchBox.innerHTML = '';
    const batches = Array.isArray(it.batches) ? it.batches.slice() : [];
    if (batches.length === 0) batches.push({qty:'', exp:''});
    batches.forEach(b => addBatchRow(unit, b.qty, b.exp));
    batchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeBatch(){
    batchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    activeSku = null;
  }
  [btnBatchClose, btnBatchCancel].forEach(btn => on(btn,'click', closeBatch));
  on(batchOverlay,'click', (e) => { if (e.target === batchOverlay) closeBatch(); });

  function addBatchRow(unit, qty='', exp=''){
    const div = document.createElement('div');
    div.className = 'batch-row';
    const expIso = normalizeISODate(exp);
    div.innerHTML = `
      <input class="qty" type="number" min="0" step="1" placeholder="Qty" value="${qty}">
      <span class="cell-muted" style="font-weight:900;">${unit}</span>
      <input class="date" type="text" inputmode="numeric" placeholder="YYYY-MM-DD" value="${expIso}" aria-label="Expiry date (YYYY-MM-DD)">
      <button class="btn-secondary" style="height:34px;border-radius:12px;padding:0 10px;">Remove</button>
    `;
    div.querySelector('button')?.addEventListener('click', () => div.remove());
    batchBox.appendChild(div);
  }
  on(btnAddBatch,'click', () => {
    if (!session || !activeSku) return;
    const unit = session.items[activeSku]?.unit || 'unit';
    addBatchRow(unit);
  });

  on(btnBatchSave,'click', () => {
    if (!session || !activeSku) return;
    const it = session.items[activeSku];
    if (!it) return;
    const rows = Array.from(batchBox.querySelectorAll('.batch-row'));
    const batches = rows.map(r => ({
      qty: (r.querySelector('.qty')?.value || '').trim(),
      exp: normalizeISODate((r.querySelector('.date')?.value || '').trim())
    })).filter(b => b.qty || b.exp);

    it.batches = batches;

    // nearest expiry (earliest)
    let nearest = '';
    batches.forEach(b => {
      if (b.exp && (!nearest || b.exp < nearest)) nearest = b.exp;
    });
    it.countedExp = nearest || it.countedExp || '';

    // If user hasn't typed total qty, and batches have qty values, auto-sum
    const rowEl = document.querySelector(`#countBody tr[data-sku="${activeSku}"]`);
    const totalInput = rowEl?.querySelector('.cntQty');
    if (totalInput && !totalInput.value){
      const nums = batches.map(b => parseInt(b.qty || '0', 10)).filter(n => !isNaN(n));
      if (nums.length > 0){
        const sum = nums.reduce((a,c)=>a+c,0);
        totalInput.value = String(sum);
      }
    }

    saveSession(session);
    showToast('Batches saved');
    closeBatch();
  });

  // Delegated events on count table
  on(countBody,'click', (e) => {
    const row = e.target.closest('tr');
    if (!row || !session) return;
    const sku = row.getAttribute('data-sku');
    if (!sku || !session.items[sku]) return;

    if (e.target.closest('.btnBatch')){
      openBatch(sku);
      return;
    }

    if (e.target.closest('.btnSave')){
      const qty = (row.querySelector('.cntQty')?.value || '').trim();
      if (!qty){
        showToast('Enter counted qty first');
        row.querySelector('.cntQty')?.focus?.();
        return;
      }
      const it = session.items[sku];
      it.counted = true;
      it.countedQty = qty;
      it.recounted = false;
      it.recountedAt = '';

      // If batches exist, compute nearest expiry from them
      const batches = Array.isArray(it.batches) ? it.batches : [];
      if (batches.length > 0){
        let nearest = '';
        batches.forEach(b => { if (b.exp && (!nearest || b.exp < nearest)) nearest = b.exp; });
        it.countedExp = nearest || it.countedExp || '';
      }

      saveSession(session);

      // Update row UI
      row.dataset.counted = 'true';
      row.dataset.countedQty = it.countedQty;
      row.dataset.countedExpiry = it.countedExp || '';
      row.dataset.batches = JSON.stringify(it.batches || []);
      const tagCell = row.querySelector('td:nth-child(6)');
      if (tagCell) tagCell.innerHTML = '<span class="tag counted"><span class="dot"></span> Counted</span>';
      const btn = row.querySelector('.btnSave');
      if (btn) btn.textContent = 'Update';

      showToast('Saved');
      updateCounts();
      applyCountFilter();
      return;
    }

    // Tap expected in first cell (ignore clicks on inputs/buttons)
    if (e.target.closest('input') || e.target.closest('button')) return;
    const cell = e.target.closest('td');
    if (cell && cell.parentElement === row && cell.cellIndex === 0){
      const it = session.items[sku];
      const expQ = fmt(it.expectedQty);
      const expE = (it.expectedExp && it.expectedExp !== '' && it.expectedExp !== '—') ? it.expectedExp : '—';
      showToast(`Expected: ${expQ} ${it.unit} · ${expE}`);
    }
  });

  // Review
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
  const reviewEditMode = {};

  function daysBetween(a, b){
    if (!a || !b) return null;
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / (1000*60*60*24));
  }

  function computeReview(){
    if (!session){ reviewData = []; return; }
    const inScope = (sku) => {
      if (session.scope !== 'category') return true;
      return session.items[sku]?.category === session.category;
    };
    const skus = session.order.filter(sku => session.items[sku] && inScope(sku) && session.items[sku].counted);

    reviewData = skus.map(sku => {
      const it = session.items[sku];
      const expQty = parseInt(String(it.expectedQty || '0'), 10) || 0;
      const cntQty = parseInt(String(it.countedQty || '0'), 10) || 0;
      const expExp = (it.expectedExp && it.expectedExp !== '—') ? it.expectedExp : '';
      const cntExp = it.countedExp || '';
      const unit = it.unit || 'unit';

      const diff = cntQty - expQty;
      const pct = expQty > 0 ? Math.round(Math.abs(diff) / expQty * 100) : (cntQty > 0 ? 999 : 0);      let criteriaFlag = false;
      if (expQty === 0 && cntQty > 0) criteriaFlag = true;
      if (expQty > 0 && (Math.abs(diff) / expQty) > 0.15) criteriaFlag = true;

      // expiry earlier by >=7 days
      let expiryFlag = false;
      if (expExp && cntExp){
        const d = daysBetween(cntExp, expExp);
        if (d !== null && d >= 7) expiryFlag = true;
      }
      if (expiryFlag) criteriaFlag = true;

      const recounted = !!it.recounted;
      const needs = criteriaFlag && !recounted;

      const varianceText = (expQty === 0 && cntQty > 0) ? '+∞ (from 0)' : ((diff>=0?'+':'') + diff + ' (' + pct + '%)');
      return {
        sku,
        name: it.name,
        unit,
        expQty,
        cntQty,
        diff,
        expExp: expExp || '—',
        cntExp: cntExp || '—',
        varianceText,
        needsRecount: needs,
        flagged: criteriaFlag,
        recounted,
        expiryFlag
      };
    });

    // Counters
    const varianceOnly = reviewData.filter(d => d.diff !== 0 || (d.expExp !== d.cntExp && d.cntExp !== '—')).length;
    const needs = reviewData.filter(d => d.needsRecount).length;

    rVar.textContent = String(varianceOnly);
    rReview.textContent = String(needs);
    rAll.textContent = String(reviewData.length);

    const impact = reviewData.reduce((acc, d) => acc + Math.abs(d.diff) * 2, 0);
    impactPill.textContent = 'Estimated impact: IDR ' + impact.toLocaleString('en-US');

    reviewBanner.className = needs > 0 ? 'banner warn' : 'banner ok';
    reviewTitle.textContent = needs > 0 ? 'Recount recommended' : 'Looks good';
    reviewSub.textContent = needs > 0
      ? (needs + ' item(s) require recount due to large variance or early expiry.')
      : 'No items exceed variance thresholds.';
  }

  function renderReview(){
    if (!reviewBody) return;
    reviewBody.innerHTML = '';

    let items = reviewData.slice();
    if (reviewFilter === 'variance'){
      items = items.filter(d => d.diff !== 0 || d.expExp !== d.cntExp);
    } else if (reviewFilter === 'review'){
      items = items.filter(d => d.needsRecount);
    }

    items.forEach(d => {
      const tr = document.createElement('tr');
      const cntExpVal = (d.cntExp && d.cntExp !== '—') ? d.cntExp : '';
      const isEdit = d.needsRecount || !!reviewEditMode[d.sku];

      const countedQtyCell = isEdit
        ? `<div class="td-input"><input class="rQty" type="number" min="0" step="1" value="${d.cntQty}"><span class="cell-muted">${d.unit}</span></div>`
        : `<span class="mono">${d.cntQty} <span class="cell-muted">${d.unit}</span></span>`;

      const countedExpCell = isEdit
        ? `<div class="td-input"><input class="rExp" type="text" inputmode="numeric" placeholder="YYYY-MM-DD" value="${cntExpVal}" style="width:140px;"></div>`
        : `<span class="mono cell-muted">${d.cntExp}</span>`;

      const statusHtml = d.needsRecount
        ? `<span class="tag review"><span class="dot"></span> Needs recount</span>`
        : (d.flagged && d.recounted)
          ? `<span class="tag counted"><span class="dot"></span> Recounted</span>`
          : `<span class="tag counted"><span class="dot"></span> OK</span>`;

      let actionHtml = '';
      if (d.needsRecount){
        actionHtml = '<button class="link-btn btnRecount">Save &amp; mark recounted</button>';
      } else if (isEdit){
        actionHtml = '<div style="display:flex;gap:10px;justify-content:flex-end;"><button class="link-btn btnSaveEdit">Save</button><button class="link-btn btnCancelEdit">Cancel</button></div>';
      } else {
        actionHtml = '<button class="link-btn btnEdit">Edit</button>';
      }

      tr.innerHTML = `
        <td style="font-weight:950;">${d.name}</td>
        <td class="mono">${d.expQty} <span class="cell-muted">${d.unit}</span></td>
        <td>${countedQtyCell}</td>
        <td>${(() => {
          const vc = d.diff > 0 ? 'ok' : d.diff < 0 ? 'bad' : 'neutral';
          const extra = d.expiryFlag ? ' <span class="cell-muted">· shelf earlier</span>' : '';
          return `<span class="tag ${vc}" title="Variance vs expected"><span class="dot"></span>${d.varianceText}</span>${extra}`;
        })()}</td>
        <td class="mono cell-muted">${d.expExp}</td>
        <td>${countedExpCell}</td>
        <td>${statusHtml}</td>
        <td style="text-align:right;">${actionHtml}</td>
      `;

      const saveRow = ({ markRecounted }) => {
        if (!session || !session.items || !session.items[d.sku]) return;

        const rowQty = tr.querySelector('.rQty')?.value;
        const rowExp = tr.querySelector('.rExp')?.value;

        const qtyStr = (rowQty || '').trim();
        if (!qtyStr){
          showToast(markRecounted ? 'Enter recounted qty' : 'Enter counted qty');
          tr.querySelector('.rQty')?.focus?.();
          return;
        }
        const qty = parseInt(qtyStr, 10);
        if (isNaN(qty) || qty < 0){
          showToast('Invalid qty');
          tr.querySelector('.rQty')?.focus?.();
          return;
        }

        const iso = normalizeISODate((rowExp || '').trim());
        // allow blank, but if user typed something invalid, block
        if ((rowExp || '').trim() && !iso){
          showToast('Expiry must be YYYY-MM-DD');
          tr.querySelector('.rExp')?.focus?.();
          return;
        }

        const it = session.items[d.sku];
        it.counted = true;
        it.countedQty = String(qty);
        it.countedExp = iso || '';

        if (markRecounted){
          it.recounted = true;
          it.recountedAt = nowStamp();
        } else if (it.recounted){
          // keep recounted flag, but refresh timestamp if user is tweaking a previously recounted item
          it.recountedAt = nowStamp();
        }

        // exit edit mode
        try{ delete reviewEditMode[d.sku]; }catch(e){}

        saveSession(session);
        // keep count page in sync for when user goes back
        try{ renderCountRows(); }catch(e){}
        updateCounts();

        showToast(markRecounted ? 'Recount saved' : 'Count updated');
        computeReview();
        renderReview();
      };

      if (d.needsRecount){
        tr.querySelector('.btnRecount')?.addEventListener('click', () => saveRow({ markRecounted: true }));
      } else if (isEdit){
        tr.querySelector('.btnSaveEdit')?.addEventListener('click', () => saveRow({ markRecounted: false }));
        tr.querySelector('.btnCancelEdit')?.addEventListener('click', () => {
          try{ delete reviewEditMode[d.sku]; }catch(e){}
          renderReview();
        });
      } else {
        tr.querySelector('.btnEdit')?.addEventListener('click', () => {
          reviewEditMode[d.sku] = true;
          renderReview();
        });
      }

      reviewBody.appendChild(tr);
    });

  }

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
    session.step = 3;
    saveSession(session);
    setStep(3);
    showView('review');
    computeReview();
    renderReview();
  });

  on(btnBackCount,'click', () => {
    if (!session) return;
    session.step = 2;
    saveSession(session);
    setStep(2);
    showView('count');
  });

  on(btnPost,'click', () => {
	    if (!session) return;
	    // Ensure the latest edits are reflected
	    try{ computeReview(); }catch(e){}

	    const store = getStore();
	    store.inventory = store.inventory || { balances:{}, movements:{} };
	    store.inventory.balances = store.inventory.balances || {};
	    store.inventory.movements = store.inventory.movements || {};
	    store.inventory.expiryBySku = store.inventory.expiryBySku || {};

	    const postedDate = (session.snapshot && /^\d{4}-\d{2}-\d{2}$/.test(session.snapshot.slice(0,10)))
	      ? session.snapshot.slice(0,10)
	      : new Date().toISOString().slice(0,10);

	    const inScope = (sku) => {
	      if (session.scope !== 'category') return true;
	      return String(session.items?.[sku]?.category || '') === String(session.category || '');
	    };

	    const skus = (session.order||[]).filter(sku => {
	      const it = session.items && session.items[sku];
	      return !!(it && inScope(sku) && it.counted);
	    });
	    if (skus.length === 0){
	      showToast('No counted items to post');
	      return;
	    }

	    const baseMs = Date.now();
	    let moved = 0;
	    let expiryUpdated = 0;

	    skus.forEach((sku, idx) => {
	      const it = session.items[sku] || {};
	      const cntQty = parseInt(String(it.countedQty||'0'), 10);
	      const next = (isNaN(cntQty) || cntQty < 0) ? 0 : cntQty;
	      const prev = Number(store.inventory.balances[sku]||0);
	      const diff = next - prev;

	      // Persist nearest expiry (if provided)
	      const cntExp = String(it.countedExp || '').trim();
	      if (cntExp){
	        const prevExp = (store.inventory.expiryBySku[sku] != null) ? String(store.inventory.expiryBySku[sku]||'') : '';
	        if (prevExp !== cntExp){
	          store.inventory.expiryBySku[sku] = cntExp;
	          expiryUpdated++;
	        }
	      }

	      // Always set balance to the final counted quantity
	      store.inventory.balances[sku] = next;
	      if (!Array.isArray(store.inventory.movements[sku])) store.inventory.movements[sku] = [];

	      // Record a movement line even when variance is 0, so other pages show an audit trail.
	      const mType = diff >= 0 ? 'IN' : 'OUT';
	      const qty = Math.abs(diff);
	      const at = new Date(baseMs + idx).toISOString();
	      store.inventory.movements[sku].unshift({
	        at,
	        date: postedDate,
	        type: mType,
	        reference: session.id,
	        qty,
	        unit: it.unit || '',
	        balance: next,
	        note: 'Stock count' + (session.location ? (' · ' + session.location) : '') + (qty===0 ? ' · confirmed' : (' · ' + prev + ' → ' + next))
	      });
	      moved++;
	    });

	    PD?.saveStore?.(store);
	    showToast(`Posted: ${moved} item(s)` + (expiryUpdated ? ` · ${expiryUpdated} expiry update(s)` : ''));

	    session = null;
	    clearSession();
	    updateSessionPill();
	    setStep(1);
	    showView('empty');
	    updateCounts();
  });

  // Escape closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (setupOverlay.classList.contains('open')) closeSetup();
    if (batchOverlay.classList.contains('open')) closeBatch();
  });

  // Boot: restore existing session if any
  const store = getStore();
  session = reconcileSession(loadSession(), store);
  if (session){
    saveSession(session);
    renderCountRows();
    updateSessionPill();
    snapshotTime.textContent = session.snapshot;
    scopeLabel.textContent = session.scope === 'all' ? 'Full store' : ('Category: ' + session.category);
    countFilter = session.countFilter || 'not';
    focusDefaultChip();
    if (searchCount) searchCount.value = session.search || '';

    if (session.step === 3){
      setStep(3);
      showView('review');
      computeReview();
      renderReview();
    } else {
      setStep(2);
      showView('count');
      applyCountFilter();
    }
    updateCounts();
  } else {
    setStep(1);
    showView('empty');
    updateSessionPill();
    updateCounts();
  }
}

window.Pages = window.Pages || {};
window.Pages.stockcount = { render, init };
