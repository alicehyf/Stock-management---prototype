
(function(){
  function render(params){
    const sid = params?.id;
    const sup = Store.findSupplier(sid);
    if(!sup) return `<div class="card"><div class="card-b"><div style="font-weight:850">Supplier not found</div></div></div>`;
    const rows = Store.supplierItemRows(sid);
    return `
      <div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px;flex-wrap:wrap">
          <div>
            <div class="h1">${escapeHtml(sup.name)} · items & pricing</div>
            <div class="muted">This catalog controls ordering options and default prices.</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn" href="#/procurement/suppliers">Back</a>
            <button class="btn primary" id="btnCreatePR">Create PR</button>
            <button class="btn" id="btnCreatePO">Create PO</button>
            <button class="btn" id="btnAddCatalog">Add item to catalog</button>
          </div>
        </div>

        <div class="card">
          <div class="card-h">
            <div class="search" style="max-width:420px">
              ${searchIcon()}
              <input id="catSearch" placeholder="Search item..." />
            </div>
            <div class="small-note">${rows.length} items</div>
          </div>
          <div class="card-b">
            <div class="table-wrap">
              <table>
                <thead><tr>
                  <th style="width:42%">Item</th>
                  <th style="width:14%">UOM</th>
                  <th style="width:18%">Price</th>
                  <th style="width:14%">Status</th>
                  <th style="width:12%">Actions</th>
                </tr></thead>
                <tbody id="catTbody">
                  ${rows.map(catRow).join('') || `<tr><td colspan="5" class="muted">No catalog items yet.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
  }

  function catRow(r){
    return `<tr>
      <td>${escapeHtml(r.item.name)}<div class="subtxt mono">${escapeHtml(r.item.sku)}</div></td>
      <td class="muted">${escapeHtml(r.item.uom||'')}</td>
      <td>$${(+r.price).toFixed(2)}</td>
      <td>${tag(r.status||'Active')}</td>
      <td><button class="btn small" data-edit="${r.itemId}">Edit</button></td>
    </tr>`;
  }

  function init(params){
    const sid = params?.id;
    const allRows = Store.supplierItemRows(sid);

    function bindEdits(){
      UI.qsa('[data-edit]').forEach(b=>b.addEventListener('click', ()=>{
        const itemId = b.getAttribute('data-edit');
        openEditPriceModal(sid, itemId);
      }));
    }
    bindEdits();

    UI.qs('#catSearch')?.addEventListener('input', (e)=>{
      const q = (e.target.value||'').toLowerCase();
      const rows = allRows.filter(r=>r.item.name.toLowerCase().includes(q) || (r.item.sku||'').toLowerCase().includes(q));
      UI.qs('#catTbody').innerHTML = rows.map(catRow).join('') || `<tr><td colspan="5" class="muted">No match</td></tr>`;
      bindEdits();
    });

    UI.qs('#btnCreatePR')?.addEventListener('click', ()=>{
      const pr = Store.createPR({title:`Order from ${Store.findSupplier(sid)?.name||'supplier'}`, requestedBy:Store.getRole()});
      sessionStorage.setItem('prefSupplierForPR', sid);
      window.location.hash = `#/procurement/pr/${encodeURIComponent(pr.id)}`;
      setTimeout(()=>UI.qs('#btnAddLine')?.click(), 0);
    });

    UI.qs('#btnCreatePO')?.addEventListener('click', ()=>{
      if(Store.getRole()!=='Owner'){
        UI.toast('Please create a PR. PO creation is restricted for Staff.', 'No permission');
        return;
      }
      const po = Store.createPO({supplierId:sid, deliveryTo:'Main kitchen', expectedDate:''});
      window.location.hash = `#/procurement/po/${encodeURIComponent(po.id)}`;
    });

    UI.qs('#btnAddCatalog')?.addEventListener('click', ()=> openAddToCatalog(sid));
  }

  function openEditPriceModal(sid, itemId){
    const rows = Store.load().supplierItems;
    const row = rows.find(r=>r.supplierId===sid && r.itemId===itemId);
    const it = Store.findItem(itemId);
    const body = `
      <div class="field"><label>Item</label><input value="${escapeHtml(it?.name||'')}" disabled/></div>
      <div class="form-grid">
        <div class="field"><label>Price</label><input id="pPrice" type="number" min="0" step="0.01" value="${row?row.price:0}"/></div>
        <div class="field"><label>Status</label><select id="pStatus"><option ${row?.status!=='Inactive'?'selected':''}>Active</option><option ${row?.status==='Inactive'?'selected':''}>Inactive</option></select></div>
      </div>`;
    const footer = `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn primary" id="pSave">Save</button>`;
    UI.openModal({title:'Edit catalog item', body, footer, onOpen:()=>{
      UI.qs('#pSave')?.addEventListener('click', ()=>{
        Store.withState(s=>{
          const r = s.supplierItems.find(x=>x.supplierId===sid && x.itemId===itemId);
          if(r){
            r.price = parseFloat(UI.qs('#pPrice').value||'0');
            r.status = UI.qs('#pStatus').value;
          }
        });
        UI.closeModal();
        window.RouterApp?.render();
      });
    }});
  }

  function openAddToCatalog(sid){
    const items = Store.getItems();
    const existing = new Set(Store.supplierItemRows(sid).map(r=>r.itemId));
    const choices = items.filter(i=>!existing.has(i.id));
    const body = `
      <div class="form-grid">
        <div class="field" style="grid-column:1/-1"><label>Item</label>
          <select id="cItem">
            ${choices.map(i=>`<option value="${i.id}">${escapeHtml(i.name)} · ${escapeHtml(i.sku)}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Price</label><input id="cPrice" type="number" min="0" step="0.01" value="0"/></div>
        <div class="field"><label>Status</label><select id="cStatus"><option>Active</option><option>Inactive</option></select></div>
      </div>`;
    const footer = `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn primary" id="cAdd">Add</button>`;
    UI.openModal({title:'Add item to catalog', body, footer, onOpen:()=>{
      UI.qs('#cAdd')?.addEventListener('click', ()=>{
        Store.withState(s=>{
          s.supplierItems.unshift({supplierId:sid, itemId:UI.qs('#cItem').value, price:parseFloat(UI.qs('#cPrice').value||'0'), currency:'USD', status:UI.qs('#cStatus').value});
        });
        UI.closeModal();
        window.RouterApp?.render();
      });
    }});
  }

  function tag(s){
    const cls = s==='Inactive'?'warn':'good';
    return `<span class="tag ${cls}">${escapeHtml(s)}</span>`;
  }
  function searchIcon(){return `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>`;}
  function escapeHtml(str){ return (str||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  window.Pages = window.Pages || {};
  window.Pages.supplierItems = {render, init};
})();
