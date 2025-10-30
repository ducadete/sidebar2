# Protocolos USF Vila Dutra — Sanfona (MV3)

Este pacote está pronto para carregar em `chrome://extensions` (Modo desenvolvedor).

## Passo obrigatório (libs em `vendor/`)
Baixe estes arquivos e coloque na pasta `vendor/`:

### PowerShell (Windows)
```
New-Item -ItemType Directory -Force -Path vendor | Out-Null
Invoke-WebRequest "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js" -OutFile "vendor/firebase-app-compat.js"
Invoke-WebRequest "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js" -OutFile "vendor/firebase-firestore-compat.js"
Invoke-WebRequest "https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.6.2/fuse.min.js" -OutFile "vendor/fuse.min.js"
```

### Bash (macOS/Linux)
```
mkdir -p vendor
curl -L "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js" -o vendor/firebase-app-compat.js
curl -L "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js" -o vendor/firebase-firestore-compat.js
curl -L "https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.6.2/fuse.min.js" -o vendor/fuse.min.js
```

## Como usar
1. `chrome://extensions` → ativar **Modo do desenvolvedor**.
2. **Carregar sem compactação** → a pasta `protocolos-accordion`.
3. Clique no ícone da extensão → ela abrirá a UI em **aba** com **sanfona**.
