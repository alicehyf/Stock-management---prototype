(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){ console.log(m); });

    function render(){
    const role = (PD.getRole ? PD.getRole() : 'staff');
    const readOnly = (PD.can ? !PD.can('manage_reorder_points') : (role !== 'owner'));
    const roBadge = readOnly ? `<span class="tag neutral" style="margin-left:8px;">View only</span>` : `<span class="tag ok" style="margin-left:8px;">Editable</span>`;

    return /*html*/`
<div class="breadcrumb"><span>Stock management</span><span class="crumb-dot">›</span><span>Reorder points</span></div>

<div class="page-head">
  <div>
    <h1 class="page-title">Reorder points ${roBadge}</h1>
    <p class="page-desc">
      Reorder point is the minimum on-hand quantity before the system starts recommending replenishment.
      Adjust values per ingredient to match your operations and delivery lead times.
    </p>
  </div>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
    <button class="primary-btn" id="btnSaveRP" ${readOnly ? 'disabled' : ''} style="box-shadow:none;">Save</button>
  </div>
</div>

<div class="card" style="padding:14px;">
  <div class="filters" style="margin:0 0 12px 0;">
    <div class="search-inline" style="max-width:420px;">
      <input id="rpSearch" type="text" placeholder="Search by name or SKU" />
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="M20 20l-3.5-3.5" stroke-linecap="round"></path>
      </svg>
    </div>
    <div class="hint" style="margin:0;">
      Tips: Set higher reorder points for high-turn items (milk, eggs) and items with longer delivery lead time.
    </div>
  </div>

  <div class="table-wrap" style="border:none;">
    <table>
      <thead>
        <tr>
          <th style="min-width:260px;">Ingredient</th>
          <th>SKU</th>
          <th>Unit</th>
          <th style="min-width:220px;">Reorder point</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody id="rpBody"></tbody>
    </table>
  </div>
</div>

<div class="hint" style="margin-top:12px;">
  Changes are saved to this browser (local storage). In the future, these values can be synced per outlet and shared across your team.
</div>
    `;
  }

  function init(){
    const store = PD.getStore ? PD.getStore() : {};
    const role = (PD.getRole ? PD.getRole() : 'staff');
    const readOnly = (PD.can ? !PD.can('manage_reorder_points') : (role !== 'owner'));

    // Ensure data structure exists
    store.settings = store.settings || {};
    store.settings.reorderPoints = store.settings.reorderPoints || {};

    const items = (store.items || []).filter(it => it && it.sku && it.active !== false);
    const tbody = document.getElementById('rpBody');
    const search = document.getElementById('rpSearch');
    const btnSave = document.getElementById('btnSaveRP');

    const qs = new URLSearchParams((window.location.hash.split('?')[1]||''));
    const presetSku = (qs.get('sku')||'').trim();

    function defaultRPs(){
      return {
        '1001': 500,
        '1002': 1000,
        '1005': 300,
        '1008': 24,
        '1012': 2000,
        '1016': 50,
        '2001': 1500,
        '3001': 5000
      };
    }

    function getRP(sku){
      const v = store.settings.reorderPoints[String(sku)]
      if (v == null || v === '') return defaultRPs()[String(sku)] ?? 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }

    function renderRows(){
      if (!tbody) return;
      const q = String(search?.value||'').trim().toLowerCase();
      tbody.innerHTML = '';

      items.forEach(it => {
        const sku = String(it.sku||'').trim();
        const name = String(it.name||'—');
        if (q){
          if (!(name.toLowerCase().includes(q) || sku.includes(q))) return;
        }
        const rp = getRP(sku);
        const unit = it.uom || '—';
        const disabledAttr = readOnly ? 'disabled' : '';

        const tr = document.createElement('tr');
        tr.dataset.sku = sku;
        tr.innerHTML = `
          <td style="font-weight:800;">${name}</td>
          <td class="muted">${sku}</td>
          <td class="muted">${unit}</td>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <input class="rp-input" type="number" min="0" step="1" value="${rp}" ${disabledAttr}
                style="width:140px;height:36px;border-radius:12px;border:1px solid var(--line);padding:0 10px;" />
              <span class="muted">${unit}</span>
            </div>
          </td>
          <td class="muted">Used for low stock status and reorder recommendations.</td>
        `;
        tbody.appendChild(tr);
      });

      if (tbody.children.length === 0){
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" class="muted" style="padding:16px;">No matches.</td>`;
        tbody.appendChild(tr);
      }
    }

    function collectValues(){
      const map = {};
      document.querySelectorAll('#rpBody tr[data-sku]').forEach(tr => {
        const sku = String(tr.dataset.sku||'').trim();
        const input = tr.querySelector('input.rp-input');
        const v = input ? Number(input.value||0) : 0;
        map[sku] = Math.max(0, Math.round(v));
      });
      return map;
    }

    function save(){
      if (readOnly){ toast('Only Owner can edit reorder points'); return; }
      const values = collectValues();
      store.settings.reorderPoints = Object.assign({}, store.settings.reorderPoints, values);
      PD.saveStore && PD.saveStore(store);
      toast('Reorder points saved');
    }


    // Deep link: prefill search with SKU
    if (presetSku && search){ search.value = presetSku; }
    renderRows();
    // If preset SKU, scroll to first match
    if (presetSku){ setTimeout(()=>{ const tr = document.querySelector(`#rpBody tr[data-sku="${presetSku}"]`); tr?.scrollIntoView?.({block:"center"}); }, 0); }
    search?.addEventListener('input', renderRows);
    btnSave?.addEventListener('click', save);
  }

  window.Pages = window.Pages || {};
  window.Pages.reorderpoints = { render, init };
})();
