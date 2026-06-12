/* ========================================
   AVA Gayrimenkul — Shared JS (main.js)
   Listing storage, card builder, utilities
   ======================================== */

const STORAGE_KEY   = 'ava_emlak_ilanlar';
const SETTINGS_KEY  = 'ava_settings';
const TEKLIFLER_KEY = 'ava_teklifler';
const TALEPLER_KEY  = 'ava_talepler';

/* ─── Get / Save talepler ─── */
function getTalepler() {
  try { return JSON.parse(localStorage.getItem(TALEPLER_KEY)) || []; }
  catch { return []; }
}
function saveTalepler(talepler) {
  try { localStorage.setItem(TALEPLER_KEY, JSON.stringify(talepler)); return true; }
  catch { showToast('Talep kaydedilemedi.', 'error'); return false; }
}

/* ─── Get / Save teklifler ─── */
function getTeklifler() {
  try { return JSON.parse(localStorage.getItem(TEKLIFLER_KEY)) || []; }
  catch { return []; }
}
function saveTeklifler(teklifler) {
  try {
    localStorage.setItem(TEKLIFLER_KEY, JSON.stringify(teklifler));
    return true;
  } catch (e) {
    showToast('Teklif kaydedilemedi.', 'error');
    return false;
  }
}

/* ─── Sample data seeded on first visit ─── */
const SAMPLE_ILANLAR = [
  {
    id: 'sample-1',
    baslik: 'Beşiktaş\'ta Satılık Lüks 3+1 Daire',
    tip: 'daire', islem: 'satilik',
    fiyat: 12500000, metrekare: 165, oda: '3+1',
    konum: 'İstanbul, Beşiktaş', mahalle: 'Levent Mah.',
    aciklama: 'Boğaz manzaralı, ultra lüks rezidans içinde yer alan özel tasarım daire. Akıllı ev sistemleri, yerden ısıtma ve premium malzemeler ile donatılmıştır.',
    resimUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ozellikler: ['Asansör','Otopark','Balkon','Güvenlik','Ebeveyn Banyosu','Akıllı Ev','Şehir Manzarası','Klima'],
    sahibindenLink: 'https://www.sahibinden.com',
    tarih: '2025-05-10', durum: 'aktif'
  },
  {
    id: 'sample-2',
    baslik: 'Bodrum\'da Denize Sıfır Özel Villa',
    tip: 'villa', islem: 'satilik',
    fiyat: 45000000, metrekare: 420, oda: '5+2',
    konum: 'Muğla, Bodrum', mahalle: 'Yalıkavak',
    aciklama: 'Denize doğrudan erişimi olan, özel havuzlu, peyzajlı bahçesiyle eşsiz bir villa. Mimarisi ile bölgenin en prestijli mülkleri arasında yer almaktadır.',
    resimUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    ozellikler: ['Havuz','Bahçe','Deniz Manzarası','Teras','Güvenlik','Otopark','Ebeveyn Banyosu'],
    sahibindenLink: 'https://www.sahibinden.com',
    tarih: '2025-05-08', durum: 'aktif'
  },
  {
    id: 'sample-3',
    baslik: 'Kadıköy\'de Kiralık Lüks Ofis Katı',
    tip: 'ofis', islem: 'kiralik',
    fiyat: 85000, metrekare: 280, oda: '',
    konum: 'İstanbul, Kadıköy', mahalle: 'Moda',
    aciklama: 'Prestijli iş merkezinde, tam donanımlı kiralık ofis katı. 24/7 güvenlik, valet, toplantı odaları ve panoramik şehir manzarası.',
    resimUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ozellikler: ['Asansör','Otopark','Güvenlik','Klima','Şehir Manzarası'],
    sahibindenLink: '',
    tarih: '2025-05-06', durum: 'aktif'
  },
  {
    id: 'sample-4',
    baslik: 'Sarıyer\'de Satılık İmarlı Arsa',
    tip: 'arsa', islem: 'satilik',
    fiyat: 8750000, metrekare: 650, oda: '',
    konum: 'İstanbul, Sarıyer', mahalle: 'Zekeriyaköy',
    aciklama: 'Boğaz\'a yakın konumda, konut imarlı değerli arsa. Altyapı hazır, tapu teslimi hızlı.',
    resimUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    ozellikler: [],
    sahibindenLink: '',
    tarih: '2025-05-04', durum: 'aktif'
  },
  {
    id: 'sample-5',
    baslik: 'Nişantaşı\'nda Kiralık 2+1 Residence',
    tip: 'daire', islem: 'kiralik',
    fiyat: 42000, metrekare: 110, oda: '2+1',
    konum: 'İstanbul, Şişli', mahalle: 'Nişantaşı',
    aciklama: 'Nişantaşı\'nın kalbinde, tam eşyalı, üst kat, güneş gören, yürüyüş mesafesinde her şey mevcut.',
    resimUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
    ozellikler: ['Asansör','Balkon','Güvenlik','Klima','Ebeveyn Banyosu','Amerikan Mutfak'],
    sahibindenLink: '',
    tarih: '2025-05-02', durum: 'aktif'
  },
  {
    id: 'sample-6',
    baslik: 'Bebek\'te Satılık Butik Apartman Katı',
    tip: 'daire', islem: 'satilik',
    fiyat: 22000000, metrekare: 220, oda: '4+1',
    konum: 'İstanbul, Beşiktaş', mahalle: 'Bebek',
    aciklama: 'Bebek koyunun hemen üzerinde, boğaz manzaralı butik apartman katı. Özel tasarım iç mekan, yüksek tavan yüksekliği.',
    resimUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ozellikler: ['Asansör','Otopark','Deniz Manzarası','Ebeveyn Banyosu','Teras'],
    sahibindenLink: 'https://www.sahibinden.com',
    tarih: '2025-04-28', durum: 'aktif'
  }
];

/* ─── Init: seed sample data if first visit ─── */
function initSampleData() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ILANLAR));
  }
}

/* ─── Get all listings ─── */
function getIlanlar() {
  initSampleData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

/* ─── Save all listings ─── */
function saveIlanlar(ilanlar) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ilanlar));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      showToast('Depolama alanı doldu! Eski ilanları silin veya daha küçük resim kullanın.', 'error');
    } else {
      showToast('İlan kaydedilemedi: ' + e.message, 'error');
    }
    return false;
  }
}

/* ─── Format price ─── */
function formatFiyat(fiyat) {
  if (!fiyat && fiyat !== 0) return 'Fiyat Sorunuz';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY',
    maximumFractionDigits: 0
  }).format(fiyat);
}

/* ─── Capitalize ─── */
function capitalize(str) {
  if (!str) return '';
  const map = { daire:'Daire', villa:'Villa', arsa:'Arsa', dukkan:'Dükkan',
                ofis:'Ofis', bina:'Bina', depo:'Depo', tarla:'Tarla' };
  return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─── Generate unique ID ─── */
function generateId() {
  return 'ilan-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

/* ─── Build Property Card HTML ─── */
function buildCard(ilan, showDetail = false) {
  const fiyatLabel  = ilan.islem === 'kiralik' ? '/ aylık' : '';
  const fiyatText   = formatFiyat(ilan.fiyat);
  const detailUrl   = `detay.html?id=${ilan.id}`;

  const imgContent = ilan.resimUrl
    ? `<img src="${ilan.resimUrl}" alt="${ilan.baslik}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
       <div style="display:none;width:100%;height:100%;background:var(--dark-3);align-items:center;justify-content:center;color:var(--gray);font-size:3rem;">
         <i class='fa-solid fa-image'></i>
       </div>`
    : `<div style="width:100%;height:100%;background:var(--dark-3);display:flex;align-items:center;justify-content:center;color:var(--gray);font-size:3rem;">
         <i class='fa-solid fa-image'></i>
       </div>`;

  const imageWrap = showDetail
    ? `<a href="${detailUrl}" class="card-img-link">${imgContent}</a>`
    : `<div class="card-img-wrap">${imgContent}</div>`;

  return `
    <div class="property-card">
      <div class="card-image">
        ${imageWrap}
        <div class="card-badges">
          <span class="badge badge-${ilan.islem}">${ilan.islem === 'satilik' ? 'Satılık' : 'Kiralık'}</span>
          <span class="badge badge-tip">${capitalize(ilan.tip)}</span>
        </div>
        <div class="card-price-overlay">
          <div class="card-price">${fiyatText}</div>
          <div class="card-price-label">${fiyatLabel || '&#8203;'}</div>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${ilan.baslik}</h3>
        <div class="card-location">
          <i class="fa-solid fa-location-dot"></i>
          ${ilan.mahalle ? ilan.mahalle + ', ' : ''}${ilan.konum}
        </div>
        <div class="card-features">
          ${ilan.metrekare ? `
            <div class="card-feature">
              <i class="fa-solid fa-ruler-combined"></i>
              <strong>${ilan.metrekare}</strong>
              <span>m²</span>
            </div>` : ''}
          ${ilan.oda ? `
            <div class="card-feature">
              <i class="fa-solid fa-door-open"></i>
              <strong>${ilan.oda}</strong>
              <span>Oda</span>
            </div>` : ''}
          ${ilan.ozellikler && ilan.ozellikler.length ? `
            <div class="card-feature">
              <i class="fa-solid fa-star"></i>
              <strong>${ilan.ozellikler.length}</strong>
              <span>Özellik</span>
            </div>` : ''}
        </div>
        <div class="card-actions">
          ${showDetail
            ? `<a class="btn btn-gold" href="${detailUrl}">
                 <i class="fa-solid fa-expand"></i> Detay
               </a>`
            : ''}
          <a class="btn btn-outline"
             href="https://wa.me/905454480868?text=Merhaba%2C%20${encodeURIComponent(ilan.baslik)}%20ilan%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
             target="_blank">
            <i class="fa-brands fa-whatsapp"></i> Sor
          </a>
          ${ilan.sahibindenLink
            ? `<a class="btn btn-dark" href="${ilan.sahibindenLink}" target="_blank">
                 <i class="fa-solid fa-external-link"></i>
               </a>`
            : ''}
        </div>
      </div>
    </div>`;
}

/* ─── Toast notification ─── */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) { alert(message); return; }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-xmark'}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = 'all 0.4s'; setTimeout(() => toast.remove(), 400); }, 3500);
}

/* ─── Load featured listings on homepage ─── */
(function loadFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  initSampleData();
  const all      = getIlanlar().filter(i => i.durum !== 'pasif');
  const featured = all.slice(0, 6);
  grid.innerHTML = featured.length
    ? featured.map(i => buildCard(i, true)).join('')
    : `<div class="no-listings"><i class="fa-solid fa-house-circle-exclamation"></i><h3>Henüz ilan eklenmemiş</h3><p>Admin panelinden ilan ekleyin.</p></div>`;
})();

/* ─── Kredi: Noktalı girişi sayıya çevir ─── */
function parseKrediTutar(val) {
  if (!val && val !== 0) return 0;
  // Türk binlik ayıracı olan noktaları sil, virgülü ondalık noktasına çevir
  return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
}

/* ─── Kredi: Fiyat alanını binlik noktalı formatla ─── */
function formatKrediInput(el) {
  const raw = el.value.replace(/[^\d]/g, ''); // Yalnızca rakamları tut
  if (!raw) { el.value = ''; return; }
  // Türkçe binlik ayıracı (nokta) ekle
  el.value = Number(raw).toLocaleString('tr-TR');
}

/* ─── Kredi Hesaplayıcısı ─── */
function hesaplaKredi() {
  const fiyatEl   = document.getElementById('kcFiyat');
  const pesinatEl = document.getElementById('kcPesinat');
  const vadeEl    = document.getElementById('kcVade');
  const faizEl    = document.getElementById('kcFaiz');
  if (!fiyatEl) return;

  const fiyat   = parseKrediTutar(fiyatEl.value);
  const pesinat = parseFloat(pesinatEl.value)  || 20;
  const n       = parseInt(vadeEl.value)       || 120;
  const yFaiz   = parseFloat(faizEl.value)     || 32;

  if (fiyat <= 0) { showToast('Lütfen geçerli bir mülk fiyatı girin.', 'error'); return; }

  const P = fiyat * (1 - pesinat / 100);   // kredi tutarı
  const r = (yFaiz / 100) / 12;            // aylık faiz
  let   M;
  if (r === 0) {
    M = P / n;
  } else {
    M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
  const toplam       = M * n;
  const faizToplam   = toplam - P;
  const pesinatTutar = fiyat * (pesinat / 100);

  document.getElementById('krediAylik').textContent        = formatFiyat(Math.round(M));
  document.getElementById('krediTutar').textContent        = formatFiyat(Math.round(P));
  document.getElementById('krediToplam').textContent       = formatFiyat(Math.round(toplam));
  document.getElementById('krediFaizToplam').textContent   = formatFiyat(Math.round(faizToplam));
  document.getElementById('krediPesinatTutar').textContent = formatFiyat(Math.round(pesinatTutar));

  const placeholder = document.getElementById('krediPlaceholder');
  const results     = document.getElementById('krediResults');
  if (placeholder) placeholder.style.display = 'none';
  if (results)     results.style.display     = 'block';
}

/* ─── Gold Cursor Efekti ─── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100;   // mouse position
  let rx = -100, ry = -100;   // ring position (lagged)
  let hovering = false, clicking = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
  });

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a, button, [role="button"], input, select, textarea, label, .property-card, .filter-btn, .kredi-field');
    hovering = !!t;
    dot.classList.toggle('is-hovered',  hovering);
    ring.classList.toggle('is-hovered', hovering);
  });

  document.addEventListener('mousedown', () => {
    clicking = true;
    dot.classList.add('is-clicking');
    ring.classList.add('is-clicking');
  });
  document.addEventListener('mouseup', () => {
    clicking = false;
    dot.classList.remove('is-clicking');
    ring.classList.remove('is-clicking');
  });

  // Smooth ring via RAF
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
    requestAnimationFrame(loop);
  })();
})();
