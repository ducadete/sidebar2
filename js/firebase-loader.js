// js/firebase-loader.js
import { loadScript } from "./asset-loader.js";

export async function loadFirebase() {
  if (window.firebase) return window.firebase;

  await loadScript("vendor/firebase-app-compat.js");
  await loadScript("vendor/firebase-firestore-compat.js");

  if (!window.firebase) {
    throw new Error("Firebase SDK não carregado");
  }

  return window.firebase;
}
