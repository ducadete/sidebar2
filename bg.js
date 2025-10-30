// Abre a UI completa em uma ABA ao clicar no ícone
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("app.html") });
});
