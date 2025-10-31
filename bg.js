// Abre a UI completa em uma aba ou painel lateral, dependendo do suporte do navegador.
chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel?.open && tab?.windowId !== undefined) {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "app.html"
    });
    await chrome.sidePanel.open({ windowId: tab.windowId });
    return;
  }

  chrome.tabs.create({ url: chrome.runtime.getURL("app.html") });
});
