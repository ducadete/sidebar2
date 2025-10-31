// js/firebase-loader.js
import { loadScript } from "./asset-loader.js";

const FIREBASE_CDN_BASE = "https://www.gstatic.com/firebasejs/10.12.4/";
const FIREBASE_COMPAT_SCRIPTS = [
  "firebase-app-compat.js",
  "firebase-firestore-compat.js"
];

async function loadFromLocalVendor() {
  try {
    await loadScript("vendor/firebase-app-compat.js");
    await loadScript("vendor/firebase-firestore-compat.js");
  } catch (error) {
    // Fall back to CDN if local assets are missing or failed to load.
  }
}

async function loadFromCDN() {
  for (const script of FIREBASE_COMPAT_SCRIPTS) {
    await loadScript(`${FIREBASE_CDN_BASE}${script}`);
  }
}

export async function loadFirebase() {
  if (window.firebase) return window.firebase;

  await loadFromLocalVendor();

  if (!window.firebase) {
    await loadFromCDN();
  }

  if (!window.firebase) {
    throw new Error("Firebase SDK não carregado");
  }

  return window.firebase;
}
