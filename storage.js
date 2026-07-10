/* =========================================================
   YmoKart Business Manager — storage.js
   Local Storage Database Layer
   All data persistence for the app goes through this file.
   ========================================================= */

const DB = {
  KEYS: {
    PRODUCTS: 'ymokart_products',
    SETTINGS: 'ymokart_settings',
    STATS: 'ymokart_stats'
  },

  /* ---------- Generic helpers ---------- */
  _read(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      console.error('DB read error for', key, e);
      return fallback;
    }
  },
  _write(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      console.error('DB write error for', key, e);
      return false;
    }
  },

  /* ---------- Products ---------- */
  getProducts(){
    return this._read(this.KEYS.PRODUCTS, []);
  },

  getProductById(id){
    return this.getProducts().find(p => p.id === id) || null;
  },

  saveProducts(list){
    return this._write(this.KEYS.PRODUCTS, list);
  },

  addProduct(product){
    const list = this.getProducts();
    product.id = 'PRD' + Date.now() + Math.floor(Math.random()*1000);
    product.createdAt = new Date().toISOString();
    list.unshift(product);
    this.saveProducts(list);
    return product;
  },

  updateProduct(id, data){
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === id);
    if(idx === -1) return null;
    list[idx] = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() };
    this.saveProducts(list);
    return list[idx];
  },

  deleteProduct(id){
    const list = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(list);
    return true;
  },

  getCategories(){
    const list = this.getProducts();
    const set = new Set(list.map(p => (p.category || 'Uncategorized').trim()).filter(Boolean));
    return Array.from(set).sort();
  },

  getBrands(){
    const list = this.getProducts();
    const set = new Set(list.map(p => (p.brand || '').trim()).filter(Boolean));
    return Array.from(set).sort();
  },

  /* ---------- Settings ---------- */
  getSettings(){
    return this._read(this.KEYS.SETTINGS, {
      theme: 'dark',
      businessName: 'YmoKart',
      businessTagline: 'Business Manager'
    });
  },

  saveSettings(settings){
    const current = this.getSettings();
    const merged = { ...current, ...settings };
    this._write(this.KEYS.SETTINGS, merged);
    return merged;
  },

  /* ---------- Stats (posters / catalogs generated) ---------- */
  getStats(){
    return this._read(this.KEYS.STATS, { postersGenerated: 0, catalogsGenerated: 0 });
  },

  incrementStat(key){
    const stats = this.getStats();
    stats[key] = (stats[key] || 0) + 1;
    this._write(this.KEYS.STATS, stats);
    return stats;
  },

  /* ---------- Backup / Restore ---------- */
  exportAll(){
    return {
      exportedAt: new Date().toISOString(),
      app: 'YmoKart Business Manager',
      version: 1,
      products: this.getProducts(),
      settings: this.getSettings(),
      stats: this.getStats()
    };
  },

  importAll(data){
    if(!data || typeof data !== 'object') throw new Error('Invalid backup file');
    if(Array.isArray(data.products)) this.saveProducts(data.products);
    if(data.settings) this._write(this.KEYS.SETTINGS, data.settings);
    if(data.stats) this._write(this.KEYS.STATS, data.stats);
    return true;
  },

  clearAll(){
    localStorage.removeItem(this.KEYS.PRODUCTS);
    localStorage.removeItem(this.KEYS.STATS);
    return true;
  }
};
