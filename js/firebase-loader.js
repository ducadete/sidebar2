// js/firebase-loader.js
export async function loadFirebase() {
  if (window.firebase) return window.firebase;
  await Promise.all([
    import(chrome.runtime.getURL("vendor/firebase-app-compat.js")),
    import(chrome.runtime.getURL("vendor/firebase-firestore-compat.js"))
  ]);
  return window.firebase;
}
