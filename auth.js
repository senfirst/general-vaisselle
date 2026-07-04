// ============================================================
// SEN VAISSELLE — Authentification Administrateur (Firebase Auth)
// ============================================================
import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { toast } from "./utils.js";

const BASE = window.SV_BASE ?? "";

export function loginAdmin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutAdmin() {
  return signOut(auth).then(() => {
    window.location.href = BASE + "login.html";
  });
}

/**
 * Protège une page admin : redirige vers la connexion si non authentifié.
 * Appelle callback(user) une fois la session confirmée.
 */
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      callback(user);
    }
  });
}

/** Sur la page de connexion : si déjà connecté, redirige vers le tableau de bord */
export function redirectIfAuthenticated() {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
  });
}

function friendlyAuthError(code) {
  const map = {
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/user-not-found": "Aucun compte administrateur trouvé avec cet e-mail.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
    "auth/network-request-failed": "Problème de connexion réseau."
  };
  return map[code] || "Connexion impossible. Vérifiez vos identifiants.";
}

export { friendlyAuthError, toast };
