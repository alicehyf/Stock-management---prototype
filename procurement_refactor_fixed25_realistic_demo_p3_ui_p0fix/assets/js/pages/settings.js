(function(){
  const PD = window.ProcurementDemo || {};
  const toast = (window.UI && window.UI.toast) ? window.UI.toast : (PD.toast || function(m){ console.log(m); });

  function render(){
    const role = (PD.getRole ? PD.getRole() : 'staff');
    const staffChecked = role !== 'owner' ? 'checked' : '';
    const ownerChecked = role === 'owner' ? 'checked' : '';

    return /*html*/`
<div class="breadcrumb"><span>Settings</span><span class="crumb-dot">›</span><span>Permissions</span></div>

<div class="page-head">
  <div>
    <h1 class="page-title">Permissions</h1>
    <p class="page-desc">Preview role-based access. Default is a staff role with limited permissions.</p>
  </div>
</div>

<div class="split" style="margin-top:8px;">
  <div class="card panel col-8">
    <div class="panel-head">
      <div>
        <div class="panel-title">Role</div>
        <div class="panel-sub">Controls what actions are allowed across PR, PO and Receiving.</div>
      </div>
      <div class="pill" id="rolePill"><span class="dot"></span> ${role === 'owner' ? 'Owner' : 'Staff'}</div>
    </div>

    <div class="divider"></div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
      <label class="card" style="padding:14px;cursor:pointer;border:1px solid var(--border);border-radius:16px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <input type="radio" name="role" value="staff" ${staffChecked} style="margin-top:4px;" />
          <div>
            <div style="font-weight:950;">Staff (default)</div>
            <div class="mini-muted" style="margin-top:6px;">
              Can create PR and track status. Cannot approve/reject PR or create PO directly.
            </div>
            <div class="tag neutral" style="margin-top:10px;display:inline-flex;">Recommended for daily ops</div>
          </div>
        </div>
      </label>

      <label class="card" style="padding:14px;cursor:pointer;border:1px solid var(--border);border-radius:16px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <input type="radio" name="role" value="owner" ${ownerChecked} style="margin-top:4px;" />
          <div>
            <div style="font-weight:950;">Owner (boss)</div>
            <div class="mini-muted" style="margin-top:6px;">
              Full access: approve/reject PR, convert PR to PO, and create PO directly.
            </div>
            <div class="tag ok" style="margin-top:10px;display:inline-flex;">Full permissions</div>
          </div>
        </div>
      </label>
    </div>

    <div class="btn-row" style="margin-top:14px;">
      <button class="ghost-btn" id="btnResetRole">Reset to staff</button>
      <button class="primary-btn" id="btnSaveRole" style="box-shadow:none;">Save</button>
    </div>
  </div>

  <div class="card panel col-4">
    <div class="panel-title">What changes with role</div>
    <div class="panel-sub">These are the key guardrails enabled by permissions.</div>

    <div class="divider"></div>

    <div class="kv">
      <div class="cell full" style="grid-column:span 2;">
        <div class="k">Create PO directly</div>
        <div class="v">Staff: blocked → guided to create PR</div>
      </div>
      <div class="cell full" style="grid-column:span 2;">
        <div class="k">Approve / Reject PR</div>
        <div class="v">Staff: blocked → shows “please wait for approval”</div>
      </div>
      <div class="cell full" style="grid-column:span 2;">
        <div class="k">Convert PR to PO</div>
        <div class="v">Owner only</div>
      </div>
    </div>

    <div class="hint" style="margin-top:12px;">
      Role assignments are managed by administrators. Use this view to understand which actions are available per role.
    </div>
  </div>
</div>
    `;
  }

  function init(){
    const PD = window.ProcurementDemo || {};

    const btnSave = document.getElementById('btnSaveRole');
    const btnReset = document.getElementById('btnResetRole');

    function selectedRole(){
      const sel = document.querySelector('input[name="role"]:checked');
      return sel ? sel.value : 'staff';
    }

    btnSave?.addEventListener('click', ()=>{
      if (!PD.setRole){ toast('Role system not available'); return; }
      const role = selectedRole();
      PD.setRole(role);
      toast(role === 'owner' ? 'Switched to Owner permissions' : 'Switched to Staff permissions');
      // Re-render current view + refresh sidebar active state
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });

    btnReset?.addEventListener('click', ()=>{
      document.querySelector('input[name="role"][value="staff"]')?.click();
      if (PD.setRole){ PD.setRole('staff'); }
      toast('Reset to Staff');
      setTimeout(()=>window.RouterApp?.render?.(), 10);
    });
  }

  window.Pages = window.Pages || {};
  window.Pages.settings = { render, init };
})();
