/**
 * main.js — Comportements globaux du site (hors logique produits/Firestore)
 */

const BASE = window.SITE_BASE ?? "";

/* Injecte le bouton WhatsApp flottant sur toutes les pages */
function injectWhatsappFloat() {
  if (document.querySelector(".whatsapp-float")) return;
  const a = document.createElement("a");
  a.href = `https://wa.me/${window.WHATSAPP_NUMBER || "221788626180"}?text=${encodeURIComponent("Bonjour Sen Vaisselle, j'ai une question 🙂")}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "whatsapp-float";
  a.setAttribute("aria-label", "Contacter Sen Vaisselle sur WhatsApp");
  a.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.3-.7-2.2-1.2-3.1-2.7-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.4-.1-.1-.5-1.2-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5-.1.5-.2 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z"/></svg>`;
  document.body.appendChild(a);
}

/* Comportement du header : appelé après l'injection du partial (voir include.js) */
window.initHeaderBehavior = function () {
  const header = document.getElementById("site-header");
  const burger = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileOverlay");
  const searchForm = document.getElementById("headerSearchForm");
  const searchInput = document.getElementById("headerSearchInput");

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  });

  function toggleMenu(open) {
    mobileMenu?.classList.toggle("open", open);
    overlay?.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger?.addEventListener("click", () => toggleMenu(!mobileMenu.classList.contains("open")));
  overlay?.addEventListener("click", () => toggleMenu(false));
  mobileMenu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    window.location.href = `${BASE}pages/boutique.html?q=${encodeURIComponent(q)}`;
  });
};

/* Animation "reveal" au scroll (IntersectionObserver) */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => obs.observe(el));
}

/* Accordéon FAQ */
function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    q?.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((i) => i !== item && i.classList.remove("open"));
      item.classList.toggle("open", !isOpen);
    });
  });
}

/* Newsletter (démo — à connecter à Firestore si souhaité) */
function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("input[type=email]").value;
    if (!email) return;
    const btn = form.querySelector("button");
    const original = btn.textContent;
    btn.textContent = "Merci ! ✓";
    form.reset();
    setTimeout(() => (btn.textContent = original), 2500);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  injectWhatsappFloat();
  initFaq();
  initNewsletter();
  setTimeout(initScrollReveal, 200); // laisse le temps aux produits Firestore de s'insérer
});
