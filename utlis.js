// ============================================================
// SEN VAISSELLE — Fonctions utilitaires partagées
// ============================================================
import { SHOP } from "./firebase-config.js";

/** Formate un prix en francs CFA : 12500 -> "12 500 FCFA" */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ") + " FCFA";
}

/** Calcule le pourcentage de réduction entre ancien et nouveau prix */
export function computeDiscount(price, oldPrice) {
  const p = Number(price), op = Number(oldPrice);
  if (!op || op <= p) return 0;
  return Math.round(((op - p) / op) * 100);
}

/** Génère une référence produit automatique, ex: SV-ASS-4821 */
export function generateReference(categoryName = "") {
  const prefix = (categoryName || "GEN")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3) || "GEN";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SV-${prefix}-${rand}`;
}

/** Nettoie une chaîne saisie par l'admin avant tout rendu HTML (anti-XSS) */
export function sanitize(html) {
  if (window.DOMPurify) return window.DOMPurify.sanitize(html);
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

/** Échappe le texte brut pour usage dans un attribut / texte simple */
export function escapeText(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/** Construit le lien WhatsApp pré-rempli pour commander un produit */
export function buildWhatsAppLink(product) {
  const message =
    `Bonjour Sen Vaisselle,\n\n` +
    `Je souhaite commander le produit suivant :\n\n` +
    `Nom : ${product.name || ""}\n` +
    `Référence : ${product.reference || ""}\n` +
    `Prix : ${formatPrice(product.price)}\n\n` +
    `Merci de me confirmer sa disponibilité.`;
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Lien WhatsApp générique (sans produit précis), pour le bouton flottant / contact */
export function buildWhatsAppGenericLink(customMessage) {
  const message = customMessage || "Bonjour Sen Vaisselle, j'ai une question concernant vos produits.";
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Toast succès/erreur via Toastify.js, avec repli sur alert() */
export function toast(message, type = "success") {
  const bg = { success: "#1FA855", error: "#E4483C", info: "#0A3D91" }[type] || "#0A3D91";
  if (window.Toastify) {
    window.Toastify({
      text: message,
      duration: 3200,
      gravity: "top",
      position: "right",
      style: { background: bg, borderRadius: "10px", fontFamily: "'Plus Jakarta Sans',sans-serif" }
    }).showToast();
  } else {
    alert(message);
  }
}

/** Confirmation via SweetAlert2, avec repli sur confirm() */
export async function confirmAction(title, text, confirmText = "Confirmer") {
  if (window.Swal) {
    const res = await window.Swal.fire({
      title, text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0A3D91",
      cancelButtonColor: "#E4483C",
      confirmButtonText: confirmText,
      cancelButtonText: "Annuler"
    });
    return res.isConfirmed;
  }
  return confirm(`${title}\n${text}`);
}

/** debounce simple pour la recherche instantanée */
export function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/** Liste fixe des catégories du site (utilisée pour init Firestore + menus) */
export const CATEGORIES = [
  { id: "assiettes", name: "Assiettes", icon: "fa-solid fa-plate-wheat" },
  { id: "verres", name: "Verres", icon: "fa-solid fa-martini-glass" },
  { id: "tasses", name: "Tasses", icon: "fa-solid fa-mug-hot" },
  { id: "bols", name: "Bols", icon: "fa-solid fa-bowl-rice" },
  { id: "couverts", name: "Couverts", icon: "fa-solid fa-utensils" },
  { id: "marmites", name: "Marmites", icon: "fa-solid fa-fire-burner" },
  { id: "poeles", name: "Poêles", icon: "fa-solid fa-drumstick-bite" },
  { id: "casseroles", name: "Casseroles", icon: "fa-solid fa-kitchen-set" },
  { id: "plateaux", name: "Plateaux", icon: "fa-solid fa-square" },
  { id: "theieres", name: "Théières", icon: "fa-solid fa-mug-saucer" },
  { id: "cafetieres", name: "Cafetières", icon: "fa-solid fa-coffee" },
  { id: "bouteilles", name: "Bouteilles", icon: "fa-solid fa-bottle-water" },
  { id: "gourdes", name: "Gourdes", icon: "fa-solid fa-flask" },
  { id: "boites-conservation", name: "Boîtes de conservation", icon: "fa-solid fa-box" },
  { id: "ustensiles-cuisine", name: "Ustensiles de cuisine", icon: "fa-solid fa-blender" },
  { id: "accessoires-cuisine", name: "Accessoires de cuisine", icon: "fa-solid fa-spoon" },
  { id: "articles-menagers", name: "Articles ménagers", icon: "fa-solid fa-broom" },
  { id: "decoration-table", name: "Décoration de table", icon: "fa-solid fa-champagne-glasses" }
];

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
