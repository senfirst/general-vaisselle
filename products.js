// ============================================================
// SEN VAISSELLE — Catalogue produits (lecture publique Firestore)
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, getDocs, query, where, orderBy, limit as fbLimit
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  formatPrice, computeDiscount, buildWhatsAppLink, escapeText, sanitize, debounce
} from "./utils.js";
import { getCategorySync } from "./categories.js";

const PRODUCTS_COL = "products";

/** Récupère tous les produits disponibles, avec tri optionnel */
export async function fetchProducts({ categoryId, featured, promo, isNew, max } = {}) {
  try {
    const col = collection(db, PRODUCTS_COL);
    const clauses = [];
    if (categoryId) clauses.push(where("categoryId", "==", categoryId));
    if (featured) clauses.push(where("featured", "==", true));
    if (promo) clauses.push(where("promo", "==", true));
    if (isNew) clauses.push(where("isNew", "==", true));
    clauses.push(orderBy("createdAt", "desc"));
    if (max) clauses.push(fbLimit(max));
    const q = query(col, ...clauses);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Erreur de chargement des produits :", err);
    return null; // null = erreur (ex: config Firebase manquante) ; [] = simplement vide
  }
}

export function productImage(product) {
  if (product.images && product.images.length) {
    const main = product.images.find(i => i.isMain) || product.images[0];
    return main.url;
  }
  return "https://images.unsplash.com/photo-1578898887932-dce23a595ad4?q=80&w=600&auto=format&fit=crop";
}

export function categoryName(categoryId) {
  if (!categoryId) return "Non classé";
  return getCategorySync(categoryId).name;
}

/** Rend une carte produit (HTML) */
export function renderProductCard(p) {
  const discount = p.discount || computeDiscount(p.price, p.oldPrice);
  const badges = [];
  if (p.isNew) badges.push('<span class="pc-badge new">Nouveau</span>');
  if (p.promo && discount > 0) badges.push(`<span class="pc-badge promo">-${discount}%</span>`);
  if (p.featured) badges.push('<span class="pc-badge featured">Vedette</span>');
  if (p.availability === false || p.stock === 0) badges.push('<span class="pc-badge out">Rupture</span>');

  return `
  <div class="col-6 col-md-4 col-lg-3" data-aos="fade-up">
    <div class="product-card">
      <a href="${window.SV_BASE ?? ""}pages/produit.html?id=${p.id}" class="pc-media">
        <div class="pc-badges">${badges.join("")}</div>
        <img src="${productImage(p)}" alt="${escapeText(p.name)}" loading="lazy">
      </a>
      <div class="pc-body">
        <span class="pc-cat">${escapeText(categoryName(p.categoryId))}</span>
        <a href="${window.SV_BASE ?? ""}pages/produit.html?id=${p.id}"><h3 class="pc-title">${escapeText(p.name)}</h3></a>
        ${p.color ? `<span class="pc-swatch" style="background:${escapeText(p.color)}"></span><span class="small text-muted">${escapeText(p.color)}</span>` : ""}
        <div class="pc-price-row">
          <span class="pc-price">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="pc-price-old">${formatPrice(p.oldPrice)}</span>` : ""}
        </div>
        <a class="btn-whatsapp mt-auto" target="_blank" rel="noopener" href="${buildWhatsAppLink(p)}">
          <i class="fa-brands fa-whatsapp"></i> Commander sur WhatsApp
        </a>
        <div class="pc-ref">Réf. ${escapeText(p.reference || "")}</div>
      </div>
    </div>
  </div>`;
}

export function renderSkeletonCards(count = 8) {
  return Array.from({ length: count }).map(() => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card">
        <div class="pc-media skel"></div>
        <div class="pc-body">
          <div class="skel mb-2" style="height:10px;width:40%;border-radius:6px;"></div>
          <div class="skel mb-2" style="height:16px;width:80%;border-radius:6px;"></div>
          <div class="skel mb-3" style="height:14px;width:50%;border-radius:6px;"></div>
          <div class="skel" style="height:38px;border-radius:999px;"></div>
        </div>
      </div>
    </div>`).join("");
}

export function renderEmptyState(message = "Aucun produit trouvé pour le moment.") {
  return `
    <div class="col-12 text-center py-5">
      <i class="fa-solid fa-box-open fa-2x mb-3" style="color:var(--navy)"></i>
      <p class="text-muted mb-0">${escapeText(message)}</p>
    </div>`;
}

export function renderErrorState() {
  return `
    <div class="col-12 text-center py-5">
      <i class="fa-solid fa-triangle-exclamation fa-2x mb-3" style="color:var(--orange)"></i>
      <p class="text-muted mb-1">Impossible de charger les produits.</p>
      <p class="small text-muted">Vérifiez que la configuration Firebase (js/firebase-config.js) a bien été renseignée.</p>
    </div>`;
}

/** Attache une recherche instantanée sur un input, filtrant une liste de produits déjà chargée */
export function attachInstantSearch(inputEl, allProducts, onFilter) {
  const run = debounce((term) => {
    const t = term.trim().toLowerCase();
    if (!t) return onFilter(allProducts);
    const filtered = allProducts.filter(p =>
      (p.name || "").toLowerCase().includes(t) ||
      (p.reference || "").toLowerCase().includes(t) ||
      categoryName(p.categoryId).toLowerCase().includes(t) ||
      String(p.price || "").includes(t)
    );
    onFilter(filtered);
  }, 220);
  inputEl.addEventListener("input", (e) => run(e.target.value));
}

export { sanitize };
