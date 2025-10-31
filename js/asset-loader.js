// js/asset-loader.js
const pendingLoads = new Map();

function resolveAssetURL(path) {
  if (typeof chrome !== "undefined" && chrome?.runtime?.getURL) {
    try {
      return chrome.runtime.getURL(path);
    } catch (err) {
      // Ignore and fall back to the raw path when getURL is unavailable.
    }
  }
  return path;
}

export function loadScript(path) {
  const url = resolveAssetURL(path);
  if (pendingLoads.has(url)) {
    return pendingLoads.get(url);
  }

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = false;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error(`Falha ao carregar script: ${url}`)),
      { once: true }
    );
    document.head.appendChild(script);
  });

  pendingLoads.set(url, promise);
  return promise;
}
