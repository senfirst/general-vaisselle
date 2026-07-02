/**
 * products.js
 * Gère la récupération des catégories/produits depuis Firebase Firestore
 * et leur affichage sur les différentes pages de la boutique.
 *
 * MODE DÉMO : tant que js/firebase-config.js contient une configuration
 * placeholder, ce fichier bascule automatiquement sur des données de
 * démonstration (DEMO_CATEGORIES / DEMO_PRODUCTS) afin que le site reste
 * pleinement fonctionnel à l'aperçu. Dès qu'un vrai projet Firebase est
 * connecté et alimenté via le tableau de bord admin, les vraies données
 * prennent automatiquement le relais — aucune autre modification requise.
 */

const BASE_P = window.SITE_BASE ?? "";

/* ---------------------------------------------------------------------
   ICONES PAR CATEGORIE (emoji — léger, sans dépendance externe)
--------------------------------------------------------------------- */
const CATEGORY_ICONS = {
  assiettes: "🍽️", verres: "🥂", tasses: "☕", bols: "🥣", couverts: "🍴",
  marmites: "🍲", poeles: "🍳", casseroles: "🥘", plateaux: "🧺", theieres: "🫖",
  cafetieres: "☕", bouteilles: "🍾", gourdes: "🚰", "boites-de-conservation": "📦",
  "ustensiles-de-cuisine": "🥄", "accessoires-de-cuisine": "🧂", "articles-menagers": "🧹",
  "decoration-de-table": "🕯️"
};

/* ---------------------------------------------------------------------
   DONNÉES DE DÉMONSTRATION (utilisées si Firestore est vide / non configuré)
--------------------------------------------------------------------- */
const DEMO_CATEGORIES = [
  "Assiettes","Verres","Tasses","Bols","Couverts","Marmites","Poêles","Casseroles",
  "Plateaux","Théières","Cafetières","Bouteilles","Gourdes","Boîtes de conservation",
  "Ustensiles de cuisine","Accessoires de cuisine","Articles ménagers","Décoration de table"
].map((nom, i) => ({
  id: "cat-" + i,
  nom,
  slug: slugify(nom),
  icone: CATEGORY_ICONS[slugify(nom)] || "🏺",
  ordre: i
}));

function demoImg(seed, n = 1) {
  return Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/senvaisselle${seed}${i}/700/700`);
}

const DEMO_PRODUCTS = [
  { nom: "Service d'assiettes en porcelaine (12 pièces)", reference: "SV-AS-001", categorie: "Assiettes", prix: 24500, ancienPrix: 32000, descriptionCourte: "Élégant service en porcelaine blanche, idéal pour toutes les occasions.", descriptionComplete: "Ce service de 12 pièces en porcelaine fine allie robustesse et raffinement. Parfait pour le quotidien comme pour recevoir. Compatible lave-vaisselle et micro-ondes.", matiere: "Porcelaine", dimensions: "27 cm (assiette plate)", couleur: "Blanc", disponible: true, stock: 14, images: demoImg("plates", 3), vedette: true, promotion: true, nouveau: false },
  { nom: "Set de 6 verres à eau gravés", reference: "SV-VR-002", categorie: "Verres", prix: 9000, descriptionCourte: "Verres en cristal gravé, finition brillante.", descriptionComplete: "Set de 6 verres à eau en verre soufflé, motif gravé à la main. Une touche d'élégance pour votre table.", matiere: "Verre", dimensions: "300 ml", couleur: "Transparent", disponible: true, stock: 22, images: demoImg("glasses", 2), vedette: true, promotion: false, nouveau: true },
  { nom: "Tasses à café en céramique (lot de 4)", reference: "SV-TA-003", categorie: "Tasses", prix: 7500, descriptionCourte: "Tasses artisanales aux couleurs pastel.", descriptionComplete: "Lot de 4 tasses en céramique émaillée, coloris pastel assortis. Anses ergonomiques, contenance 220 ml.", matiere: "Céramique", dimensions: "220 ml", couleur: "Pastel", disponible: true, stock: 30, images: demoImg("cups", 2), vedette: false, promotion: false, nouveau: true },
  { nom: "Marmite en inox 10L", reference: "SV-MA-004", categorie: "Marmites", prix: 32000, ancienPrix: 39000, descriptionCourte: "Marmite robuste pour grandes préparations.", descriptionComplete: "Marmite en acier inoxydable 18/10, fond épais pour une répartition homogène de la chaleur. Poignées renforcées.", matiere: "Inox", dimensions: "10 L / Ø 32 cm", couleur: "Argent", disponible: true, stock: 8, images: demoImg("pot", 3), vedette: true, promotion: true, nouveau: false },
  { nom: "Poêle antiadhésive 28 cm", reference: "SV-PO-005", categorie: "Poêles", prix: 15000, descriptionCourte: "Revêtement antiadhésif haute performance.", descriptionComplete: "Poêle en aluminium forgé avec revêtement céramique antiadhésif, compatible tous feux dont induction.", matiere: "Aluminium", dimensions: "28 cm", couleur: "Noir", disponible: true, stock: 17, images: demoImg("pan", 2), vedette: false, promotion: false, nouveau: false },
  { nom: "Casserole avec couvercle en verre", reference: "SV-CA-006", categorie: "Casseroles", prix: 13500, descriptionCourte: "Couvercle en verre trempé, visibilité totale.", descriptionComplete: "Casserole en inox avec couvercle en verre trempé permettant de surveiller la cuisson sans perdre la chaleur.", matiere: "Inox / Verre", dimensions: "20 cm / 3L", couleur: "Argent", disponible: false, stock: 0, images: demoImg("sauce", 2), vedette: false, promotion: false, nouveau: false },
  { nom: "Plateau de service en bois d'acacia", reference: "SV-PL-007", categorie: "Plateaux", prix: 11000, descriptionCourte: "Bois d'acacia massif, finition huilée.", descriptionComplete: "Plateau artisanal en bois d'acacia massif avec poignées intégrées, idéal pour le service ou la décoration.", matiere: "Bois d'acacia", dimensions: "45 x 30 cm", couleur: "Brun naturel", disponible: true, stock: 12, images: demoImg("tray", 2), vedette: false, promotion: false, nouveau: true },
  { nom: "Théière en fonte émaillée", reference: "SV-TH-008", categorie: "Théières", prix: 18500, descriptionCourte: "Théière traditionnelle à la sénégalaise revisitée.", descriptionComplete: "Théière en fonte émaillée à l'intérieur, avec filtre amovible en inox. Conserve la chaleur longtemps.", matiere: "Fonte émaillée", dimensions: "1 L", couleur: "Bordeaux", disponible: true, stock: 9, images: demoImg("teapot", 2), vedette: true, promotion: false, nouveau: false },
  { nom: "Cafetière italienne 6 tasses", reference: "SV-CF-009", categorie: "Cafetières", prix: 8500, descriptionCourte: "Cafetière moka en aluminium, format familial.", descriptionComplete: "Cafetière italienne traditionnelle en aluminium, pour un café corsé façon expresso maison.", matiere: "Aluminium", dimensions: "6 tasses", couleur: "Argent", disponible: true, stock: 20, images: demoImg("coffee", 2), vedette: false, promotion: false, nouveau: false },
  { nom: "Lot de 3 bouteilles isothermes", reference: "SV-BO-010", categorie: "Bouteilles", prix: 12500, ancienPrix: 16000, descriptionCourte: "Garde la fraîcheur 24h, le chaud 12h.", descriptionComplete: "Bouteilles isothermes double paroi en inox, coloris assortis. Idéales pour le sport ou le bureau.", matiere: "Inox", dimensions: "500 ml", couleur: "Multicolore", disponible: true, stock: 25, images: demoImg("bottle", 2), vedette: false, promotion: true, nouveau: false },
  { nom: "Gourde enfant motif animaux", reference: "SV-GO-011", categorie: "Gourdes", prix: 4500, descriptionCourte: "Gourde légère et ludique pour enfants.", descriptionComplete: "Gourde en plastique sans BPA, bec anti-fuite, motifs colorés pour les plus jeunes.", matiere: "Plastique sans BPA", dimensions: "350 ml", couleur: "Multicolore", disponible: true, stock: 40, images: demoImg("kidbottle", 2), vedette: false, promotion: false, nouveau: true },
  { nom: "Set de 5 boîtes de conservation hermétiques", reference: "SV-BC-012", categorie: "Boîtes de conservation", prix: 10500, descriptionCourte: "Hermétiques, empilables, sans BPA.", descriptionComplete: "Ensemble de 5 boîtes de tailles variées avec fermeture hermétique à clips, conservation optimale des aliments.", matiere: "Plastique sans BPA", dimensions: "Tailles variées", couleur: "Transparent", disponible: true, stock: 18, images: demoImg("boxes", 2), vedette: false, promotion: false, nouveau: false },
].map((p, i) => ({
  id: "prod-" + i,
  ...p,
  categorieSlug: slugify(p.categorie),
  dateAjout: new Date(Date.now() - i * 86400000).toISOString()
}));

/* ---------------------------------------------------------------------
   UTILITAIRES
--------------------------------------------------------------------- */
function slugify(str) {
  return str.toString().toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatPrice(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function isFirebaseConfigured() {
  try {
    return typeof firebaseConfig !== "undefined" && firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("VOTRE_");
  } catch (e) {
    return false;
  }
}

/* Construit le lien WhatsApp de commande pré-rempli pour un produit */
function buildWhatsappOrderLink(product) {
  const msg =
`Bonjour Sen Vaisselle,

Je souhaite commander le produit suivant :

Nom : ${product.nom}
Référence : ${product.reference}
Prix : ${formatPrice(product.prix)}

Pouvez-vous me confirmer sa disponibilité ?

Merci.`;
  const number = (window.WHATSAPP_NUMBER || "221788626180");
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/* ---------------------------------------------------------------------
   ACCES DONNEES (Firestore avec repli sur données de démo)
--------------------------------------------------------------------- */
async function getCategories() {
  if (isFirebaseConfigured()) {
    try {
      const snap = await db.collection(COLLECTIONS.CATEGORIES).orderBy("ordre").get();
      if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("Firestore indisponible, utilisation des données de démo (catégories).", err);
    }
  }
  return DEMO_CATEGORIES;
}

async function getProducts() {
  if (isFirebaseConfigured()) {
    try {
      const snap = await db.collection(COLLECTIONS.PRODUCTS).orderBy("dateAjout", "desc").get();
      if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("Firestore indisponible, utilisation des données de démo (produits).", err);
    }
  }
  return DEMO_PRODUCTS;
}

async function getProductById(id) {
  const all = await getProducts();
  return all.find((p) => p.id === id) || null;
}

/* ---------------------------------------------------------------------
   RENDU HTML
--------------------------------------------------------------------- */
function renderProductCard(p) {
  const img = (p.images && p.images[0]) || "https://picsum.photos/seed/senvaisselle/700/700";
  const tags = [];
  if (p.nouveau) tags.push('<span class="tag tag-new">Nouveau</span>');
  if (p.promotion && p.ancienPrix) tags.push('<span class="tag tag-promo">Promo</span>');
  if (p.disponible === false) tags.push('<span class="tag tag-out">Rupture</span>');

  return `
  <a href="${BASE_P}pages/produit.html?id=${p.id}" class="product-card reveal">
    <div class="product-thumb">
      <img src="${img}" alt="${escapeHtml(p.nom)}" loading="lazy">
      <div class="product-tags">${tags.join("")}</div>
    </div>
    <div class="product-body">
      <span class="product-cat">${escapeHtml(p.categorie || "")}</span>
      <h3 class="product-name">${escapeHtml(p.nom)}</h3>
      <div class="product-price-row">
        <span class="price-now">${formatPrice(p.prix)}</span>
        ${p.ancienPrix ? `<span class="price-old">${formatPrice(p.ancienPrix)}</span>` : ""}
      </div>
      <span class="product-cta">Voir le produit</span>
    </div>
  </a>`;
}

function renderCategoryCard(c) {
  return `
  <a href="${BASE_P}pages/boutique.html?cat=${c.slug}" class="cat-card reveal">
    <div class="cat-icon">${c.icone || "🏺"}</div>
    <div class="cat-name">${escapeHtml(c.nom)}</div>
  </a>`;
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function renderGrid(container, items, renderFn, emptyMsg) {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">${emptyMsg || "Aucun résultat trouvé."}</div>`;
    return;
  }
  container.innerHTML = items.map(renderFn).join("");
}

/* ---------------------------------------------------------------------
   PAGE : ACCUEIL
--------------------------------------------------------------------- */
async function initHomeSections() {
  const catContainer = document.getElementById("homeCategories");
  const featContainer = document.getElementById("homeFeatured");
  const newContainer = document.getElementById("homeNew");
  const promoContainer = document.getElementById("homePromo");

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  if (catContainer) renderGrid(catContainer, categories.slice(0, 12), renderCategoryCard);
  if (featContainer) renderGrid(featContainer, products.filter((p) => p.vedette).slice(0, 8), renderProductCard, "Aucun produit vedette pour le moment.");
  if (newContainer) renderGrid(newContainer, products.filter((p) => p.nouveau).slice(0, 8), renderProductCard, "Aucune nouveauté pour le moment.");
  if (promoContainer) renderGrid(promoContainer, products.filter((p) => p.promotion).slice(0, 8), renderProductCard, "Aucune promotion active pour le moment.");

  setTimeout(initScrollRevealSafe, 100);
}

/* ---------------------------------------------------------------------
   PAGE : BOUTIQUE (avec filtres + recherche)
--------------------------------------------------------------------- */
async function initShopPage() {
  const grid = document.getElementById("shopGrid");
  const catFilterBox = document.getElementById("catFilterBox");
  const searchInput = document.getElementById("shopSearchInput");
  const sortSelect = document.getElementById("shopSort");
  const resultsCount = document.getElementById("resultsCount");
  const priceRange = document.getElementById("priceRange");
  const priceRangeLabel = document.getElementById("priceRangeLabel");

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const params = new URLSearchParams(window.location.search);

  let state = {
    q: params.get("q") || "",
    cat: params.get("cat") || "",
    maxPrice: Math.max(...products.map((p) => p.prix), 50000),
    sort: "recent"
  };

  if (priceRange) {
    priceRange.max = Math.max(...products.map((p) => p.prix), 10000);
    priceRange.value = state.maxPrice;
    priceRangeLabel.textContent = formatPrice(state.maxPrice);
  }
  if (searchInput) searchInput.value = state.q;

  if (catFilterBox) {
    catFilterBox.innerHTML = categories.map((c) => `
      <label>
        <input type="radio" name="catFilter" value="${c.slug}" ${state.cat === c.slug ? "checked" : ""}>
        ${c.icone || ""} ${escapeHtml(c.nom)}
      </label>`).join("") +
      `<label><input type="radio" name="catFilter" value="" ${!state.cat ? "checked" : ""}> Toutes les catégories</label>`;
  }

  function apply() {
    let list = products.filter((p) => {
      const matchQ = !state.q || (p.nom + " " + (p.categorie || "")).toLowerCase().includes(state.q.toLowerCase());
      const matchCat = !state.cat || p.categorieSlug === state.cat;
      const matchPrice = p.prix <= state.maxPrice;
      return matchQ && matchCat && matchPrice;
    });

    if (state.sort === "price-asc") list.sort((a, b) => a.prix - b.prix);
    else if (state.sort === "price-desc") list.sort((a, b) => b.prix - a.prix);
    else if (state.sort === "name") list.sort((a, b) => a.nom.localeCompare(b.nom));
    else list.sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout));

    renderGrid(grid, list, renderProductCard, "Aucun produit ne correspond à votre recherche.");
    if (resultsCount) resultsCount.textContent = `${list.length} article${list.length > 1 ? "s" : ""} trouvé${list.length > 1 ? "s" : ""}`;
    setTimeout(initScrollRevealSafe, 60);
  }

  searchInput?.addEventListener("input", (e) => { state.q = e.target.value; apply(); });
  sortSelect?.addEventListener("change", (e) => { state.sort = e.target.value; apply(); });
  priceRange?.addEventListener("input", (e) => {
    state.maxPrice = Number(e.target.value);
    priceRangeLabel.textContent = formatPrice(state.maxPrice);
    apply();
  });
  catFilterBox?.addEventListener("change", (e) => {
    if (e.target.name === "catFilter") { state.cat = e.target.value; apply(); }
  });

  apply();
}

/* ---------------------------------------------------------------------
   PAGE : CATEGORIES (liste complète)
--------------------------------------------------------------------- */
async function initCategoriesPage() {
  const container = document.getElementById("allCategories");
  const categories = await getCategories();
  const products = await getProducts();
  if (!container) return;
  container.innerHTML = categories.map((c) => {
    const count = products.filter((p) => p.categorieSlug === c.slug).length;
    return `
    <a href="${BASE_P}pages/boutique.html?cat=${c.slug}" class="cat-card reveal">
      <div class="cat-icon">${c.icone || "🏺"}</div>
      <div class="cat-name">${escapeHtml(c.nom)}</div>
      <div style="font-size:11.5px;color:var(--ink-soft);margin-top:6px;">${count} article${count > 1 ? "s" : ""}</div>
    </a>`;
  }).join("");
  setTimeout(initScrollRevealSafe, 60);
}

/* ---------------------------------------------------------------------
   PAGE : DETAIL PRODUIT
--------------------------------------------------------------------- */
async function initProductDetail() {
  const wrap = document.getElementById("productDetailWrap");
  if (!wrap) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = id ? await getProductById(id) : null;

  if (!product) {
    wrap.innerHTML = `<div class="empty-state">Produit introuvable. <a href="${BASE_P}pages/boutique.html" style="color:var(--navy);font-weight:700;">Retour à la boutique</a></div>`;
    return;
  }

  document.title = `${product.nom} — Sen Vaisselle`;
  const images = product.images && product.images.length ? product.images : ["https://picsum.photos/seed/senvaisselle/700/700"];

  wrap.innerHTML = `
    <div class="product-detail">
      <div>
        <div class="pd-gallery-main"><img id="pdMainImg" src="${images[0]}" alt="${escapeHtml(product.nom)}"></div>
        <div class="pd-thumbs">
          ${images.map((img, i) => `<img src="${img}" class="${i === 0 ? "active" : ""}" data-img="${img}" alt="Aperçu ${i + 1}">`).join("")}
        </div>
      </div>
      <div class="pd-info">
        <span class="product-cat">${escapeHtml(product.categorie || "")}</span>
        <h1>${escapeHtml(product.nom)}</h1>
        <div class="pd-ref">Référence : ${escapeHtml(product.reference || "—")}</div>
        <div class="pd-avail ${product.disponible !== false ? "in" : "out"}">
          <span class="dot"></span> ${product.disponible !== false ? "En stock" : "Rupture de stock"}
        </div>
        <div class="pd-price">
          <span class="now">${formatPrice(product.prix)}</span>
          ${product.ancienPrix ? `<span class="old">${formatPrice(product.ancienPrix)}</span>` : ""}
        </div>
        <p class="pd-desc">${escapeHtml(product.descriptionComplete || product.descriptionCourte || "")}</p>
        <table class="pd-specs">
          ${product.matiere ? `<tr><td>Matière</td><td>${escapeHtml(product.matiere)}</td></tr>` : ""}
          ${product.dimensions ? `<tr><td>Dimensions</td><td>${escapeHtml(product.dimensions)}</td></tr>` : ""}
          ${product.couleur ? `<tr><td>Couleur</td><td>${escapeHtml(product.couleur)}</td></tr>` : ""}
          <tr><td>Stock disponible</td><td>${product.stock ?? "—"} unité(s)</td></tr>
        </table>
        <a class="btn btn-whatsapp" href="${buildWhatsappOrderLink(product)}" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20z"/></svg>
          Commander sur WhatsApp
        </a>
      </div>
    </div>`;

  document.querySelectorAll(".pd-thumbs img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.getElementById("pdMainImg").src = thumb.dataset.img;
      document.querySelectorAll(".pd-thumbs img").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // Produits similaires
  const relatedContainer = document.getElementById("relatedProducts");
  if (relatedContainer) {
    const all = await getProducts();
    const related = all.filter((p) => p.categorieSlug === product.categorieSlug && p.id !== product.id).slice(0, 4);
    renderGrid(relatedContainer, related, renderProductCard, "");
  }
  setTimeout(initScrollRevealSafe, 60);
}

function initScrollRevealSafe() {
  if (typeof initScrollReveal === "function") {
    document.querySelectorAll(".reveal:not(.in)").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), i * 40);
    });
  }
}

/* Auto-init selon les conteneurs présents sur la page */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("homeFeatured")) initHomeSections();
  if (document.getElementById("shopGrid")) initShopPage();
  if (document.getElementById("allCategories")) initCategoriesPage();
  if (document.getElementById("productDetailWrap")) initProductDetail();
});
