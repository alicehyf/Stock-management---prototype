(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){ console.log(m); });

  const PERM_GROUPS = [
    {
      title: 'Procurement actions (implemented)',
      perms: [
        ['create_po','Create PO'],
        ['create_receiving','Start receiving'],
        ['manage_reorder_points','Manage reorder points'],
      ]
    },
    {
      title: 'Approvals (implemented)',
      perms: [
        ['approve_pr','Approve PR step'],
        ['reject_pr','Reject PR step'],
        ['approve_po','Approve PO step'],
        ['reject_po','Reject PO step'],
      ]
    },
    {
      title: 'Overrides (implemented)',
      perms: [
        ['approve_all','Approve any step (override)'],
        ['reject_all','Reject any step (override)'],
        ['admin_all','Admin (all permissions)'],
      ]
    }
  ];

  function esc(s){
    return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function num(v){
    const n = Number(String(v||'').replace(/[^0-9.-]/g,''));
    return isFinite(n) ? n : 0;
  }

  function renderApprovalSteps(docType, store){
    const steps = (store.settings.approvalSteps||[]).filter(s=>String(s.docType||'')===docType);
    const roles = store.settings.roles||[];
    const rows = steps.map((st, idx)=>{
      const roleOptions = roles.map(r=>`<option value="${esc(r.id)}" ${String(r.id)===String(st.roleId)?'selected':''}>${esc(r.name||r.id)}</option>`).join('');
      return `
      <tr>
        <td class="mono" style="width:52px">${idx+1}</td>
        <td style="min-width:220px">
          <select data-step-role data-doc="${docType}" data-idx="${idx}" class="input">${roleOptions}</select>
        </td>
        <td style="min-width:220px">
          <input data-step-min data-doc="${docType}" data-idx="${idx}" class="input" type="number" min="0" step="1000" value="${esc(st.minTotal)}" placeholder="0" />
          <div class="mini-muted" style="margin-top:6px;">Step required when <span class="mono">total ≥ min</span>.</div>
        </td>
        <td style="width:120px;text-align:right">
          <button class="btn sm" data-step-remove data-doc="${docType}" data-idx="${idx}">Remove</button>
        </td>
      </tr>`;
    }).join('');

    return `
      <div class="card panel" style="margin-top:12px;">
        <div class="panel-head">
          <div>
            <div class="panel-title">${docType} approval steps</div>
            <div class="panel-sub">Configure who must approve based on total amount.</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
            <button class="btn" data-step-add data-doc="${docType}">Add step</button>
          </div>
        </div>
        <div class="divider"></div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width:52px">#</th>
                <th>Role</th>
                <th>Min total (IDR)</th>
                <th style="width:120px"></th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="4" class="muted" style="padding:14px">No steps configured</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="btn-row" style="margin-top:12px;">
          <button class="primary-btn" data-steps-save data-doc="${docType}" style="box-shadow:none;">Save ${docType} steps</button>
        </div>
      </div>`;
  }

  function renderRoleEditor(role, store){
    const perms = (role && role.permissions) ? role.permissions : {};

    const sections = PERM_GROUPS.map(g=>{
      const items = g.perms.map(([k,label])=>{
        const checked = perms[k] ? 'checked' : '';
        return `
          <label class="chip" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" data-perm="${esc(k)}" ${checked} />
            <span>${esc(label)}</span>
          </label>`;
      }).join('');
      return `
        <div style="margin-top:12px;">
          <div style="font-weight:900;margin-bottom:8px;">${esc(g.title)}</div>
          <div class="chips" style="gap:10px;align-items:flex-start;">${items}</div>
        </div>`;
    }).join('');

    return `
      <div class="card panel" style="margin-top:12px;">
        <div class="panel-head">
          <div>
            <div class="panel-title">Role details</div>
            <div class="panel-sub">Edit permissions for the selected role.</div>
          </div>
          <div class="pill"><span class="dot"></span> ${esc(role.name||role.id)}</div>
        </div>
        <div class="divider"></div>
        <div class="form-grid" style="margin-top:0">
          <div class="field">
            <label>Role name</label>
            <input id="roleName" class="input" value="${esc(role.name||'')}" placeholder="e.g., Outlet manager" />
          </div>
          <div class="field">
            <label>Role id (stable key)</label>
            <input id="roleId" class="input" value="${esc(role.id||'')}" disabled />
          </div>
          <div class="field" style="grid-column:1/-1;">
            <label>Tag (optional)</label>
            <input id="roleTag" class="input" value="${esc(role.tag||'')}" placeholder="e.g., ops / finance" />
          </div>
        </div>

        <div class="divider"></div>
        <div class="hint">Tip: If you enable <b>Approve any step (override)</b> you can approve steps assigned to other roles (useful for demoing).</div>

        ${sections}

        <div class="btn-row" style="margin-top:14px;">
          <button class="btn" id="btnDeleteRole">Delete role</button>
          <button class="primary-btn" id="btnSaveRole" style="box-shadow:none;">Save role permissions</button>
        </div>
      </div>`;
  }

  function render(){
    const store = PD.getStore ? PD.getStore() : { settings:{ roles:[], approvalSteps:[] }, user:{ roleId:'staff' } };
    const roles = (store.settings.roles||[]);
    const currentRoleId = (PD.getRole ? PD.getRole() : (store.user.roleId||'staff'));
    const currentRole = roles.find(r=>String(r.id)===String(currentRoleId)) || roles[0] || {id:'staff', name:'Staff', permissions:{}};
    const selectedEditRoleId = window.__settings_edit_role_id || currentRole.id;
    const editRole = roles.find(r=>String(r.id)===String(selectedEditRoleId)) || currentRole;

    const roleOptions = roles.map(r=>`<option value="${esc(r.id)}" ${String(r.id)===String(currentRoleId)?'selected':''}>${esc(r.name||r.id)}</option>`).join('');
    const editRoleOptions = roles.map(r=>`<option value="${esc(r.id)}" ${String(r.id)===String(editRole.id)?'selected':''}>${esc(r.name||r.id)}</option>`).join('');

    const approvalsEnabled = (store.settings||{}).approvalsEnabled !== false;

    return /*html*/`
<div class="breadcrumb"><span>Settings</span><span class="crumb-dot">›</span><span>Workflow & permissions</span></div>

<div class="page-head">
  <div>
    <h1 class="page-title">Workflow & permissions</h1>
    <p class="page-desc">Configure approval thresholds and role permissions for the prototype.</p>
  </div>
</div>

<div class="split" style="margin-top:8px;">
  <div class="card panel col-8">
    <div class="panel-head">
      <div>
        <div class="panel-title">Role preview (current login)</div>
        <div class="panel-sub">Switch roles to test permissions in the prototype.</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
        <select id="currentRoleSelect" class="input" style="min-width:220px;">${roleOptions}</select>
        <button class="primary-btn" id="btnApplyCurrentRole" style="box-shadow:none;">Apply</button>
      </div>
    </div>

    <div class="divider"></div>

    <div class="kv">
      <div class="cell full" style="grid-column:span 2;">
        <div class="k">Current role</div>
        <div class="v">${esc(currentRole.name||currentRole.id)} <span class="mini-muted">(${esc(currentRole.id)})</span></div>
      </div>
      <div class="cell">
        <div class="k">Create PO directly</div>
        <div class="v">${(PD.can && PD.can('create_po')) ? 'Allowed' : 'Blocked'}</div>
      </div>
      <div class="cell">
        <div class="k">Approve PR / PO</div>
        <div class="v">${(PD.can && (PD.can('approve_pr') || PD.can('approve_po') || PD.can('approve_all'))) ? 'Allowed' : 'Blocked'}</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="field" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
        <input id="approvalsEnabled" type="checkbox" ${approvalsEnabled ? 'checked':''} />
        <span style="font-weight:900;">Enable approvals workflow</span>
      </label>
      <div class="mini-muted">If disabled, PR/PO will auto-approve when submitted.</div>
      <button class="btn" id="btnSaveApprovalsEnabled">Save</button>
    </div>

    ${renderApprovalSteps('PR', store)}
    ${renderApprovalSteps('PO', store)}

  </div>

  <div class="card panel col-4">
    <div class="panel-head">
      <div>
        <div class="panel-title">Roles & permissions</div>
        <div class="panel-sub">Add roles, adjust power scope, and test approvals.</div>
      </div>
    </div>
    <div class="divider"></div>

    <div class="field">
      <label>Edit role</label>
      <select id="editRoleSelect" class="input">${editRoleOptions}</select>
    </div>

    <div class="field" style="margin-top:10px;">
      <label>Create new role</label>
      <div style="display:flex;gap:10px;align-items:center;">
        <input id="newRoleName" class="input" placeholder="New role name" />
        <button class="btn" id="btnAddRole">Add</button>
      </div>
      <div class="mini-muted" style="margin-top:6px;">A stable role id will be generated automatically.</div>
    </div>

    ${renderRoleEditor(editRole, store)}
  </div>
</div>
    `;
  }

  function init(){
    const store = PD.getStore();

    // Current role
    document.getElementById('btnApplyCurrentRole')?.addEventListener('click', ()=>{
      const rid = document.getElementById('currentRoleSelect')?.value || 'staff';
      PD.setRole && PD.setRole(rid);
      toast('Role applied: ' + (PD.getRoleName ? PD.getRoleName(rid) : rid));
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });

    // Approvals enabled
    document.getElementById('btnSaveApprovalsEnabled')?.addEventListener('click', ()=>{
      const enabled = !!document.getElementById('approvalsEnabled')?.checked;
      const s = PD.getStore();
      s.settings = s.settings || {};
      s.settings.approvalsEnabled = enabled;
      PD.saveStore(s);
      toast(enabled ? 'Approvals enabled' : 'Approvals disabled');
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });

    // Add/remove steps
    document.querySelectorAll('[data-step-add]')?.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const doc = btn.getAttribute('data-doc');
        const s = PD.getStore();
        s.settings.approvalSteps = s.settings.approvalSteps || [];
        const defaultRole = (s.settings.roles||[]).find(r=>r.id==='outlet_manager') || (s.settings.roles||[]).find(r=>r.id!=='staff') || (s.settings.roles||[])[0];
        s.settings.approvalSteps.push({ id: doc.toLowerCase()+'_'+Date.now(), docType: doc, roleId: defaultRole?defaultRole.id:'staff', minTotal: 0 });
        PD.saveStore(s);
        toast('Step added');
        setTimeout(()=>window.RouterApp?.render?.(), 10);
      });
    });

    document.querySelectorAll('[data-step-remove]')?.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const doc = btn.getAttribute('data-doc');
        const idx = num(btn.getAttribute('data-idx'));
        const s = PD.getStore();
        const steps = (s.settings.approvalSteps||[]).filter(x=>String(x.docType)===String(doc));
        if (idx<0 || idx>=steps.length) return;
        const targetId = steps[idx].id;
        s.settings.approvalSteps = (s.settings.approvalSteps||[]).filter(x=>x.id!==targetId);
        PD.saveStore(s);
        toast('Step removed');
        setTimeout(()=>window.RouterApp?.render?.(), 10);
      });
    });

    // Save steps (reads inputs)
    document.querySelectorAll('[data-steps-save]')?.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const doc = btn.getAttribute('data-doc');
        const s = PD.getStore();
        const all = s.settings.approvalSteps||[];
        const docSteps = all.filter(x=>String(x.docType)===String(doc));
        docSteps.forEach((st,i)=>{
          const roleSel = document.querySelector(`[data-step-role][data-doc="${doc}"][data-idx="${i}"]`);
          const minInp = document.querySelector(`[data-step-min][data-doc="${doc}"][data-idx="${i}"]`);
          if (roleSel) st.roleId = roleSel.value;
          if (minInp) st.minTotal = Math.max(0, num(minInp.value));
        });
        // Replace while preserving other doc steps
        const others = all.filter(x=>String(x.docType)!==String(doc));
        s.settings.approvalSteps = [...others, ...docSteps];
        PD.saveStore(s);
        toast('Saved ' + doc + ' approval steps');
        setTimeout(()=>window.RouterApp?.render?.(), 10);
      });
    });

    // Role editor select
    document.getElementById('editRoleSelect')?.addEventListener('change', (e)=>{
      window.__settings_edit_role_id = e.target.value;
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });

    // Add role
    document.getElementById('btnAddRole')?.addEventListener('click', ()=>{
      const name = (document.getElementById('newRoleName')?.value || '').trim();
      if (!name){ toast('Enter a role name'); return; }
      const s = PD.getStore();
      s.settings.roles = s.settings.roles || [];
      const idBase = name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
      let id = idBase || ('role_'+Date.now());
      let k = 1;
      while ((s.settings.roles||[]).some(r=>String(r.id)===String(id))){ id = idBase + '_' + (k++); }
      const role = { id, name, tag:'', permissions:{} };
      s.settings.roles.push(role);
      PD.saveStore(s);
      window.__settings_edit_role_id = id;
      toast('Role added');
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });

    // Save role
    document.getElementById('btnSaveRole')?.addEventListener('click', ()=>{
      const s = PD.getStore();
      const rid = document.getElementById('roleId')?.value;
      const role = (s.settings.roles||[]).find(r=>String(r.id)===String(rid));
      if (!role){ toast('Role not found'); return; }
      role.name = (document.getElementById('roleName')?.value || '').trim() || role.name;
      role.tag = (document.getElementById('roleTag')?.value || '').trim();
      role.permissions = role.permissions || {};
      document.querySelectorAll('[data-perm]')?.forEach(cb=>{
        const key = cb.getAttribute('data-perm');
        role.permissions[key] = !!cb.checked;
      });
      PD.saveStore(s);
      toast('Role saved');
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });

    // Delete role
    document.getElementById('btnDeleteRole')?.addEventListener('click', ()=>{
      const rid = document.getElementById('roleId')?.value;
      if (!rid) return;
      if (rid==='staff' || rid==='owner'){ toast('Cannot delete staff/owner'); return; }
      const ok = window.confirm ? window.confirm('Delete this role? Existing approvals will keep their role label but this role will no longer be selectable.') : true;
      if (!ok) return;
      const s = PD.getStore();
      s.settings.roles = (s.settings.roles||[]).filter(r=>String(r.id)!==String(rid));
      // If current role removed, fallback to staff
      if (PD.getRole && PD.getRole()===rid){ PD.setRole('staff'); }
      PD.saveStore(s);
      window.__settings_edit_role_id = 'staff';
      toast('Role deleted');
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });
  }

  window.Pages = window.Pages || {};
  window.Pages.settings = { render, init };
})();
