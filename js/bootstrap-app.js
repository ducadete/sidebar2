// js/bootstrap-app.js
import { loadFirebase } from "./firebase-loader.js";
import { setupApp } from "./app.js";

const firebase = await loadFirebase();

await setupApp({
  firebase,
  dom: {
    q: document.querySelector("#q"),
    chips: document.querySelector("#chips"),
    state: document.querySelector("#state"),
    results: document.querySelector("#results"),
    empty: document.querySelector("#empty")
  },
  ui: { mode: "accordion" }
});
