/* =========================================================
   YmoKart Business Manager — app.js
   Shared application logic used across all pages:
   - Bottom navigation active state
   - Theme (dark/light) handling
   - Toast notifications
   - Modal (confirm) helper
   - Dashboard stats & rendering (index.html only)
   - Backup / Restore / Clear Database (settings.html)
   ========================================================= */

/* ---------- Theme ---------- */
function applyTheme(){
  const settings = DB.getSettings();
  if(settings.theme === 'light'){
    document.body.classList.add('theme-light');
  }else{
    document.body.classList.remove('theme-light');
  }
}

function toggleTheme(){
  const settings = DB.getSettings();
  const next = settings.theme === 'light' ? 'dark' : 'light';
  DB.saveSettings({ theme: next });
  applyTheme();
  return next;
}

/* ---------- Bottom Navigation active state ---------- */
function highlightActiveNav(){
  const current = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-item').forEach(item => {
    const page = item.getAttribute('data-page');
    if(page === current){
      item.classList.add('active');
    }else{
      item.classList.remove('active');
    }
  });
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(message, type = 'success'){
  let toast = document.getElementById('globalToast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path id="toastIconPath" d="M8 12l3 3 5-6"></path>
      </svg>
      <span id="toastMsg"></span>`;
    document.body.appendChild(toast);
  }
  const iconPath = toast.querySelector('#toastIconPath');
  if(type === 'error'){
    iconPath.setAttribute('d','M15 9l-6 6M9 9l6 6');
  }else{
    iconPath.setAttribute('d','M8 12l3 3 5-6');
  }
  toast.className = 'toast show ' + type;
  toast.querySelector('#toastMsg').textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

/* ---------- Confirm Modal ---------- */
function showConfirmModal({ title, message, confirmText = 'Confirm', danger = true, onConfirm }){
  let overlay = document.getElementById('confirmOverlay');
  if(overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'confirmOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn btn-outline" id="modalCancelBtn">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modalConfirmBtn">${confirmText}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  const close = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 250);
  };
  overlay.querySelector('#modalCancelBtn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
  overlay.querySelector('#modalConfirmBtn').addEventListener('click', () => {
    close();
    if(typeof onConfirm === 'function') onConfirm();
  });
}

/* ---------- Currency formatting ---------- */
function formatINR(num){
  const n = Number(num) || 0;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/* ---------- Dashboard rendering (index.html) ---------- */
function renderDashboard(){
  const totalProductsEl = document.getElementById('statTotalProducts');
  if(!totalProductsEl) return; // not on dashboard

  const products = DB.getProducts();
  const stats = DB.getStats();

  document.getElementById('statTotalProducts').textContent = products.length;
  document.getElementById('statPosters').textContent = stats.postersGenerated || 0;
  document.getElementById('statCatalog').textContent = stats.catalogsGenerated || 0;

  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalMrpValue = products.reduce((sum, p) => sum + ((Number(p.mrp) || 0) * (Number(p.stock) || 0)), 0);
  const reportsEl = document.getElementById('statReportsValue');
  if(reportsEl) reportsEl.textContent = formatINR(totalMrpValue);

  const recentWrap = document.getElementById('recentProductsList');
  if(recentWrap){
    const recent = products.slice(0, 3);
    if(recent.length === 0){
      recentWrap.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <p>Abhi tak koi product add nahi hua.<br>Neeche se apna pehla product add karein.</p>
        </div>`;
    }else{
      recentWrap.innerHTML = recent.map(productCardHTML).join('');
    }
  }
}

/* Shared product card renderer (used by dashboard + products page) */
function productCardHTML(p){
  const stockNum = Number(p.stock) || 0;
  let stockClass = 'in', stockLabel = 'In Stock';
  if(stockNum === 0){ stockClass = 'out'; stockLabel = 'Out of Stock'; }
  else if(stockNum <= 5){ stockClass = 'low'; stockLabel = 'Low Stock'; }

  const img = p.image
    ? `<img src="${p.image}" alt="${escapeHTML(p.name)}">`
    : `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`;

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-thumb">${img}</div>
      <div class="product-info">
        <h3>${escapeHTML(p.name || 'Unnamed Product')}</h3>
        <div class="meta">ART: ${escapeHTML(p.art || '-')} &nbsp;•&nbsp; ${escapeHTML(p.brand || '-')}</div>
        <div class="tags">
          ${p.category ? `<span class="tag">${escapeHTML(p.category)}</span>` : ''}
          ${p.color ? `<span class="tag">${escapeHTML(p.color)}</span>` : ''}
          ${p.size ? `<span class="tag">Size ${escapeHTML(p.size)}</span>` : ''}
        </div>
        <div class="price-row">
          <span class="mrp">${formatINR(p.mrp)}</span>
          <span class="dealer">${formatINR(p.dealerPrice)}</span>
          <span class="stock-badge ${stockClass}">${stockLabel}</span>
        </div>
      </div>
    </div>`;
}

function escapeHTML(str){
  if(str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ---------- Backup / Restore / Clear (settings.html) ---------- */
function backupDatabase(){
  const data = DB.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `ymokart-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Backup file download ho gayi ✔');
}

function restoreDatabase(file){
  const reader = new FileReader();
  reader.onload = (e) => {
    try{
      const data = JSON.parse(e.target.result);
      DB.importAll(data);
      showToast('Data restore ho gaya ✔');
      setTimeout(() => window.location.reload(), 900);
    }catch(err){
      showToast('Invalid backup file', 'error');
    }
  };
  reader.onerror = () => showToast('File read nahi ho payi', 'error');
  reader.readAsText(file);
}

function clearDatabase(){
  showConfirmModal({
    title: 'Database Clear Karein?',
    message: 'Yeh action sabhi products aur generated stats hamesha ke liye delete kar dega. Yeh undo nahi ho sakta.',
    confirmText: 'Haan, Clear Karein',
    danger: true,
    onConfirm: () => {
      DB.clearAll();
      showToast('Database clear ho gaya ✔');
      setTimeout(() => window.location.reload(), 800);
    }
  });
}

/* ---------- Init on every page load ---------- */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  highlightActiveNav();
  renderDashboard();
});
