/**
 * include.js
 * Charge dynamiquement les partials (header/footer) dans chaque page
 * et corrige automatiquement les liens en fonction de la profondeur
 * du dossier courant (racine, /pages/, /admin/), afin que le site
 * fonctionne aussi bien en local que sur GitHub Pages (sous-dossier).
 *
 * Chaque page doit définir avant ce script :
 *   <script>window.SITE_BASE = "";</script>       (pour index.html à la racine)
 *   <script>window.SITE_BASE = "../";</script>     (pour /pages/*.html et /admin/*.html)
 */

(function () {
  const BASE = window.SITE_BASE ?? "";

  function fixLinks(container) {
    container.querySelectorAll("[href^='/']").forEach((el) => {
      const href = el.getAttribute("href").replace(/^\//, "");
      el.setAttribute("href", BASE + href);
    });
    container.querySelectorAll("[src^='/']").forEach((el) => {
      const src = el.getAttribute("src").replace(/^\//, "");
      el.setAttribute("src", BASE + src);
    });
  }

  function highlightActiveLink() {
    const current = window.SITE_PAGE || "";
    document.querySelectorAll(".nav-menu a, .mobile-menu a").forEach((a) => {
      if (a.dataset.link === current) a.classList.add("active");
    });
  }

  async function loadPartial(id, path) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(BASE + path);
      const html = await res.text();
      el.innerHTML = html;
      fixLinks(el);
    } catch (err) {
      console.error("Erreur de chargement du partial:", path, err);
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
      loadPartial("site-header", "partials/header.html"),
      loadPartial("site-footer", "partials/footer.html"),
    ]);

    highlightActiveLink();

    const yearEl = document.getElementById("footerYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Réinitialise les comportements du header (menu mobile, recherche, scroll)
    if (window.initHeaderBehavior) window.initHeaderBehavior();
  });
})();
