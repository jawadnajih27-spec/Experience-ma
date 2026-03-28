/* ================================================================
   Static E-com Manager — manager.js
   Full engine: state, UI, injection, GitHub deployment
   ================================================================ */

'use strict';

// ── STATE ────────────────────────────────────────────────────────
const STATE = {
  products: [],
  branding: {
    primaryColor: '#3fb950',
    accentColor:  '#58a6ff',
    storeName:    'متجري الإلكتروني',
    logoUrl:      ''
  },
  settings: {
    whatsapp: '',
    currency: 'درهم',
    lang:     'ar',
    desc:     ''
  },
  nextId: 1
};

const STORAGE_KEY = 'ecom_manager_state';

// ── COLOUR PRESETS ───────────────────────────────────────────────
const COLOR_PRESETS = [
  { name:'أخضر',   primary:'#16a34a', accent:'#22c55e' },
  { name:'أزرق',   primary:'#1d4ed8', accent:'#3b82f6' },
  { name:'بنفسجي', primary:'#7c3aed', accent:'#a78bfa' },
  { name:'برتقالي',primary:'#c2410c', accent:'#f97316' },
  { name:'وردي',   primary:'#be185d', accent:'#ec4899' },
  { name:'رمادي',  primary:'#374151', accent:'#6b7280' },
];

// ── PERSISTENCE ──────────────────────────────────────────────────
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(STATE.branding,  parsed.branding  || {});
      Object.assign(STATE.settings,  parsed.settings  || {});
      STATE.products = parsed.products || [];
      STATE.nextId   = parsed.nextId   || (STATE.products.length + 1);
    }
  } catch(e) { console.warn('loadState error', e); }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      branding:  STATE.branding,
      settings:  STATE.settings,
      products:  STATE.products,
      nextId:    STATE.nextId
    }));
  } catch(e) { console.warn('saveState error', e); }
}

// ── SECTION NAVIGATION ───────────────────────────────────────────
function showSection(name, triggerBtn) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const target = document.getElementById('sec-' + name);
  if (target) target.classList.add('active');

  if (triggerBtn) triggerBtn.classList.add('active');

  // Side effects when entering sections
  if (name === 'dashboard')  refreshDashboard();
  if (name === 'branding')   initBrandingForm();
  if (name === 'products')   renderProductsTable();
  if (name === 'settings')   initSettingsForm();
  if (name === 'deploy')     initDeploySection();
}

// ── DASHBOARD ────────────────────────────────────────────────────
function refreshDashboard() {
  document.getElementById('stat-products').textContent = STATE.products.length;
  document.getElementById('stat-store-name').textContent = STATE.branding.storeName || '—';
  document.getElementById('swatch-primary').style.background = STATE.branding.primaryColor;
  document.getElementById('swatch-accent').style.background  = STATE.branding.accentColor;
}

// ── BRANDING ─────────────────────────────────────────────────────
function initBrandingForm() {
  document.getElementById('primary-color').value = STATE.branding.primaryColor;
  document.getElementById('accent-color').value  = STATE.branding.accentColor;
  document.getElementById('store-name').value    = STATE.branding.storeName;
  document.getElementById('logo-url').value      = STATE.branding.logoUrl || '';
  renderPresets();
  updateColorPreview();
}

function renderPresets() {
  const container = document.getElementById('preset-palettes');
  container.innerHTML = COLOR_PRESETS.map((p, i) => `
    <div onclick="applyPreset(${i})"
      style="cursor:pointer;border-radius:8px;overflow:hidden;border:1.5px solid transparent;
             transition:.2s;display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:.4rem"
      class="preset-swatch" title="${p.name}">
      <div style="display:flex;gap:2px">
        <div style="width:24px;height:24px;border-radius:6px 0 0 6px;background:${p.primary}"></div>
        <div style="width:24px;height:24px;border-radius:0 6px 6px 0;background:${p.accent}"></div>
      </div>
      <span style="font-size:.65rem;color:#8b949e">${p.name}</span>
    </div>
  `).join('');
}

function applyPreset(i) {
  const p = COLOR_PRESETS[i];
  document.getElementById('primary-color').value = p.primary;
  document.getElementById('accent-color').value  = p.accent;
  updateColorPreview();
}

function updateColorPreview() {
  const primary = document.getElementById('primary-color').value;
  const accent  = document.getElementById('accent-color').value;
  const name    = document.getElementById('store-name').value || 'متجري';

  document.getElementById('primary-hex').textContent = primary;
  document.getElementById('accent-hex').textContent  = accent;

  // Live preview update
  document.getElementById('prev-nav').style.borderBottom    = `2px solid ${primary}`;
  document.getElementById('prev-name').style.color          = primary;
  document.getElementById('prev-name').textContent          = name;
  document.getElementById('prev-hero-title').style.color    = primary;
  document.getElementById('prev-hero-title').textContent    = name;
  document.getElementById('prev-price').style.color         = primary;
  document.getElementById('prev-price').textContent         = '199 درهم';
  document.getElementById('prev-price2').style.color        = primary;
  document.getElementById('prev-price2').textContent        = '149 درهم';
  document.getElementById('prev-btn').style.background      = accent;
  document.getElementById('prev-btn2').style.background     = accent;
  document.getElementById('prev-footer-name').style.color   = primary;
  document.getElementById('prev-footer-name').textContent   = name;

  const prevHero = document.getElementById('prev-hero');
  prevHero.style.background = `linear-gradient(135deg, ${hexToRGBA(primary, 0.1)}, #fff)`;
}

function saveBranding() {
  STATE.branding.primaryColor = document.getElementById('primary-color').value;
  STATE.branding.accentColor  = document.getElementById('accent-color').value;
  STATE.branding.storeName    = document.getElementById('store-name').value.trim() || 'متجري';
  STATE.branding.logoUrl      = document.getElementById('logo-url').value.trim();
  saveState();
  notify('✅ تم حفظ الهوية البصرية', 'success');
}

// ── SETTINGS ─────────────────────────────────────────────────────
function initSettingsForm() {
  document.getElementById('whatsapp-num').value  = STATE.settings.whatsapp;
  document.getElementById('currency-code').value = STATE.settings.currency;
  document.getElementById('store-lang').value    = STATE.settings.lang;
  document.getElementById('store-desc').value    = STATE.settings.desc;
}

function saveSettings() {
  STATE.settings.whatsapp = document.getElementById('whatsapp-num').value.replace(/[^0-9]/g, '');
  STATE.settings.currency = document.getElementById('currency-code').value.trim() || 'درهم';
  STATE.settings.lang     = document.getElementById('store-lang').value;
  STATE.settings.desc     = document.getElementById('store-desc').value.trim();
  saveState();
  notify('✅ تم حفظ الإعدادات', 'success');
}

// ── PRODUCTS ─────────────────────────────────────────────────────
let tableFilter = '';

function renderProductsTable() {
  const tbody   = document.getElementById('products-tbody');
  const empty   = document.getElementById('products-empty');
  const filtered = STATE.products.filter(p =>
    !tableFilter ||
    p.name.toLowerCase().includes(tableFilter) ||
    p.description.toLowerCase().includes(tableFilter)
  );

  if (!filtered.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <img src="${escHtml(p.image)}" alt="" class="product-thumb"
          onerror="this.src='https://placehold.co/44x44/161b22/6e7681?text=📦'">
      </td>
      <td style="font-weight:700;color:#e6edf3;max-width:180px">
        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(p.name)}</div>
      </td>
      <td style="max-width:240px;color:#8b949e;font-size:.8rem">
        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(p.description || '—')}</div>
      </td>
      <td style="font-weight:900;color:#3fb950;white-space:nowrap">
        ${p.price} ${STATE.settings.currency}
      </td>
      <td style="white-space:nowrap">
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-ghost btn-sm" onclick="openEditModal(${p.id})">✏️ تعديل</button>
          <button class="btn btn-sm" style="background:rgba(185,28,28,.15);color:#f87171;border:1px solid rgba(185,28,28,.25)"
            onclick="deleteProduct(${p.id})">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterTable(val) {
  tableFilter = val.toLowerCase();
  renderProductsTable();
}

function openAddModal() {
  document.getElementById('modal-mode-title').textContent = '➕ إضافة منتج جديد';
  document.getElementById('edit-product-id').value = '';
  document.getElementById('p-name').value  = '';
  document.getElementById('p-desc').value  = '';
  document.getElementById('p-price').value = '';
  document.getElementById('p-stock').value = '99';
  document.getElementById('p-image').value = '';
  document.getElementById('img-preview-wrap').style.display = 'none';
  document.getElementById('product-modal').classList.add('open');
}

function openEditModal(id) {
  const p = STATE.products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modal-mode-title').textContent = '✏️ تعديل المنتج';
  document.getElementById('edit-product-id').value = id;
  document.getElementById('p-name').value  = p.name;
  document.getElementById('p-desc').value  = p.description;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-stock').value = p.stock || 99;
  document.getElementById('p-image').value = p.image;
  previewProductImage();
  document.getElementById('product-modal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('open');
}

function previewProductImage() {
  const url  = document.getElementById('p-image').value.trim();
  const wrap = document.getElementById('img-preview-wrap');
  const img  = document.getElementById('img-preview');
  if (url) { img.src = url; wrap.style.display = 'block'; }
  else      { wrap.style.display = 'none'; }
}

function saveProduct() {
  const name  = document.getElementById('p-name').value.trim();
  const desc  = document.getElementById('p-desc').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  const stock = parseInt(document.getElementById('p-stock').value) || 99;
  const image = document.getElementById('p-image').value.trim();

  if (!name)           { notify('⚠️ اسم المنتج مطلوب', 'error'); return; }
  if (isNaN(price) || price < 0) { notify('⚠️ السعر يجب أن يكون رقماً صحيحاً', 'error'); return; }
  if (!image)          { notify('⚠️ رابط الصورة مطلوب', 'error'); return; }

  const editId = document.getElementById('edit-product-id').value;

  if (editId) {
    const idx = STATE.products.findIndex(x => x.id === parseInt(editId));
    if (idx !== -1) {
      STATE.products[idx] = { ...STATE.products[idx], name, description: desc, price, stock, image };
    }
    notify('✅ تم تعديل المنتج بنجاح', 'success');
  } else {
    STATE.products.push({ id: STATE.nextId++, name, description: desc, price, stock, image });
    notify('✅ تم إضافة المنتج', 'success');
  }

  saveState();
  closeProductModal();
  renderProductsTable();
}

function deleteProduct(id) {
  if (!confirm('هل تريد حذف هذا المنتج نهائياً؟')) return;
  STATE.products = STATE.products.filter(x => x.id !== id);
  saveState();
  renderProductsTable();
  notify('🗑 تم حذف المنتج', 'info');
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(STATE.products, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'products.json';
  a.click();
}

function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!Array.isArray(data)) throw new Error();
        STATE.products = data.map((p, i) => ({
          id:          p.id          || (STATE.nextId + i),
          name:        p.name        || 'منتج',
          description: p.description || '',
          price:       parseFloat(p.price) || 0,
          stock:       parseInt(p.stock)   || 99,
          image:       p.image       || ''
        }));
        STATE.nextId = STATE.products.reduce((m, p) => Math.max(m, p.id), 0) + 1;
        saveState();
        renderProductsTable();
        notify(`✅ تم استيراد ${STATE.products.length} منتج`, 'success');
      } catch {
        notify('❌ ملف JSON غير صالح', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── PREVIEW ──────────────────────────────────────────────────────
function generatePreview() {
  const html = buildStoreHTML();
  const frame = document.getElementById('store-preview-frame');
  frame.srcdoc = html;
  document.getElementById('preview-url-bar').textContent =
    `معاينة: ${STATE.branding.storeName}`;
  notify('🔄 تم تحديث المعاينة', 'info');
}

// ── INJECT ENGINE ────────────────────────────────────────────────
function buildStoreHTML() {
  // Get raw template from the embedded constant
  let html = STORE_TEMPLATE;

  const primary      = STATE.branding.primaryColor;
  const accent       = STATE.branding.accentColor;
  const primaryLight = hexToRGBA(primary, 0.1);
  const accentLight  = hexToRGBA(accent, 0.1);

  // Inject CSS variables
  html = html.replace('__PRIMARY_COLOR__',  primary);
  html = html.replace('__ACCENT_COLOR__',   accent);
  html = html.replace('__PRIMARY_LIGHT__',  primaryLight);
  html = html.replace('__ACCENT_LIGHT__',   accentLight);

  // Inject store info
  html = html.replaceAll('__STORE_NAME__',  escHtml(STATE.branding.storeName));
  html = html.replace('__LOGO_URL__',       STATE.branding.logoUrl || '');
  html = html.replace('__WHATSAPP__',       STATE.settings.whatsapp || '212600000000');
  html = html.replace('__CURRENCY__',       STATE.settings.currency || 'درهم');

  // Inject products JSON
  html = html.replace('__PRODUCTS_JSON__',  JSON.stringify(STATE.products));

  return html;
}

// ── DEPLOY ───────────────────────────────────────────────────────
function initDeploySection() {
  updateStoreUrlPreview();
  renderDeploySummary();
  renderReadme();
}

function updateStoreUrlPreview() {
  const user = (document.getElementById('github-username')?.value || '').trim();
  const repo = (document.getElementById('repo-name')?.value || 'my-store').trim();
  const el   = document.getElementById('store-url-preview');
  if (el) el.textContent = `${user || 'username'}.github.io/${repo}`;
}

function renderDeploySummary() {
  const el = document.getElementById('deploy-summary');
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:.6rem">
      ${summaryRow('📄', 'index.html', 'ملف المتجر الرئيسي المُخصَّص')}
      ${summaryRow('🎨', 'متغيرات اللون', `Primary: ${STATE.branding.primaryColor} / Accent: ${STATE.branding.accentColor}`)}
      ${summaryRow('📦', 'المنتجات', `${STATE.products.length} منتج مضمّن في الكود`)}
      ${summaryRow('📱', 'واتساب', STATE.settings.whatsapp ? `+${STATE.settings.whatsapp}` : '⚠️ غير محدد')}
      ${summaryRow('📖', 'README.md', 'دليل الاستخدام الكامل')}
    </div>
  `;
}

function summaryRow(icon, label, value) {
  return `
    <div style="display:flex;gap:.75rem;align-items:flex-start;padding:.6rem;background:rgba(0,0,0,.2);border-radius:8px">
      <span style="font-size:1rem;flex-shrink:0">${icon}</span>
      <div style="font-size:.82rem">
        <div style="font-weight:700;color:#e6edf3">${label}</div>
        <div style="color:#8b949e;margin-top:.1rem;font-size:.75rem">${value}</div>
      </div>
    </div>
  `;
}

async function deployToGitHub() {
  const token    = document.getElementById('github-token').value.trim();
  const repoName = document.getElementById('repo-name').value.trim();
  const username = document.getElementById('github-username').value.trim();

  if (!token)    { notify('⚠️ أدخل GitHub Token أولاً', 'error'); return; }
  if (!repoName) { notify('⚠️ أدخل اسم المستودع', 'error'); return; }
  if (!username) { notify('⚠️ أدخل اسم المستخدم', 'error'); return; }
  if (!STATE.settings.whatsapp) {
    notify('⚠️ أدخل رقم الواتساب في الإعدادات أولاً', 'error'); return;
  }

  const btn = document.getElementById('deploy-btn');
  btn.disabled = true;
  btn.textContent = '⏳ جارٍ النشر...';

  const logEl      = document.getElementById('deploy-log');
  const progressEl = document.getElementById('deploy-progress');
  const statusBadge = document.getElementById('deploy-status-badge');

  logEl.innerHTML  = '';
  progressEl.style.width = '0%';
  document.getElementById('success-box').classList.add('hidden');
  statusBadge.className   = 'badge badge-yellow';
  statusBadge.textContent = 'جارٍ النشر...';

  function log(msg, type = 'info') {
    const now = new Date().toLocaleTimeString('ar-MA', { hour12: false });
    logEl.innerHTML += `
      <div class="log-line">
        <span class="log-time">${now}</span>
        <span class="log-${type}">${msg}</span>
      </div>`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function progress(pct) { progressEl.style.width = pct + '%'; }

  try {
    const headers = {
      'Authorization': `token ${token}`,
      'Content-Type':  'application/json',
      'Accept':        'application/vnd.github.v3+json'
    };

    // 1. Check if repo exists
    log('🔍 التحقق من المستودع...', 'info');
    progress(10);

    const checkRes = await fetch(
      `https://api.github.com/repos/${username}/${repoName}`,
      { headers }
    );

    let sha = null; // SHA of existing index.html if any

    if (checkRes.status === 404) {
      // 2. Create repo
      log('📁 إنشاء مستودع جديد...', 'info');
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name:        repoName,
          description: `${STATE.branding.storeName} — متجر إلكتروني ثابت`,
          private:     false,
          auto_init:   false
        })
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.message || 'فشل إنشاء المستودع');
      }
      log('✅ تم إنشاء المستودع بنجاح', 'success');
      progress(30);
      await sleep(1200); // GitHub needs a moment
    } else if (checkRes.ok) {
      log('♻️ المستودع موجود — سيتم التحديث', 'warn');
      // Get existing index.html SHA for update
      const fileCheck = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/index.html`,
        { headers }
      );
      if (fileCheck.ok) {
        const fileData = await fileCheck.json();
        sha = fileData.sha;
      }
      progress(30);
    } else {
      throw new Error('فشل التحقق من صلاحيات الوصول');
    }

    // 3. Build store HTML
    log('⚙️ بناء كود المتجر مع الألوان المختارة...', 'info');
    progress(50);
    const storeHTML = buildStoreHTML();
    const htmlB64   = btoa(unescape(encodeURIComponent(storeHTML)));

    // 4. Upload index.html
    log('📤 رفع index.html...', 'info');
    const uploadBody = {
      message: `🚀 نشر المتجر — ${STATE.branding.storeName}`,
      content: htmlB64,
      ...(sha ? { sha } : {})
    };
    const uploadRes = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/index.html`,
      { method: 'PUT', headers, body: JSON.stringify(uploadBody) }
    );
    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      throw new Error(err.message || 'فشل رفع الملف');
    }
    log('✅ تم رفع index.html', 'success');
    progress(70);

    // 5. Upload README.md
    log('📄 رفع README.md...', 'info');
    const readmeContent = generateReadmeText(username, repoName);
    const readmeB64     = btoa(unescape(encodeURIComponent(readmeContent)));

    const readmeCheck = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
      { headers }
    );
    let readmeSha = null;
    if (readmeCheck.ok) {
      const rd = await readmeCheck.json();
      readmeSha = rd.sha;
    }

    await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
      {
        method: 'PUT', headers,
        body: JSON.stringify({
          message: '📖 تحديث دليل الاستخدام',
          content: readmeB64,
          ...(readmeSha ? { sha: readmeSha } : {})
        })
      }
    );
    log('✅ تم رفع README.md', 'success');
    progress(85);

    // 6. Enable GitHub Pages (branch: main)
    log('🌐 تفعيل GitHub Pages...', 'info');
    const pagesRes = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/pages`,
      {
        method:  'POST',
        headers: { ...headers, 'Accept': 'application/vnd.github.switcheroo-preview+json' },
        body:    JSON.stringify({ source: { branch: 'main', path: '/' } })
      }
    );
    // 409 = already enabled — that's fine
    if (pagesRes.ok || pagesRes.status === 409) {
      log('✅ GitHub Pages مُفعَّل', 'success');
    } else {
      log('⚠️ لم يتم تفعيل Pages تلقائياً — فعّله يدوياً من إعدادات المستودع', 'warn');
    }
    progress(100);

    const liveUrl = `https://${username}.github.io/${repoName}`;
    log(`🎉 تم النشر! رابط المتجر: ${liveUrl}`, 'success');

    statusBadge.className   = 'badge badge-green';
    statusBadge.textContent = 'تم بنجاح ✅';

    const successBox = document.getElementById('success-box');
    successBox.classList.remove('hidden');
    document.getElementById('store-live-link').href = liveUrl;

    notify('🎉 تم نشر متجرك بنجاح!', 'success');

  } catch (err) {
    log(`❌ خطأ: ${err.message}`, 'error');
    statusBadge.className   = 'badge badge-orange';
    statusBadge.textContent = 'خطأ ❌';
    notify('❌ فشل النشر: ' + err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = '🚀 ابدأ النشر الآن';
  }
}

// ── README GENERATOR ─────────────────────────────────────────────
function generateReadmeText(username = 'username', repo = 'my-store') {
  return `# 🛍️ ${STATE.branding.storeName}

> متجر إلكتروني ثابت (Static) مبني بـ Static E-com Manager

🌐 **رابط المتجر الحي:** https://${username}.github.io/${repo}

---

## مبروك! أنت الآن تمتلك متجرك الإلكتروني الخاص 🎉

هذا المتجر ليس مجرد موقع، بل **نظام متكامل** يتيح لك:
- عرض منتجاتك في واجهة احترافية وسريعة
- استقبال الطلبات مباشرة على **واتساب** بتفاصيل كاملة
- **مجاناً للأبد** — لا سيرفرات، لا تكاليف شهرية

---

## ⚡ ميزات المتجر

| الميزة | التفاصيل |
|--------|----------|
| 🚀 سرعة خارقة | ملف HTML واحد بدون قاعدة بيانات |
| 📱 متجاوب 100% | يعمل بشكل مثالي على الهاتف والكمبيوتر |
| 🛒 سلة تسوق | محفوظة تلقائياً في المتصفح (Local Storage) |
| 💬 طلبات واتساب | تفاصيل الطلب تصل فورياً برسالة منسقة |
| 🎨 هوية بصرية | ألوان مخصصة لعلامتك التجارية |
| 🔍 بحث فوري | البحث في المنتجات بدون إعادة تحميل |

---

## 🛒 كيف تصل الطلبات؟

عند اكتمال الطلب، يتلقى رقم الواتساب **+${STATE.settings.whatsapp}** رسالة بهذا الشكل:

\`\`\`
🛒 طلب جديد من ${STATE.branding.storeName}

• اسم المنتج × الكمية — السعر
• ...

💰 الإجمالي: XXX ${STATE.settings.currency}

أرجو تأكيد الطلب، شكراً! 🙏
\`\`\`

---

## 📊 معلومات المتجر

- **الاسم:** ${STATE.branding.storeName}
- **عدد المنتجات:** ${STATE.products.length}
- **العملة:** ${STATE.settings.currency}
- **اللون الرئيسي:** ${STATE.branding.primaryColor}
- **تاريخ الإنشاء:** ${new Date().toLocaleDateString('ar-MA')}

---

*مبني بـ Static E-com Manager — الاستضافة المجانية على GitHub Pages*`;
}

function renderReadme() {
  const el = document.getElementById('readme-content');
  if (el) el.textContent = generateReadmeText(
    document.getElementById('github-username')?.value || 'username',
    document.getElementById('repo-name')?.value       || 'my-store'
  );
}

function copyReadme() {
  const txt = document.getElementById('readme-content').textContent;
  navigator.clipboard.writeText(txt).then(() => notify('📋 تم نسخ README', 'success'));
}

// ── MISC UTILS ───────────────────────────────────────────────────
function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function notify(msg, type = 'info') {
  const old = document.querySelector('.notif');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  el.innerHTML = msg;
  document.body.appendChild(el);
  setTimeout(() => el.style.opacity = '0', 2500);
  setTimeout(() => el.remove(), 3000);
}

function clearAllData() {
  if (!confirm('سيتم حذف جميع المنتجات والإعدادات نهائياً. هل أنت متأكد؟')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ── STORE TEMPLATE (embedded) ─────────────────────────────────────
// This is the raw store template with placeholders.
// In production, this could be fetched from store-template.html
const STORE_TEMPLATE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>__STORE_NAME__</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<style>
:root{--primary:__PRIMARY_COLOR__;--accent:__ACCENT_COLOR__;--primary-light:__PRIMARY_LIGHT__;--accent-light:__ACCENT_LIGHT__;}
*{font-family:'Noto Kufi Arabic',sans-serif;}
body{background:#fafafa;}
.btn-primary{background:var(--primary);color:#fff;transition:all .25s;}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);}
.btn-accent{background:var(--accent);color:#fff;transition:all .25s;}
.btn-accent:hover{filter:brightness(1.1);transform:translateY(-1px);}
.card-hover{transition:all .3s cubic-bezier(.4,0,.2,1);}
.card-hover:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.12);}
.nav-brand{color:var(--primary);}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);z-index:1000;align-items:center;justify-content:center;}
.modal-overlay.open{display:flex;}
.cart-sidebar{position:fixed;top:0;left:0;height:100%;width:min(420px,100vw);background:#fff;z-index:999;transform:translateX(-100%);transition:transform .35s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 32px rgba(0,0,0,.15);}
.cart-sidebar.open{transform:translateX(0);}
.cart-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998;}
.cart-overlay.open{display:block;}
.badge-count{background:var(--accent);color:#fff;font-size:10px;font-weight:700;border-radius:99px;padding:1px 6px;position:absolute;top:-6px;right:-8px;min-width:18px;text-align:center;}
.product-img{aspect-ratio:1/1;object-fit:cover;width:100%;border-radius:12px 12px 0 0;}
.whatsapp-btn{background:#25D366;color:#fff;display:inline-flex;align-items:center;gap:.5rem;transition:all .25s;}
.whatsapp-btn:hover{background:#128C7E;transform:translateY(-1px);}
.qty-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1.5px solid #e5e7eb;cursor:pointer;transition:.2s;font-size:1rem;font-weight:700;user-select:none;}
.qty-btn:hover{border-color:var(--primary);color:var(--primary);}
@keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.animate-up{animation:slideUp .4s ease forwards;}
</style>
</head>
<body class="min-h-screen">
<header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
<div class="flex items-center gap-3">
<img id="store-logo" src="__LOGO_URL__" alt="logo" class="h-9 w-9 rounded-xl object-cover" onerror="this.style.display='none'">
<span class="font-black text-xl nav-brand">__STORE_NAME__</span>
</div>
<div class="flex-1 max-w-sm">
<input id="search-input" type="text" placeholder="ابحث عن منتج..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 transition">
</div>
<button onclick="openCart()" class="relative p-2.5 rounded-xl hover:bg-gray-50 transition">
<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
<span id="cart-count" class="badge-count hidden">0</span>
</button>
</div>
</header>
<section class="py-14 px-4 text-center" style="background:linear-gradient(135deg,var(--primary-light) 0%,#fff 60%)">
<p class="text-xs font-semibold tracking-widest uppercase mb-3 opacity-60">مرحباً بك في</p>
<h1 class="text-4xl md:text-5xl font-black mb-4" style="color:var(--primary)">__STORE_NAME__</h1>
<p class="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">اكتشف مجموعتنا المختارة من المنتجات المميزة.</p>
</section>
<main class="max-w-6xl mx-auto px-4 py-12">
<div class="flex items-center justify-between mb-8">
<h2 class="text-2xl font-black text-gray-900">المنتجات</h2>
<span id="products-count" class="text-sm text-gray-400"></span>
</div>
<div id="products-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"></div>
<div id="no-results" class="hidden text-center py-20 text-gray-400"><div class="text-5xl mb-4">🔍</div><p class="font-semibold">لا توجد منتجات مطابقة</p></div>
</main>
<div id="product-modal" class="modal-overlay" onclick="if(event.target===this)closeModal()">
<div class="bg-white rounded-2xl w-full max-w-xl mx-4 overflow-hidden shadow-2xl animate-up">
<div class="relative">
<img id="modal-img" src="" alt="" class="w-full h-64 object-cover">
<button onclick="closeModal()" class="absolute top-3 left-3 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-xl flex items-center justify-center transition text-lg font-bold">✕</button>
</div>
<div class="p-6">
<h3 id="modal-name" class="text-xl font-black text-gray-900 mb-3"></h3>
<p id="modal-desc" class="text-gray-500 text-sm leading-relaxed mb-5"></p>
<div class="flex items-center justify-between">
<span id="modal-price" class="text-2xl font-black" style="color:var(--primary)"></span>
<button onclick="addToCartFromModal()" class="btn-accent font-bold px-5 py-2.5 rounded-xl text-sm">+ أضف للسلة</button>
</div>
</div>
</div>
</div>
<div id="cart-overlay" class="cart-overlay" onclick="closeCart()"></div>
<aside id="cart-sidebar" class="cart-sidebar flex flex-col">
<div class="flex items-center justify-between p-5 border-b border-gray-100">
<h2 class="font-black text-lg text-gray-900">سلة التسوق 🛒</h2>
<button onclick="closeCart()" class="text-gray-400 hover:text-gray-700 text-xl font-bold transition">✕</button>
</div>
<div id="cart-items" class="flex-1 overflow-y-auto p-5 space-y-4"></div>
<div id="cart-empty" class="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 hidden">
<div class="text-5xl mb-4">🛍️</div>
<p class="font-semibold text-center">سلتك فارغة</p>
</div>
<div id="cart-footer" class="p-5 border-t border-gray-100 space-y-4 hidden">
<div class="flex justify-between font-black text-lg">
<span>الإجمالي</span>
<span id="cart-total" style="color:var(--primary)"></span>
</div>
<button onclick="checkoutWhatsApp()" class="whatsapp-btn w-full py-3.5 rounded-xl font-bold text-base justify-center">
<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
إتمام الطلب عبر واتساب
</button>
<button onclick="clearCart()" class="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition font-semibold">إفراغ السلة</button>
</div>
</aside>
<footer class="mt-20 py-10 border-t border-gray-100 text-center">
<p class="font-black text-lg mb-1" style="color:var(--primary)">__STORE_NAME__</p>
<p class="text-gray-400 text-sm">جميع الحقوق محفوظة © 2024</p>
</footer>
<script>
const STORE_CONFIG={name:"__STORE_NAME__",whatsapp:"__WHATSAPP__",currency:"__CURRENCY__"};
const PRODUCTS=__PRODUCTS_JSON__;
let cart=JSON.parse(localStorage.getItem('cart_v1')||'[]');
let currentProduct=null;
function renderProducts(list){
  const g=document.getElementById('products-grid');
  const nr=document.getElementById('no-results');
  const ct=document.getElementById('products-count');
  if(!list.length){g.innerHTML='';nr.classList.remove('hidden');ct.textContent='';return;}
  nr.classList.add('hidden');ct.textContent=list.length+' منتج';
  g.innerHTML=list.map((p,i)=>\`<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover cursor-pointer animate-up" style="animation-delay:\${i*60}ms" onclick="openModal(\${p.id})">
  <img src="\${p.image}" alt="\${p.name}" class="product-img" onerror="this.src='https://placehold.co/400x400/f3f4f6/9ca3af?text=📦'">
  <div class="p-4">
    <h3 class="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">\${p.name}</h3>
    <p class="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">\${p.description}</p>
    <div class="flex items-center justify-between gap-2">
      <span class="font-black text-base" style="color:var(--primary)">\${p.price} \${STORE_CONFIG.currency}</span>
      <button onclick="event.stopPropagation();addToCart(\${p.id})" class="btn-accent text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">+ سلة</button>
    </div>
  </div></div>\`).join('');
}
function openModal(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;currentProduct=p;document.getElementById('modal-img').src=p.image;document.getElementById('modal-img').onerror=function(){this.src='https://placehold.co/600x400/f3f4f6/9ca3af?text=📦'};document.getElementById('modal-name').textContent=p.name;document.getElementById('modal-desc').textContent=p.description;document.getElementById('modal-price').textContent=p.price+' '+STORE_CONFIG.currency;document.getElementById('product-modal').classList.add('open');document.body.style.overflow='hidden';}
function closeModal(){document.getElementById('product-modal').classList.remove('open');document.body.style.overflow='';}
function addToCartFromModal(){if(currentProduct){addToCart(currentProduct.id);closeModal();}}
function addToCart(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;const e=cart.find(x=>x.id===id);if(e)e.qty++;else cart.push({id,name:p.name,price:p.price,image:p.image,qty:1});saveCart();updateUI();showToast('✅ أُضيف: '+p.name);}
function removeFromCart(id){cart=cart.filter(x=>x.id!==id);saveCart();updateUI();renderCartItems();}
function changeQty(id,d){const i=cart.find(x=>x.id===id);if(!i)return;i.qty+=d;if(i.qty<=0)removeFromCart(id);else{saveCart();updateUI();renderCartItems();}}
function clearCart(){cart=[];saveCart();updateUI();renderCartItems();}
function saveCart(){localStorage.setItem('cart_v1',JSON.stringify(cart));}
function updateUI(){const t=cart.reduce((s,x)=>s+x.qty,0);const b=document.getElementById('cart-count');b.textContent=t;t>0?b.classList.remove('hidden'):b.classList.add('hidden');}
function renderCartItems(){const c=document.getElementById('cart-items');const em=document.getElementById('cart-empty');const ft=document.getElementById('cart-footer');const tot=document.getElementById('cart-total');if(!cart.length){c.classList.add('hidden');em.classList.remove('hidden');ft.classList.add('hidden');return;}c.classList.remove('hidden');em.classList.add('hidden');ft.classList.remove('hidden');const total=cart.reduce((s,x)=>s+x.price*x.qty,0);tot.textContent=total.toFixed(2)+' '+STORE_CONFIG.currency;c.innerHTML=cart.map(item=>\`<div class="flex gap-3 items-center bg-gray-50 rounded-2xl p-3"><img src="\${item.image}" alt="" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" onerror="this.src='https://placehold.co/100x100/f3f4f6/9ca3af?text=📦'"><div class="flex-1 min-w-0"><p class="font-bold text-sm text-gray-900 leading-snug mb-1 truncate">\${item.name}</p><p class="text-xs font-black" style="color:var(--primary)">\${(item.price*item.qty).toFixed(2)} \${STORE_CONFIG.currency}</p></div><div class="flex flex-col items-center gap-1.5 flex-shrink-0"><div class="flex items-center gap-1.5"><span class="qty-btn" onclick="changeQty(\${item.id},-1)">−</span><span class="w-6 text-center font-bold text-sm">\${item.qty}</span><span class="qty-btn" onclick="changeQty(\${item.id},1)">+</span></div><button onclick="removeFromCart(\${item.id})" class="text-xs text-red-400 hover:text-red-600 transition">حذف</button></div></div>\`).join('');}
function openCart(){renderCartItems();document.getElementById('cart-sidebar').classList.add('open');document.getElementById('cart-overlay').classList.add('open');document.body.style.overflow='hidden';}
function closeCart(){document.getElementById('cart-sidebar').classList.remove('open');document.getElementById('cart-overlay').classList.remove('open');document.body.style.overflow='';}
function checkoutWhatsApp(){if(!cart.length)return;const total=cart.reduce((s,x)=>s+x.price*x.qty,0);let msg='🛒 *طلب جديد من '+STORE_CONFIG.name+'*\\n\\n';cart.forEach(i=>{msg+='• '+i.name+' × '+i.qty+' — '+(i.price*i.qty).toFixed(2)+' '+STORE_CONFIG.currency+'\\n';});msg+='\\n💰 *الإجمالي: '+total.toFixed(2)+' '+STORE_CONFIG.currency+'*\\n\\nأرجو تأكيد الطلب، شكراً! 🙏';window.open('https://wa.me/'+STORE_CONFIG.whatsapp.replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(msg),'_blank');}
function showToast(m){const t=document.createElement('div');t.style.cssText='position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.2)';t.style.background='var(--primary)';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2200);}
document.getElementById('search-input').addEventListener('input',function(){const q=this.value.trim().toLowerCase();renderProducts(q?PRODUCTS.filter(p=>p.name.toLowerCase().includes(q)||p.description.toLowerCase().includes(q)):PRODUCTS);});
renderProducts(PRODUCTS);updateUI();
<\/script>
</body>
</html>`;

// ── BOOT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  refreshDashboard();
  initBrandingForm();

  // Keep readme + url preview in sync
  ['github-username','repo-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { updateStoreUrlPreview(); renderReadme(); });
  });
});
