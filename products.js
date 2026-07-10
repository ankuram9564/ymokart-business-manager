/* =========================================================
   YmoKart Business Manager — products.js
   Product Manager: Add / Edit / Delete / Search / Render
   ========================================================= */

let currentEditId = null;
let currentImageData = null;
let allProducts = [];

const listView = document.getElementById('listView');
const formView = document.getElementById('formView');
const productListEl = document.getElementById('productList');
const searchInput = document.getElementById('searchInput');
const productForm = document.getElementById('productForm');
const pageTitle = document.getElementById('pageTitle');
const fabAdd = document.getElementById('fabAdd');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const imageUploadBox = document.getElementById('imageUploadBox');
const imageInput = document.getElementById('imageInput');
const imagePreviewBox = document.getElementById('imagePreviewBox');
const imagePreview = document.getElementById('imagePreview');

/* ---------- View switching ---------- */
function showListView(){
  listView.classList.remove('hidden');
  formView.classList.add('hidden');
  fabAdd.classList.remove('hidden');
  pageTitle.textContent = 'Products';
  renderProductList();
}

function showFormView(editId = null){
  currentEditId = editId;
  currentImageData = null;
  listView.classList.add('hidden');
  formView.classList.remove('hidden');
  fabAdd.classList.add('hidden');
  productForm.reset();
  imagePreviewBox.classList.add('hidden');
  imagePreview.src = '';

  if(editId){
    pageTitle.textContent = 'Edit Product';
    const p = DB.getProductById(editId);
    if(p){
      document.getElementById('productId').value = p.id;
      document.getElementById('artNumber').value = p.art || '';
      document.getElementById('brand').value = p.brand || '';
      document.getElementById('productName').value = p.name || '';
      document.getElementById('category').value = p.category || '';
      document.getElementById('color').value = p.color || '';
      document.getElementById('size').value = p.size || '';
      document.getElementById('stock').value = p.stock ?? '';
      document.getElementById('mrp').value = p.mrp ?? '';
      document.getElementById('dealerPrice').value = p.dealerPrice ?? '';
      document.getElementById('description').value = p.description || '';
      if(p.image){
        currentImageData = p.image;
        imagePreview.src = p.image;
        imagePreviewBox.classList.remove('hidden');
      }
    }
  }else{
    pageTitle.textContent = 'Add Product';
    document.getElementById('productId').value = '';
  }
}

/* ---------- Image upload handling ---------- */
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){
    showToast('Sirf image file allowed hai', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    currentImageData = ev.target.result;
    imagePreview.src = currentImageData;
    imagePreviewBox.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

/* ---------- Render product list ---------- */
function renderProductList(filterText = ''){
  allProducts = DB.getProducts();
  const query = filterText.trim().toLowerCase();

  let filtered = allProducts;
  if(query){
    filtered = allProducts.filter(p => {
      const haystack = [p.name, p.art, p.brand, p.category, p.color, p.size]
        .map(v => (v || '').toString().toLowerCase()).join(' ');
      return haystack.includes(query);
    });
  }

  if(filtered.length === 0){
    productListEl.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        <p>${query ? 'Koi product match nahi hua.' : 'Abhi tak koi product add nahi hua. FAB button se add karein.'}</p>
      </div>`;
    return;
  }

  productListEl.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-thumb">${productImageHTML(p)}</div>
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
          <span class="stock-badge ${stockClassOf(p)}">${stockLabelOf(p)}</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="icon-btn edit" data-action="edit" data-id="${p.id}" aria-label="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"></path></svg>
        </button>
        <button class="icon-btn delete" data-action="delete" data-id="${p.id}" aria-label="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function productImageHTML(p){
  return p.image
    ? `<img src="${p.image}" alt="${escapeHTML(p.name)}">`
    : `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`;
}

function stockClassOf(p){
  const n = Number(p.stock) || 0;
  if(n === 0) return 'out';
  if(n <= 5) return 'low';
  return 'in';
}
function stockLabelOf(p){
  const n = Number(p.stock) || 0;
  if(n === 0) return 'Out of Stock';
  if(n <= 5) return 'Low Stock';
  return 'In Stock';
}

/* ---------- Form submit (Save / Update) ---------- */
productForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    art: document.getElementById('artNumber').value.trim(),
    brand: document.getElementById('brand').value.trim(),
    name: document.getElementById('productName').value.trim(),
    category: document.getElementById('category').value.trim(),
    color: document.getElementById('color').value.trim(),
    size: document.getElementById('size').value.trim(),
    stock: Number(document.getElementById('stock').value) || 0,
    mrp: Number(document.getElementById('mrp').value) || 0,
    dealerPrice: Number(document.getElementById('dealerPrice').value) || 0,
    description: document.getElementById('description').value.trim(),
    image: currentImageData || null
  };

  if(!data.name || !data.art || !data.brand || !data.category){
    showToast('Zaroori fields bharna hai', 'error');
    return;
  }

  const editId = document.getElementById('productId').value;
  if(editId){
    DB.updateProduct(editId, data);
    showToast('Product update ho gaya ✔');
  }else{
    DB.addProduct(data);
    showToast('Product save ho gaya ✔');
  }
  showListView();
});

/* ---------- List click handling (edit / delete) ---------- */
productListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');

  if(action === 'edit'){
    showFormView(id);
  }else if(action === 'delete'){
    const product = DB.getProductById(id);
    showConfirmModal({
      title: 'Product Delete Karein?',
      message: `"${product ? product.name : 'Yeh product'}" hamesha ke liye delete ho jayega.`,
      confirmText: 'Delete Karein',
      danger: true,
      onConfirm: () => {
        DB.deleteProduct(id);
        showToast('Product delete ho gaya ✔');
        renderProductList(searchInput.value);
      }
    });
  }
});

/* ---------- Search ---------- */
searchInput.addEventListener('input', () => {
  renderProductList(searchInput.value);
});

/* ---------- FAB & Cancel ---------- */
fabAdd.addEventListener('click', () => showFormView(null));
cancelFormBtn.addEventListener('click', () => showListView());

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if(params.get('new') === '1'){
    showFormView(null);
  }else{
    showListView();
  }
});
