/* ========================================
   AVA Gayrimenkul — Admin Panel JS
   ======================================== */

const ADMIN_PASS_KEY = 'ava_admin_pass';
const DEFAULT_PASS   = 'ava2025';

/* ─── Password helpers ─── */
function getAdminPass() {
  return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASS;
}
function isLoggedIn() {
  return sessionStorage.getItem('ava_admin_auth') === 'true';
}

/* ─── Init on page load ─── */
window.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  if (isLoggedIn()) {
    showAdminLayout();
  }
  loadSettings();
});

/* ─── Login ─── */
function doLogin(e) {
  e.preventDefault();
  const pass = document.getElementById('loginPass').value;
  if (pass === getAdminPass()) {
    sessionStorage.setItem('ava_admin_auth', 'true');
    showAdminLayout();
  } else {
    document.getElementById('loginError').classList.add('show');
    document.getElementById('loginPass').style.borderColor = 'rgba(220,50,50,0.6)';
    setTimeout(() => {
      document.getElementById('loginError').classList.remove('show');
      document.getElementById('loginPass').style.borderColor = '';
    }, 3000);
  }
}

/* ─── Toggle password visibility ─── */
function togglePassVis() {
  const inp  = document.getElementById('loginPass');
  const icon = document.getElementById('passEyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    inp.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

/* ─── Logout ─── */
function doLogout() {
  sessionStorage.removeItem('ava_admin_auth');
  document.getElementById('adminLayout').style.display = 'none';
  document.getElementById('loginPage').style.display   = 'flex';
  document.getElementById('loginPass').value = '';
}

/* ─── Show admin layout ─── */
function showAdminLayout() {
  document.getElementById('loginPage').style.display   = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
  refreshDashboard();
}

/* ─── Panel navigation ─── */
let currentTableFilter = 'all'; // for filtered views

function showPanel(name, linkEl) {
  currentTableFilter = 'all';
  document.getElementById('panel-ilanlar') && (document.getElementById('ilanlarPanelTitle').innerHTML =
    '<i class="fa-solid fa-list" style="color:var(--gold);margin-right:8px;"></i>Tüm İlanlar');

  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  const titles = {
    dashboard:  ['Gösterge Paneli', 'Son ilanlar ve özet istatistikler'],
    ilanlar:    ['Tüm İlanlar', 'İlanları yönetin'],
    'ilan-ekle':['İlan Ekle', 'Yeni ilan oluşturun'],
    teklifler:  ['Gelen Teklifler', 'Müşteri tekliflerini yönetin'],
    talepler:   ['Mülk Talepleri', 'Gelen mülk arama taleplerini yönetin'],
    ayarlar:    ['Site Ayarları', 'İletişim ve genel ayarlar']
  };
  if (titles[name]) {
    document.getElementById('topbarTitle').textContent = titles[name][0];
    document.getElementById('topbarSub').textContent   = titles[name][1];
  }

  if (name === 'dashboard') refreshDashboard();
  if (name === 'ilanlar')   renderTable();
  if (name === 'ilan-ekle') { resetForm(); updateFormTitle(false); }
  if (name === 'teklifler') renderTeklifler();
  if (name === 'talepler')  renderTalepler();
  if (name === 'ayarlar')   loadSettings();
}

function showFilteredPanel(islem, linkEl) {
  currentTableFilter = islem;
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById('panel-ilanlar').classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  const label = islem === 'satilik' ? 'Satılık İlanlar' : 'Kiralık İlanlar';
  document.getElementById('ilanlarPanelTitle').innerHTML =
    `<i class="fa-solid fa-${islem === 'satilik' ? 'tag' : 'key'}" style="color:var(--gold);margin-right:8px;"></i>${label}`;
  document.getElementById('topbarTitle').textContent = label;
  document.getElementById('topbarSub').textContent   = islem === 'satilik' ? 'Satılık mülklerinizi yönetin' : 'Kiralık mülklerinizi yönetin';
  renderTable();
}

/* ─── Dashboard ─── */
function refreshDashboard() {
  const all     = getIlanlar();
  const satilik = all.filter(i => i.islem === 'satilik' && i.durum === 'aktif');
  const kiralik = all.filter(i => i.islem === 'kiralik' && i.durum === 'aktif');
  const yeniTeklif = getTeklifler().filter(t => t.durum === 'yeni').length;
  const yeniTalep  = getTalepler().filter(t => t.durum === 'yeni').length;

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-icon"><i class="fa-solid fa-list"></i></div>
      <div>
        <span class="stat-card-num">${all.length}</span>
        <span class="stat-card-label">Toplam İlan</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon"><i class="fa-solid fa-tag"></i></div>
      <div>
        <span class="stat-card-num">${satilik.length}</span>
        <span class="stat-card-label">Satılık</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon"><i class="fa-solid fa-key"></i></div>
      <div>
        <span class="stat-card-num">${kiralik.length}</span>
        <span class="stat-card-label">Kiralık</span>
      </div>
    </div>
    <div class="stat-card" style="cursor:pointer;" onclick="showPanel('teklifler', document.querySelector('[onclick*=teklifler]'))">
      <div class="stat-card-icon" style="${yeniTeklif > 0 ? 'background:rgba(201,164,85,0.2);' : ''}">
        <i class="fa-solid fa-hand-holding-dollar" style="${yeniTeklif > 0 ? 'color:var(--gold);' : ''}"></i>
      </div>
      <div>
        <span class="stat-card-num" style="${yeniTeklif > 0 ? 'color:var(--gold);' : ''}">${yeniTeklif}</span>
        <span class="stat-card-label">Yeni Teklif</span>
      </div>
    </div>
    <div class="stat-card" style="cursor:pointer;" onclick="showPanel('talepler', document.querySelector('[onclick*=talepler]'))">
      <div class="stat-card-icon" style="${yeniTalep > 0 ? 'background:rgba(201,164,85,0.2);' : ''}">
        <i class="fa-solid fa-magnifying-glass-dollar" style="${yeniTalep > 0 ? 'color:var(--gold);' : ''}"></i>
      </div>
      <div>
        <span class="stat-card-num" style="${yeniTalep > 0 ? 'color:var(--gold);' : ''}">${yeniTalep}</span>
        <span class="stat-card-label">Yeni Talep</span>
      </div>
    </div>`;

  renderRecentTable(all.slice().sort((a,b) => new Date(b.tarih) - new Date(a.tarih)).slice(0, 5));
  updateTeklifBadge();
  updateTalepBadge();
}

/* ─── Recent table (dashboard) ─── */
function renderRecentTable(ilanlar) {
  const tbody = document.getElementById('recentTableBody');
  if (!tbody) return;
  tbody.innerHTML = ilanlar.map(i => buildTableRow(i)).join('') ||
    '<tr><td colspan="8" style="text-align:center;color:var(--gray);padding:32px;">Henüz ilan yok</td></tr>';
}

/* ─── Full table ─── */
function renderTable() {
  const query = (document.getElementById('tableSearch')?.value || '').toLowerCase();
  let ilanlar = getIlanlar();

  if (currentTableFilter !== 'all') ilanlar = ilanlar.filter(i => i.islem === currentTableFilter);
  if (query) ilanlar = ilanlar.filter(i =>
    i.baslik.toLowerCase().includes(query) ||
    i.konum.toLowerCase().includes(query) ||
    (i.mahalle || '').toLowerCase().includes(query)
  );
  ilanlar.sort((a,b) => new Date(b.tarih) - new Date(a.tarih));

  const tbody = document.getElementById('ilanlarTableBody');
  const empty = document.getElementById('tableEmpty');
  if (!tbody) return;

  if (ilanlar.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = ilanlar.map(i => buildTableRow(i, true)).join('');
}

/* ─── Build table row ─── */
function buildTableRow(i, showAll = false) {
  const durumMap = {
    aktif:   { cls:'badge-satilik', label:'Aktif' },
    pasif:   { cls:'', label:'Pasif', style:'background:rgba(100,100,100,0.15);color:var(--gray);' },
    satildi: { cls:'', label:'Satıldı/Kiralandı', style:'background:rgba(50,200,100,0.15);color:#32C864;' }
  };
  const d = durumMap[i.durum] || durumMap.aktif;
  return `
    <tr>
      <td>
        ${i.resimUrl
          ? `<img class="admin-thumb" src="${i.resimUrl}" alt="" onerror="this.style.display='none'" />`
          : `<div class="admin-thumb-placeholder"><i class="fa-solid fa-image"></i></div>`}
      </td>
      <td style="max-width:200px;">
        <div style="font-weight:500;color:var(--white);font-size:0.83rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;" title="${i.baslik}">${i.baslik}</div>
        <div style="font-size:0.72rem;color:var(--gray);margin-top:2px;">${i.mahalle ? i.mahalle + ', ' : ''}${i.konum}</div>
      </td>
      <td><span class="badge badge-tip">${capitalize(i.tip)}</span></td>
      <td><span class="status-badge status-${i.islem}">${i.islem === 'satilik' ? 'Satılık' : 'Kiralık'}</span></td>
      <td style="font-weight:600;color:var(--gold);white-space:nowrap;">${formatFiyat(i.fiyat)}</td>
      ${showAll ? `
        <td>${i.metrekare ? i.metrekare + ' m²' : '—'}</td>
        <td>${i.oda || '—'}</td>
        <td style="white-space:nowrap;">${i.konum}</td>` : ''}
      <td>
        <span class="status-badge" style="${d.style || ''}" class="${d.cls}">${d.label}</span>
      </td>
      <td>
        <div class="tbl-actions">
          <a class="tbl-btn" href="detay.html?id=${i.id}" target="_blank" title="Detay Sayfasını Gör"
             style="display:inline-flex;align-items:center;justify-content:center;color:var(--gold);background:rgba(201,164,85,0.08);border:1px solid rgba(201,164,85,0.2);border-radius:4px;width:32px;height:32px;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <button class="tbl-btn tbl-btn-edit" onclick="editIlan('${i.id}')" title="Düzenle">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="tbl-btn tbl-btn-del" onclick="confirmDelete('${i.id}')" title="Sil">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
}

/* ─── Edit listing ─── */
function editIlan(id) {
  const ilan = getIlanlar().find(i => i.id === id);
  if (!ilan) return;

  showPanel('ilan-ekle', null);
  updateFormTitle(true);

  document.getElementById('ilanId').value        = ilan.id;
  document.getElementById('fBaslik').value        = ilan.baslik;
  document.getElementById('fIslem').value         = ilan.islem;
  document.getElementById('fTip').value           = ilan.tip;
  document.getElementById('fDurum').value         = ilan.durum;
  document.getElementById('fFiyat').value         = ilan.fiyat;
  document.getElementById('fMetrekare').value     = ilan.metrekare || '';
  document.getElementById('fOda').value           = ilan.oda || '';
  document.getElementById('fKonum').value         = ilan.konum;
  document.getElementById('fMahalle').value       = ilan.mahalle || '';
  document.getElementById('fResimUrl').value      = ilan.resimUrl || '';
  document.getElementById('fAciklama').value      = ilan.aciklama || '';
  document.getElementById('fSahibindenLink').value= ilan.sahibindenLink || '';
  previewImage(ilan.resimUrl || '');

  // Checkboxes
  document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
    cb.checked = (ilan.ozellikler || []).includes(cb.value);
  });

  // Galeri
  galleryItems = (ilan.galeri || []).filter(g => g && g.src).map(g => ({ tip: g.tip, src: g.src }));
  renderGalleryGrid();
}

function updateFormTitle(isEdit) {
  const t = document.getElementById('formPanelTitle');
  const btn = document.getElementById('formSubmitBtn');
  if (isEdit) {
    t.innerHTML = '<i class="fa-solid fa-pen" style="color:var(--gold);margin-right:8px;"></i>İlan Düzenle';
    btn.innerHTML = '<i class="fa-solid fa-save"></i> Değişiklikleri Kaydet';
  } else {
    t.innerHTML = '<i class="fa-solid fa-plus-circle" style="color:var(--gold);margin-right:8px;"></i>Yeni İlan Ekle';
    btn.innerHTML = '<i class="fa-solid fa-save"></i> İlanı Kaydet';
  }
}

/* ─── Save listing (add/edit) ─── */
function saveIlan(e) {
  e.preventDefault();

  const id       = document.getElementById('ilanId').value;
  const ozellikler = Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')).map(cb => cb.value);

  // Galeri: boş src'li video satırlarını atla
  const galeri = galleryItems.filter(g => g.src && g.src.trim());

  const ilan = {
    id:             id || generateId(),
    baslik:         document.getElementById('fBaslik').value.trim(),
    islem:          document.getElementById('fIslem').value,
    tip:            document.getElementById('fTip').value,
    durum:          document.getElementById('fDurum').value,
    fiyat:          parseInt(document.getElementById('fFiyat').value) || 0,
    metrekare:      parseInt(document.getElementById('fMetrekare').value) || 0,
    oda:            document.getElementById('fOda').value,
    konum:          document.getElementById('fKonum').value.trim(),
    mahalle:        document.getElementById('fMahalle').value.trim(),
    resimUrl:       document.getElementById('fResimUrl').value.trim(),
    aciklama:       document.getElementById('fAciklama').value.trim(),
    sahibindenLink: document.getElementById('fSahibindenLink').value.trim(),
    ozellikler,
    galeri,
    tarih:          id ? (getIlanlar().find(i => i.id === id)?.tarih || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
  };

  const ilanlar = getIlanlar();
  const idx     = ilanlar.findIndex(i => i.id === ilan.id);
  const isEdit  = idx >= 0;
  if (isEdit) {
    ilanlar[idx] = ilan;
  } else {
    ilanlar.unshift(ilan);
  }
  const ok = saveIlanlar(ilanlar);
  if (!ok) return; // saveIlanlar zaten hata tostu gösterdi
  showToast(isEdit ? 'İlan başarıyla güncellendi!' : 'Yeni ilan başarıyla eklendi!', 'success');
  resetForm();
  showPanel('ilanlar', document.querySelector('[onclick*="ilanlar"]'));
}

/* ─── Reset form ─── */
function resetForm() {
  document.getElementById('ilanForm').reset();
  document.getElementById('ilanId').value    = '';
  document.getElementById('fResimUrl').value = '';
  clearImagePreview();
  document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
  galleryItems = [];
  renderGalleryGrid();
  updateFormTitle(false);
}

/* ════════════════════════════════════════════════
   GALERİ YÖNETİMİ
   ════════════════════════════════════════════════ */
let galleryItems = []; // [{tip:'fotograf'|'video', src:'...'}]

/* ── Yardımcı: canvas sıkıştırma ── */
function compressToBase64(file, maxW, quality, cb) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ── Ek galeri fotoğrafı yükle (çoklu) ── */
function handleGalleryUpload(input) {
  const files = Array.from(input.files);
  input.value = '';
  if (!files.length) return;

  const MAX_PHOTOS = 20;
  const existingCount = galleryItems.filter(g => g.tip === 'fotograf').length;
  const remaining = MAX_PHOTOS - existingCount;
  if (remaining <= 0) {
    showToast(`En fazla ${MAX_PHOTOS} ek fotoğraf ekleyebilirsiniz.`, 'error');
    return;
  }

  const toProcess = files.slice(0, remaining);
  if (files.length > remaining) {
    showToast(`Sadece ilk ${remaining} fotoğraf eklendi (maks. ${MAX_PHOTOS}).`, 'error');
  }

  let done = 0;
  toProcess.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      showToast(`"${file.name}" 10 MB sınırını aşıyor, atlandı.`, 'error');
      done++;
      if (done === toProcess.length) renderGalleryGrid();
      return;
    }
    compressToBase64(file, 900, 0.65, compressed => {
      galleryItems.push({ tip: 'fotograf', src: compressed });
      done++;
      if (done === toProcess.length) {
        renderGalleryGrid();
        showToast(`${done} fotoğraf galeriye eklendi.`, 'success');
      }
    });
  });
}

/* ── Video alanı ekle ── */
function addVideoField() {
  galleryItems.push({ tip: 'video', src: '' });
  renderGalleryGrid();
  setTimeout(() => {
    const inputs = document.querySelectorAll('.video-url-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 50);
}

/* ── Galeri öğesi kaldır ── */
function removeGalleryItem(idx) {
  galleryItems.splice(idx, 1);
  renderGalleryGrid();
}

/* ── Video URL güncelle ── */
function updateVideoSrc(idx, val) {
  if (galleryItems[idx]) galleryItems[idx].src = val.trim();
}

/* ── YouTube thumbnail URL'si ── */
function getVideoThumb(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`;
  return null;
}

/* ── YouTube/Vimeo embed URL'si ── */
function getVideoEmbed(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}?autoplay=1`;
  return url;
}

/* ── HTML escape ── */
function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Video thumbnail güncelle (kullanıcı URL yazarken) ── */
function updateVideoThumb(input, idx) {
  updateVideoSrc(idx, input.value);
  const row = input.closest('.video-link-row');
  if (!row) return;
  const thumbEl = row.querySelector('.video-link-thumb');
  const thumb = getVideoThumb(input.value.trim());
  if (!thumbEl) return;
  if (thumb) {
    thumbEl.innerHTML = `<img src="${thumb}" alt="" />`;
    thumbEl.className = 'video-link-thumb';
  } else {
    thumbEl.innerHTML = `<i class="fa-brands fa-youtube"></i>`;
    thumbEl.className = 'video-link-thumb video-link-thumb-empty';
  }
}

/* ── Galeri grid'i yeniden çiz ── */
function renderGalleryGrid() {
  const grid          = document.getElementById('galleryGrid');
  const videoContainer = document.getElementById('videoLinksContainer');
  if (!grid || !videoContainer) return;

  const photos = galleryItems.map((g, i) => ({ ...g, _idx: i })).filter(g => g.tip === 'fotograf');
  const videos = galleryItems.map((g, i) => ({ ...g, _idx: i })).filter(g => g.tip === 'video');

  /* Fotoğraflar */
  if (photos.length === 0) {
    grid.innerHTML = `<div class="gallery-empty-hint">
      <i class="fa-regular fa-images"></i><span>Henüz ek fotoğraf eklenmedi</span>
    </div>`;
  } else {
    grid.innerHTML = photos.map((item, localI) => `
      <div class="gallery-thumb-item">
        <img src="${item.src}" alt="Galeri ${localI + 1}" loading="lazy" />
        <button type="button" class="gallery-thumb-remove"
          onclick="removeGalleryItem(${item._idx})" title="Kaldır">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="gallery-thumb-num">${localI + 1}</div>
      </div>`).join('');
  }

  /* Videolar */
  if (videos.length === 0) {
    videoContainer.innerHTML = `<div class="gallery-empty-hint">
      <i class="fa-solid fa-video-slash"></i><span>Henüz video eklenmedi</span>
    </div>`;
  } else {
    videoContainer.innerHTML = videos.map(item => {
      const thumb = getVideoThumb(item.src);
      return `<div class="video-link-row">
        <div class="video-link-thumb${thumb ? '' : ' video-link-thumb-empty'}">
          ${thumb ? `<img src="${thumb}" alt="" />` : '<i class="fa-brands fa-youtube"></i>'}
        </div>
        <div class="video-link-inputs">
          <input class="admin-input video-url-input" type="url"
            placeholder="https://www.youtube.com/watch?v=... veya https://vimeo.com/..."
            value="${escHtml(item.src)}"
            oninput="updateVideoThumb(this, ${item._idx})"
            style="font-size:0.8rem;" />
          <div class="video-link-hint">
            <i class="fa-brands fa-youtube" style="color:#FF0000;"></i> YouTube &nbsp;·&nbsp;
            <i class="fa-brands fa-vimeo" style="color:#1AB7EA;"></i> Vimeo
            &nbsp;— tam sayfa URL'si yapıştırın
          </div>
        </div>
        <button type="button" class="video-del-btn"
          onclick="removeGalleryItem(${item._idx})" title="Videoyu kaldır">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>`;
    }).join('');
  }
}

/* ════════════════════════════════════════════════
   ANA KAPAK FOTOĞRAFI — yükle, önizle, kaldır
   ════════════════════════════════════════════════ */

/* ─── Image: dosyadan yükle → Canvas ile sıkıştır → base64 ─── */
function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  if (file.size > 8 * 1024 * 1024) {
    showToast('Resim 8 MB\'dan küçük olmalıdır.', 'error');
    input.value = '';
    return;
  }

  compressToBase64(file, 1200, 0.78, compressed => {
    const kb = Math.round(compressed.length * 0.75 / 1024);
    showToast(`Kapak resmi yüklendi (${kb} KB)`, 'success');
    document.getElementById('fResimUrl').value = compressed;
    showImagePreview(compressed);
  });
}

/* ─── Önizleme göster ─── */
function showImagePreview(src) {
  const zone    = document.getElementById('imgUploadZone');
  const wrap    = document.getElementById('imgPreviewWrap');
  const preview = document.getElementById('imgPreviewEl');
  if (!wrap || !preview) return;
  preview.src        = src;
  wrap.style.display = 'block';
  if (zone) zone.style.display = 'none';
}

/* ─── Önizlemeyi temizle ─── */
function clearImagePreview() {
  const zone    = document.getElementById('imgUploadZone');
  const wrap    = document.getElementById('imgPreviewWrap');
  const preview = document.getElementById('imgPreviewEl');
  const fileInp = document.getElementById('fResimFile');
  if (wrap)    wrap.style.display    = 'none';
  if (zone)    zone.style.display    = 'flex';
  if (preview) preview.src           = '';
  if (fileInp) fileInp.value         = '';
  document.getElementById('fResimUrl').value = '';
}

/* ─── Resmi kaldır butonu ─── */
function removeImage() {
  clearImagePreview();
}

/* ─── Eski URL'den önizleme (editlerde eski resimler için) ─── */
function previewImage(src) {
  if (!src) { clearImagePreview(); return; }
  showImagePreview(src);
}

/* ─── Delete flow ─── */
let pendingDeleteId = null;

function confirmDelete(id) {
  pendingDeleteId = id;
  document.getElementById('deleteModal').classList.add('open');
  document.getElementById('confirmDeleteBtn').onclick = () => deleteIlan(id);
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  pendingDeleteId = null;
}

function deleteIlan(id) {
  const ilanlar = getIlanlar().filter(i => i.id !== id);
  saveIlanlar(ilanlar);
  closeDeleteModal();
  showToast('İlan silindi.', 'success');
  renderTable();
  refreshDashboard();
}

document.getElementById('deleteModal').addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

/* ─── Yardımcı: telefon numarasını WhatsApp uluslararası formatına çevir ─── */
function toWaNum(tel) {
  const d = (tel || '').replace(/[^0-9]/g, '');   // sadece rakamlar
  if (!d) return '';
  if (d.startsWith('90') && d.length >= 11) return d;   // zaten 90xxx
  if (d.startsWith('0')  && d.length >= 10) return '90' + d.slice(1); // 0xxx → 90xxx
  if (d.startsWith('5')  && d.length === 10) return '90' + d;          // 5xxx → 905xxx
  return d; // bilinmeyen format, olduğu gibi gönder
}

/* ─── Teklifler ─── */
function updateTeklifBadge() {
  const yeni  = getTeklifler().filter(t => t.durum === 'yeni').length;
  const badge = document.getElementById('teklifBadge');
  if (!badge) return;
  badge.textContent   = yeni;
  badge.style.display = yeni > 0 ? 'inline-flex' : 'none';
}

function renderTeklifler() {
  const filter    = document.getElementById('teklifDurumFilter')?.value || 'all';
  const all       = getTeklifler();
  const teklifler = filter === 'all' ? all : all.filter(t => t.durum === filter);
  const content   = document.getElementById('tekliflerContent');
  const empty     = document.getElementById('tekliflerEmpty');
  if (!content) return;

  if (!teklifler.length) {
    content.innerHTML   = '';
    empty.style.display = 'block';
    updateTeklifBadge();
    return;
  }
  empty.style.display = 'none';
  content.innerHTML   = `<div class="teklifler-list">${teklifler.map(buildTeklifRow).join('')}</div>`;
  updateTeklifBadge();
}

function buildTeklifRow(t) {
  const isYeni = t.durum === 'yeni';
  const durumLabel = isYeni ? 'Yeni' : 'Görüldü';
  const durumCls   = isYeni ? 'tk-durum-yeni' : 'tk-durum-goruldu';

  const fark = (t.ilanFiyat && t.teklif) ? t.teklif - t.ilanFiyat : null;
  const farkHtml = fark !== null
    ? `<div class="tk-fark" style="color:${fark >= 0 ? '#32C864' : '#FF6464'};">
         ${fark >= 0 ? '+' : ''}${formatFiyat(fark)}
       </div>`
    : '';

  const tarih = new Date(t.tarih).toLocaleString('tr-TR', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  const waNum   = toWaNum(t.tel);
  const initial = (t.ad || '?').charAt(0).toUpperCase();

  return `
    <div class="teklif-card${isYeni ? ' is-new' : ''}">

      <!-- Üst: durum + ilan + tarih + sil -->
      <div class="tk-head">
        <div class="tk-head-left">
          <span class="tk-durum ${durumCls}">${durumLabel}</span>
          <span class="tk-ilan-title" title="${t.ilanBaslik}">${t.ilanBaslik}</span>
          ${t.konum ? `<span class="tk-ilan-sub">· ${t.konum}</span>` : ''}
        </div>
        <div class="tk-head-right">
          <span class="tk-tarih">${tarih}</span>
          <button class="tk-sil-btn" onclick="deleteTeklif('${t.id}')" title="Teklifi Sil">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Orta: kişi + teklif fiyatı -->
      <div class="tk-body">
        <div class="tk-kisi">
          <div class="tk-avatar">${initial}</div>
          <div>
            <div class="tk-kisi-ad">${t.ad}</div>
            <div class="tk-kisi-tel">
              <a href="tel:${t.tel}">${t.tel}</a>
              ${waNum ? `<a class="tk-wa-btn" href="https://wa.me/${waNum}" target="_blank" title="WhatsApp'ta Yaz">
                <i class="fa-brands fa-whatsapp"></i>
              </a>` : ''}
            </div>
          </div>
        </div>
        <div class="tk-fiyat-wrap">
          <div class="tk-teklif-val">${formatFiyat(t.teklif)}</div>
          ${farkHtml}
          ${t.ilanFiyat ? `<div class="tk-istenenfiyat">İstenen: ${formatFiyat(t.ilanFiyat)}</div>` : ''}
        </div>
      </div>

      <!-- Mesaj -->
      ${t.mesaj ? `<div class="tk-mesaj">
        <i class="fa-solid fa-quote-left tk-mesaj-icon"></i>${t.mesaj}
      </div>` : ''}

      <!-- Alt: görüldü / etiket -->
      <div class="tk-actions">
        ${isYeni
          ? `<button class="tk-goruldu-btn" onclick="markTeklif('${t.id}','goruldu')">
               <i class="fa-regular fa-eye"></i> Görüldü Olarak İşaretle
             </button>`
          : `<span class="tk-goruldu-label">
               <i class="fa-solid fa-eye"></i> Görüldü
             </span>`
        }
      </div>

    </div>`;
}

function markTeklif(id, durum) {
  const teklifler = getTeklifler();
  const idx = teklifler.findIndex(t => t.id === id);
  if (idx >= 0) { teklifler[idx].durum = durum; saveTeklifler(teklifler); }
  renderTeklifler();
}

function deleteTeklif(id) {
  if (!confirm('Bu teklifi silmek istediğinizden emin misiniz?')) return;
  saveTeklifler(getTeklifler().filter(t => t.id !== id));
  renderTeklifler();
  showToast('Teklif silindi.', 'success');
}

function clearTeklifler() {
  if (!confirm('Tüm teklifler silinecek. Emin misiniz?')) return;
  saveTeklifler([]);
  renderTeklifler();
  showToast('Tüm teklifler temizlendi.', 'success');
}

/* ─── Talepler ─── */
function updateTalepBadge() {
  const yeni  = getTalepler().filter(t => t.durum === 'yeni').length;
  const badge = document.getElementById('talepBadge');
  if (!badge) return;
  badge.textContent   = yeni;
  badge.style.display = yeni > 0 ? 'inline-flex' : 'none';
}

function renderTalepler() {
  const filter   = document.getElementById('talepDurumFilter')?.value || 'all';
  const all      = getTalepler();
  const talepler = filter === 'all' ? all : all.filter(t => t.durum === filter);
  const content  = document.getElementById('taleplerContent');
  const empty    = document.getElementById('taleplerEmpty');
  if (!content) return;

  if (!talepler.length) {
    content.innerHTML   = '';
    empty.style.display = 'block';
    updateTalepBadge();
    return;
  }
  empty.style.display = 'none';
  content.innerHTML   = `<div class="teklifler-list">${talepler.map(buildTalepCard).join('')}</div>`;
  updateTalepBadge();
}

function buildTalepCard(t) {
  const isYeni   = t.durum === 'yeni';
  const durumCls = isYeni ? 'tk-durum-yeni' : 'tk-durum-goruldu';
  const tarih    = new Date(t.tarih).toLocaleString('tr-TR', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
  const initial = (t.ad || '?').charAt(0).toUpperCase();
  const waNum   = toWaNum(t.tel);

  const odaLabels = { '1':'1+1', '2':'2+1', '3':'3+1', '4':'4+1', '5':'5+' };

  const chips = [];
  if (t.ilce)                       chips.push(['📍', t.ilce]);
  if (t.tur   && t.tur  !== 'all')  chips.push(['🏠', t.tur === 'konut' ? 'Konut' : 'İş Yeri']);
  if (t.tip   && t.tip  !== 'all')  chips.push(['🏡', capitalize(t.tip)]);
  if (t.oda   && t.oda  !== 'all')  chips.push(['🛏', (odaLabels[t.oda] || t.oda) + ' Oda']);
  if (t.alan)                        chips.push(['📏', t.alan + ' m²']);
  if (t.butce)                       chips.push(['💰', Number(t.butce).toLocaleString('tr-TR') + ' ₺']);

  const chipHtml = chips.map(([icon, label]) =>
    `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(201,164,85,0.08);border:1px solid rgba(201,164,85,0.2);border-radius:20px;padding:4px 12px;font-size:0.76rem;color:var(--light-gray);">${icon} ${label}</span>`
  ).join('');

  return `
    <div class="teklif-card${isYeni ? ' is-new' : ''}">

      <!-- Üst: durum + başlık + tarih + sil -->
      <div class="tk-head">
        <div class="tk-head-left">
          <span class="tk-durum ${durumCls}">${isYeni ? 'Yeni' : 'Görüldü'}</span>
          <span class="tk-ilan-title">Mülk Arama Talebi</span>
        </div>
        <div class="tk-head-right">
          <span class="tk-tarih">${tarih}</span>
          <button class="tk-sil-btn" onclick="deleteTalep('${t.id}')" title="Talebi Sil">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Orta: kişi + kriterler -->
      <div class="tk-body" style="flex-wrap:wrap;gap:16px;">
        <div class="tk-kisi">
          <div class="tk-avatar">${initial}</div>
          <div>
            <div class="tk-kisi-ad">${t.ad}</div>
            <div class="tk-kisi-tel">
              <a href="tel:${t.tel}">${t.tel}</a>
              ${waNum ? `<a class="tk-wa-btn" href="https://wa.me/${waNum}" target="_blank" title="WhatsApp'ta Yaz">
                <i class="fa-brands fa-whatsapp"></i>
              </a>` : ''}
            </div>
          </div>
        </div>
        ${chipHtml ? `<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">${chipHtml}</div>` : ''}
      </div>

      <!-- Alt: görüldü -->
      <div class="tk-actions">
        ${isYeni
          ? `<button class="tk-goruldu-btn" onclick="markTalep('${t.id}','goruldu')">
               <i class="fa-regular fa-eye"></i> Görüldü Olarak İşaretle
             </button>`
          : `<span class="tk-goruldu-label">
               <i class="fa-solid fa-eye"></i> Görüldü
             </span>`
        }
      </div>

    </div>`;
}

function markTalep(id, durum) {
  const talepler = getTalepler();
  const idx = talepler.findIndex(t => t.id === id);
  if (idx >= 0) { talepler[idx].durum = durum; saveTalepler(talepler); }
  renderTalepler();
}

function deleteTalep(id) {
  if (!confirm('Bu talebi silmek istediğinizden emin misiniz?')) return;
  saveTalepler(getTalepler().filter(t => t.id !== id));
  renderTalepler();
  showToast('Talep silindi.', 'success');
}

function clearTalepler() {
  if (!confirm('Tüm talepler silinecek. Emin misiniz?')) return;
  saveTalepler([]);
  renderTalepler();
  showToast('Tüm talepler temizlendi.', 'success');
}

/* ─── Settings ─── */
function loadSettings() {
  const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  set('settWa',         s.whatsapp    || '');
  set('settPhone',      s.telefon     || '');
  set('settEmail',      s.email       || '');
  set('settAdres',      s.adres       || '');
  set('settSahibinden', s.sahibindenUrl || '');
}

function saveSettings() {
  const s = {
    whatsapp:      document.getElementById('settWa').value.trim(),
    telefon:       document.getElementById('settPhone').value.trim(),
    email:         document.getElementById('settEmail').value.trim(),
    adres:         document.getElementById('settAdres').value.trim(),
    sahibindenUrl: document.getElementById('settSahibinden').value.trim()
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  showToast('Ayarlar kaydedildi!', 'success');
}

function changePass() {
  const np  = document.getElementById('newPass').value;
  const npc = document.getElementById('newPassConfirm').value;
  if (!np) { showToast('Yeni şifre boş olamaz.', 'error'); return; }
  if (np !== npc) { showToast('Şifreler eşleşmiyor!', 'error'); return; }
  if (np.length < 6) { showToast('Şifre en az 6 karakter olmalı.', 'error'); return; }
  localStorage.setItem(ADMIN_PASS_KEY, np);
  document.getElementById('newPass').value = '';
  document.getElementById('newPassConfirm').value = '';
  showToast('Şifre başarıyla güncellendi!', 'success');
}
