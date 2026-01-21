function render(){
  return /*html*/`
<section class="view active" id="viewList">

    <div class="breadcrumb">
      <span>Stock management</span>
      <span class="crumb-dot">›</span>
      <span>Ingredients</span>
    </div>

    <div class="page-head">
      <div>
        <h1 class="page-title">Ingredients</h1>
        <p class="page-desc">
          Keep track of all ingredients, control costs, manage portions, and prevent waste by recording all ingredients.
          Manage ingredient stock through one list.
        </p>
      </div>
      <button class="primary-btn" id="btnAdd">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        Add Ingredients
      </button>
    </div>

    <div class="filters">
      <div class="search-inline">
        <input id="nameFilter" type="text" placeholder="Search by name" />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="M20 20l-3.5-3.5" stroke-linecap="round"></path>
        </svg>
      </div>
    </div>

    <div class="card table-wrap">
      <table id="ingredientsTable">
        <thead>
          <tr>
            <th style="min-width:220px;">Name</th>
            <th>SKU</th>
            <th>Unit Type</th>
            <th>Cost Excl Tax</th>
            <th>Unit price (per 100g)</th>
            <th>Supplier</th>
            <th>Current Stock</th>
            <th>Active</th>
            <th style="min-width:120px;">Actions</th>
          </tr>
        </thead>
                <tbody>
          <!-- Only this one row is clickable for the prototype -->
          <tr class="clickable-row" id="rowAnise">
            <td class="name">Anise Star</td>
            <td class="muted">1001</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 230</td>
            <td class="muted price-idr">IDR 23</td>
            <td class="muted">—</td>
            <td class="muted" id="stockAnise">790</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Avocado</td>
            <td class="muted">2001</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 35</td>
            <td class="muted price-idr">IDR 8</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Bacon</td>
            <td class="muted">3001</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 190</td>
            <td class="muted price-idr">IDR 19</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Balsamic Vinegar</td>
            <td class="muted">1002</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 199</td>
            <td class="muted price-idr">IDR 20</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Beans in Tomao Sauce</td>
            <td class="muted">1003</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 59</td>
            <td class="muted price-idr">IDR 6</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Bechamel</td>
            <td class="muted">1004</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 136</td>
            <td class="muted price-idr">IDR 14</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Beef</td>
            <td class="muted">3002</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 580</td>
            <td class="muted price-idr">IDR 58</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Beef Minced Meat</td>
            <td class="muted">3003</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 190</td>
            <td class="muted price-idr">IDR 19</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Black Pepper</td>
            <td class="muted">1005</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 20</td>
            <td class="muted price-idr">IDR 2</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Black Pepper Sauce</td>
            <td class="muted">1007</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 763</td>
            <td class="muted price-idr">IDR 76</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Black Sesame</td>
            <td class="muted">1006</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 74</td>
            <td class="muted price-idr">IDR 7</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Bok Choy</td>
            <td class="muted">2101</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 50</td>
            <td class="muted price-idr">IDR 5</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Bread</td>
            <td class="muted">4001</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 75</td>
            <td class="muted price-idr">IDR 8</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Burger Bread</td>
            <td class="muted">4002</td>
            <td class="muted">Unit</td>
            <td class="muted price-idr">IDR 13963</td>
            <td class="muted price-idr">—</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="name">Butter</td>
            <td class="muted">1008</td>
            <td class="muted">Gram</td>
            <td class="muted price-idr">IDR 150</td>
            <td class="muted price-idr">IDR 15</td>
            <td class="muted">—</td>
            <td class="muted">0</td>
            <td class="muted">Active</td>
            <td>
              <div class="actions">
                <div class="mini-ico" title="Delete">
                  <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/></svg>
                </div>
                <div class="mini-ico" title="Edit">
                  <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

      </table>
    </div>
  
    </section>

    <section class="view" id="viewDetail">
      <div class="breadcrumb">
        <span>Stock management</span>
        <span class="crumb-dot">›</span>
        <span>Ingredients</span>
        <span class="crumb-dot">›</span>
        <span id="detailCrumbName">Anise Star</span>
      </div>

      <div class="detail-head">
        <div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <h1 class="page-title" id="detailTitle" style="margin:0;">Anise Star</h1>
            <div class="status-pill" id="detailStatus" style="margin:0;"><span class="dot"></span> Active</div>
          </div>
          <p class="page-desc" style="margin-top:6px;">
            Ingredient detail (read-only). Review stock status, controls, and movement history.
          </p>
        </div>

        <div class="page-actions">
          <button class="back-btn" id="btnBack">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            Back to list
          </button>
          <div class="secondary-pill" title="Read-only">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
              <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7Z"></path>
            </svg>
            View only
          </div>
        </div>
      </div>

      <div class="card" style="padding:16px;">
        <div class="detail-grid">
          <div class="detail-card">
            <div class="k">Name</div>
            <div class="v"><span id="dName">Anise Star</span><span class="muted" style="font-weight:900;">SKU 1001</span></div>
          </div>

          <div class="detail-card">
            <div class="k">Unit</div>
            <div class="v"><span id="dUnit">Gram</span><span class="muted" style="font-weight:900;">—</span></div>
          

          <div class="detail-card">
            <div class="k">Unit price (per 100g)</div>
            <div class="v"><span id="dUnitPrice">IDR 23</span><span class="muted" style="font-weight:900;">—</span></div>
            <div class="sub">Reference unit cost for quick comparisons (prototype).</div>
          </div>
</div>

          <div class="detail-card">
            <div class="k">Amount (Current stock)</div>
            <div class="v"><span id="dAmount">790 g</span><span class="muted" style="font-weight:900;">—</span></div>
          </div>

          <div class="detail-card">
            <div class="k">Reorder point</div>
            <div class="v"><span id="dReorder">500 g</span><span class="muted" style="font-weight:900;">—</span></div>
            <div class="sub">Below this point, the system can recommend reorder (prototype).</div>
          </div>

          <div class="detail-card">
            <div class="k">Status</div>
            <div class="v"><span>Active</span><span class="muted" style="font-weight:900;">—</span></div>
          </div>

          <div class="detail-card">
            <div class="k">Nearest shelf life</div>
            <div class="v"><span id="dShelf">2026-02-14</span><span class="muted" style="font-weight:900;">—</span></div>
            <div class="sub">Closest batch expiration date among available stock.</div>
          </div>
</div>
      </div>

      
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;">
  <div class="section-title" style="margin:0;">In &amp; Out history</div>
  <button class="primary-btn" id="btnAdjust" style="height:38px;padding:0 14px;border-radius:12px;box-shadow:none;">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
    </svg>
    Manual adjustment
  </button>
</div>

      <table class="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Reference</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Balance</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="muted">2026-01-08</td>
            <td><span class="badge-in">IN</span></td>
            <td class="muted">PO-1021</td>
            <td>+1000</td>
            <td class="muted">g</td>
            <td>1000</td>
            <td class="muted">Supplier delivery</td>
          </tr>
          <tr>
            <td class="muted">2026-01-10</td>
            <td><span class="badge-out">OUT</span></td>
            <td class="muted">Sale #88421</td>
            <td>-120</td>
            <td class="muted">g</td>
            <td>880</td>
            <td class="muted">Recipe deduction</td>
          </tr>
          <tr>
            <td class="muted">2026-01-12</td>
            <td><span class="badge-out">OUT</span></td>
            <td class="muted">Waste log</td>
            <td>-30</td>
            <td class="muted">g</td>
            <td>850</td>
            <td class="muted">Expired portion</td>
          </tr>
          <tr>
            <td class="muted">2026-01-15</td>
            <td><span class="badge-out">OUT</span></td>
            <td class="muted">Sale #88902</td>
            <td>-80</td>
            <td class="muted">g</td>
            <td>770</td>
            <td class="muted">Recipe deduction</td>
          </tr>
          <tr>
            <td class="muted">2026-01-18</td>
            <td><span class="badge-in">IN</span></td>
            <td class="muted">Adjustment</td>
            <td>+20</td>
            <td class="muted">g</td>
            <td>790</td>
            <td class="muted">Stock count correction</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}


async function init(){
  function formatIDR(valueText){
        const t = String(valueText || '').trim();
        if (!t || t === '—') return t;
        // Avoid double prefix
        if (t.startsWith('IDR ')) return t;
        return 'IDR ' + t;
      }
  
      function applyIDRFormatting(){
        // List: price cells
        document.querySelectorAll('.price-idr').forEach(td => {
          td.textContent = formatIDR(td.textContent);
        });
  
        // Detail: unit price per 100g
        const dUnitPrice = document.getElementById('dUnitPrice');
        if (dUnitPrice) dUnitPrice.textContent = formatIDR(dUnitPrice.textContent);
      }
  
  // Prototype only: Add button
      const btnAdd = document.getElementById('btnAdd');
      if (btnAdd){
        btnAdd.addEventListener('click', () => {
          alert('Prototype: Add Ingredients (modal would open here)');
        });
      }
  
      // Simple routing between List and Detail (single ingredient)
      const viewList = document.getElementById('viewList');
      const viewDetail = document.getElementById('viewDetail');
      const rowAnise = document.getElementById('rowAnise');
      const btnBack = document.getElementById('btnBack');
  
      function showList(){
        if (viewList) viewList.classList.add('active');
        if (viewDetail) viewDetail.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
        syncFromProtoBalance();
        applyIDRFormatting();
      applyIDRFormatting();
      }
  
      function showDetail(){
        if (viewList) viewList.classList.remove('active');
        if (viewDetail) viewDetail.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Ensure newest movement is always on top
        sortHistoryByDateDesc();
        applyIDRFormatting();
        syncFromHistoryTop();
        applyIDRFormatting();
      }
  
      
      
      function sortHistoryByDateDesc(){
        const tbody = document.querySelector('.history-table tbody');
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort((a,b) => {
          const da = (a.querySelector('td')?.textContent || '').trim();
          const db = (b.querySelector('td')?.textContent || '').trim();
          // Expect YYYY-MM-DD
          return db.localeCompare(da);
        });
        rows.forEach(r => tbody.appendChild(r));
      }
  
  
      function route(){
        const h = window.location.hash || '#/inventory/ingredients';
        // Detail view is expressed as a nested route so the main router recognizes it.
        if (h === '#/inventory/ingredients/anise-star') showDetail();
        else showList();
      }
  
      if (rowAnise){
        rowAnise.addEventListener('click', (e) => {
          const insideAction = e.target.closest('.mini-ico');
          if (insideAction) return;
          window.location.hash = '#/inventory/ingredients/anise-star';
        });
      }
  
      if (btnBack){
        btnBack.addEventListener('click', () => {
          window.location.hash = '#/inventory/ingredients';
        });
      }

      // NOTE: do not attach our own hashchange listener.
      // The app-level router re-renders on hash changes and calls init() again.
      route();
      // Ensure list stock matches the latest balance
      syncFromProtoBalance();
        applyIDRFormatting();
      applyIDRFormatting();
  
      // Manual adjustment modal (UI only)
      const btnAdjust = document.getElementById('btnAdjust');
      const adjustOverlay = document.getElementById('adjustOverlay');
      const btnAdjustClose = document.getElementById('btnAdjustClose');
      const btnAdjustCancel = document.getElementById('btnAdjustCancel');
      const btnAdjustSave = document.getElementById('btnAdjustSave');
      const adjType = document.getElementById('adjType');
      const adjReason = document.getElementById('adjReason');
      const adjQty = document.getElementById('adjQty');
      const adjDate = document.getElementById('adjDate');
      const adjNote = document.getElementById('adjNote');
      const toast = document.getElementById('toast');
  
      function todayISO(){
        const d = new Date();
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        return d.getFullYear() + '-' + mm + '-' + dd;
      }
  
      function openAdjust(){
        if (!adjustOverlay) return;
        adjQty.value = 0;
        if (adjDate) adjDate.value = todayISO();
        if (adjNote) adjNote.value = '';
        adjustOverlay.classList.add('open');
        adjustOverlay.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => { if (adjQty) adjQty.focus(); }, 50);
      }
  
      function closeAdjust(){
        if (!adjustOverlay) return;
        adjustOverlay.classList.remove('open');
        adjustOverlay.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
      }
  
      function showToast(msg){
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1800);
      }
  
      function addHistoryRow({date, type, reason, qty, unit, balance, note}){
        const table = document.querySelector('.history-table tbody');
        if (!table) return;
  
        const badge = type === 'IN'
          ? '<span class="badge-in">IN</span>'
          : '<span class="badge-out">OUT</span>';
  
        const qtyText = (type === 'IN' ? '+' : '-') + qty;
  
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="muted">${date}</td>
          <td>${badge}</td>
          <td class="muted">Manual adjustment</td>
          <td>${qtyText}</td>
          <td class="muted">${unit}</td>
          <td>${balance}</td>
          <td class="muted">${reason}${note ? ' · ' + note : ''}</td>
        `;
  
        // prepend
        table.insertBefore(tr, table.firstChild);
        // Keep newest on top even if dates vary
        sortHistoryByDateDesc();
        applyIDRFormatting();
        syncFromHistoryTop();
        applyIDRFormatting();
      }
  
      // For the prototype: we keep an internal "balance" number starting from the last shown balance (790)
      let protoBalance = 790;
  
      function syncFromProtoBalance(){
        // Detail page amount
        const dAmount = document.getElementById('dAmount');
        if (dAmount) dAmount.textContent = protoBalance + ' g';
  
        // List page stock cell (only for Anise in this prototype)
        const stockTd = document.getElementById('stockAnise');
        if (stockTd) stockTd.textContent = String(protoBalance);
      }
  
      function syncFromHistoryTop(){
        // Read the newest row's balance and sync (after sorting)
        const tbody = document.querySelector('.history-table tbody');
        if (!tbody) return;
        const firstRow = tbody.querySelector('tr');
        if (!firstRow) return;
        const tds = firstRow.querySelectorAll('td');
        if (tds.length < 6) return;
        const bal = parseInt((tds[5].textContent || '').trim(), 10);
        if (!isNaN(bal)){
          protoBalance = bal;
          syncFromProtoBalance();
        applyIDRFormatting();
      applyIDRFormatting();
        }
      }
  
  
      if (btnAdjust){
        btnAdjust.addEventListener('click', () => {
          // Only open when detail view is active
          if (window.location.hash === '#/ingredient/anise-star') openAdjust();
          else {
            // if user clicks from list, go to detail first
            window.location.hash = '#/ingredient/anise-star';
            setTimeout(openAdjust, 120);
          }
        });
      }
  
      [btnAdjustClose, btnAdjustCancel].forEach(btn => {
        if (btn) btn.addEventListener('click', closeAdjust);
      });
  
      if (adjustOverlay){
        adjustOverlay.addEventListener('click', (e) => {
          if (e.target === adjustOverlay) closeAdjust();
        });
      }
  
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && adjustOverlay && adjustOverlay.classList.contains('open')) closeAdjust();
      });
  
      if (btnAdjustSave){
        btnAdjustSave.addEventListener('click', () => {
          const type = adjType.value;
          const reason = adjReason.value;
          const qty = Math.max(0, parseInt(adjQty.value || '0', 10));
          const date = (adjDate && adjDate.value) ? adjDate.value : todayISO();
          const note = (adjNote && adjNote.value || '').trim();
          const unit = 'g';
  
          if (!qty){
            showToast('Please enter quantity');
            if (adjQty) adjQty.focus();
            return;
          }
  
          // Update proto balance
          protoBalance = type === 'IN' ? (protoBalance + qty) : Math.max(0, protoBalance - qty);
  
          // Sync amount across pages
          syncFromProtoBalance();
        applyIDRFormatting();
      applyIDRFormatting();
  
          // Add row
          addHistoryRow({date, type, reason, qty, unit, balance: protoBalance, note});
          sortHistoryByDateDesc();
        applyIDRFormatting();
        syncFromHistoryTop();
        applyIDRFormatting();
  
          // Show toast + close
          showToast('Adjustment recorded');
          closeAdjust();
        });
      }
  
    
  
      // Apply IDR formatting on first paint
      document.addEventListener('DOMContentLoaded', () => {
        applyIDRFormatting();
      });
}

window.Pages = window.Pages || {};
window.Pages.ingredients = { render, init };
