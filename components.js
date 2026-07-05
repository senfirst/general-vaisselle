// ============================================================
// SEN VAISSELLE — Composants partagés (navbar / footer / WhatsApp flottant)
// window.SV_BASE doit être défini AVANT ce script : chemin relatif vers la racine
// window.SV_PAGE (optionnel) : identifiant de la page active pour le menu
// ============================================================
import { buildWhatsAppGenericLink } from "./utils.js";

const BASE = window.SV_BASE ?? "";
const ACTIVE = window.SV_PAGE ?? "";

function navLink(href, label, key) {
  const cls = ACTIVE === key ? "sv-nav-link active" : "sv-nav-link";
  return `<li class="nav-item"><a class="${cls}" href="${href}">${label}</a></li>`;
}

function renderNavbar() {
  const html = `
  <div class="announce-bar">
    Livraison &amp; retrait à Dakar · <strong>Commandez directement sur WhatsApp</strong>, sans compte ni panier
  </div>
  <nav class="navbar navbar-expand-lg sv-navbar py-2">
    <div class="container-xl">
      <a class="navbar-brand" href="${BASE}index.html">
        <span class="plate-mark"></span> Sen Vaisselle
      </a>
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#svNavMenu" aria-label="Ouvrir le menu">
        <i class="fa-solid fa-bars fa-lg" style="color:var(--navy)"></i>
      </button>
      <div class="collapse navbar-collapse" id="svNavMenu">
        <ul class="navbar-nav mx-auto gap-1 py-2 py-lg-0">
          ${navLink(BASE + "index.html", "Accueil", "accueil")}
          ${navLink(BASE + "pages/boutique.html", "Boutique", "boutique")}
          ${navLink(BASE + "pages/categories.html", "Catégories", "categories")}
          ${navLink(BASE + "pages/promotions.html", "Promotions", "promotions")}
          ${navLink(BASE + "pages/nouveautes.html", "Nouveautés", "nouveautes")}
          ${navLink(BASE + "pages/apropos.html", "À propos", "apropos")}
          ${navLink(BASE + "pages/contact.html", "Contact", "contact")}
        </ul>
        <div class="d-flex align-items-center gap-2">
          <a href="${BASE}pages/boutique.html" class="sv-search-btn" aria-label="Rechercher un produit" title="Rechercher">
            <i class="fa-solid fa-magnifying-glass"></i>
          </a>
          <a href="${BASE}admin/login.html" class="sv-icon-btn" aria-label="Espace administrateur" title="Espace administrateur">
            <i class="fa-solid fa-user-shield"></i>
          </a>
        </div>
      </div>
    </div>
  </nav>`;
  const mount = document.getElementById("sv-navbar");
  if (mount) mount.innerHTML = html;
}

function renderFooter() {
  const html = `
  <footer class="sv-footer">
    <div class="container-xl">
      <div class="row g-4">
        <div class="col-lg-4 col-md-6">
          <h5><span class="plate-mark" style="display:inline-block;vertical-align:middle;margin-right:8px;"></span>Sen Vaisselle</h5>
          <p class="small mb-3">Vaisselle, ustensiles de cuisine et articles ménagers sélectionnés pour votre table et votre foyer, à Dakar et partout au Sénégal.</p>
          <div class="d-flex gap-2">
            <a href="#" class="sv-icon-btn" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#fff" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" class="sv-icon-btn" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#fff" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="${buildWhatsAppGenericLink()}" target="_blank" rel="noopener" class="sv-icon-btn" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#fff" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-md-6">
          <h5>Boutique</h5>
          <ul class="list-unstyled small d-flex flex-column gap-2">
            <li><a href="${BASE}pages/boutique.html">Tous les produits</a></li>
            <li><a href="${BASE}pages/promotions.html">Promotions</a></li>
            <li><a href="${BASE}pages/nouveautes.html">Nouveautés</a></li>
            <li><a href="${BASE}pages/categories.html">Catégories</a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-6">
          <h5>Informations</h5>
          <ul class="list-unstyled small d-flex flex-column gap-2">
            <li><a href="${BASE}pages/apropos.html">À propos</a></li>
            <li><a href="${BASE}pages/contact.html">Contact</a></li>
            <li><a href="${BASE}admin/login.html">Espace administrateur</a></li>
          </ul>
        </div>
        <div class="col-lg-4 col-md-6">
          <h5>Contact</h5>
          <ul class="list-unstyled small d-flex flex-column gap-2">
            <li><i class="fa-solid fa-location-dot me-2"></i>Dakar, Sénégal</li>
            <li><i class="fa-brands fa-whatsapp me-2"></i>+221 78 862 61 80</li>
            <li><i class="fa-solid fa-envelope me-2"></i>admin@senvaisselle.com</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom d-flex flex-wrap justify-content-between gap-2">
        <span>&copy; <span id="sv-year"></span> Sen Vaisselle. Tous droits réservés.</span>
        <span>Fait avec soin à Dakar 🇸🇳</span>
      </div>
    </div>
  </footer>`;
  const mount = document.getElementById("sv-footer");
  if (mount) mount.innerHTML = html;
  const y = document.getElementById("sv-year");
  if (y) y.textContent = new Date().getFullYear();
}

function renderWhatsAppFloat() {
  const mount = document.getElementById("sv-wa-float");
  if (!mount) return;
  mount.innerHTML = `
    <a class="wa-float" href="${buildWhatsAppGenericLink()}" target="_blank" rel="noopener" aria-label="Discuter sur WhatsApp">
      <i class="fa-brands fa-whatsapp"></i>
    </a>`;
}

renderNavbar();
renderFooter();
renderWhatsAppFloat();

if (window.AOS) window.AOS.init({ duration: 700, once: true, offset: 60 });
