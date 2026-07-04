// ============================================================
// SEN VAISSELLE — Configuration Firebase
// ------------------------------------------------------------
// ⚠️ IMPORTANT : remplacez les valeurs ci-dessous par celles de
// VOTRE projet Firebase (Console Firebase > Paramètres du projet
// > Vos applications > Configuration SDK).
// Ce fichier est public (GitHub Pages) : c'est normal, la clé API
// Firebase Web n'est pas un secret. La sécurité réelle est assurée
// par les règles Firestore / Storage (voir /firebase/*.rules).
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "REMPLACER_API_KEY",
  authDomain: "REMPLACER.firebaseapp.com",
  projectId: "REMPLACER_PROJECT_ID",
  storageBucket: "REMPLACER.appspot.com",
  messagingSenderId: "REMPLACER_SENDER_ID",
  appId: "REMPLACER_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence).catch(() => {
  /* silencieux : la persistance retombe sur celle par défaut */
});

// Coordonnées de la boutique, réutilisées dans plusieurs pages
export const SHOP = {
  name: "Sen Vaisselle",
  whatsapp: "221788626180", // format international sans "+" ni espaces
  email: "admin@senvaisselle.com",
  address: "Dakar, Sénégal",
  facebook: "#",
  instagram: "#"
};
