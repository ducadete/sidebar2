// Ouve o clique no ícone da extensão na barra de ferramentas
chrome.action.onClicked.addListener((tab) => {
  // Abre o painel lateral na aba atual
  chrome.sidePanel.open({ windowId: tab.windowId });
});