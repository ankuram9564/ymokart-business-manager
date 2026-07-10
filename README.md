# YmoKart Business Manager

A complete offline-first mobile web app to manage your footwear/D2C business —
products, posters, PDF catalogs, and reports — built with pure HTML, CSS and
Vanilla JavaScript. No frameworks, no build step. Just open `index.html`.

## Features
- **Dashboard** — business overview (products, posters, catalogs, stock value) + quick actions
- **Product Manager** — add/edit/delete products with image upload, search, and stock badges (saved to browser Local Storage)
- **Poster Studio** — generate a premium beige poster (Canvas) for any product and download as PNG
- **PDF Catalog** — generate a professional, category-wise PDF catalog of your products
- **Reports** — total products, stock, MRP/dealer value, category-wise breakdown
- **Settings** — dark/light theme, backup (export JSON), restore (import JSON), clear database

## How to use
1. Unzip the folder.
2. Open `index.html` in any modern mobile or desktop browser (Chrome recommended).
3. Start by adding your products from the **Products** tab.
4. Generate posters and PDF catalogs anytime from the bottom navigation.
5. To host it online, upload the whole folder to GitHub Pages, Netlify, or any static host.

## Folder Structure
```
YmoKart/
├── index.html          Dashboard
├── products.html        Product Manager
├── poster.html          Poster Studio
├── catalog.html         PDF Catalog
├── reports.html         Reports
├── settings.html        Settings
├── style.css            Shared premium dark UI styles
├── app.js                Shared logic (theme, toast, nav, backup/restore)
├── products.js           Product CRUD logic
├── storage.js            Local Storage database layer
└── assets/
    ├── images/           App image assets
    └── icons/            App icon
```

## Notes
- All data is stored locally in your browser's Local Storage — nothing is sent to any server.
- Use **Settings → Backup** regularly to keep a safe JSON copy of your data.
- PDF generation uses the jsPDF library loaded via CDN (internet connection required only for catalog generation).

Built for **Lakhani Armaan Footwear Business** under the **YmoKart** brand.
