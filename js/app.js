import { norm, makeKeywords, buildFuseQuery, highlight } from "./search.js";

export function setupApp({ firebase, dom, ui = { mode: "accordion" } }) {
  const { q, chips, state, results, empty } = dom;
  const Fuse = window.Fuse;
  if (!Fuse) {
    console.error("Fuse.js não encontrado. Coloque vendor/fuse.min.js e recarregue.");
  }

  let fuse = null;
  let allProtocols = [];
  let normalizedIndex = [];
  let lastQuery = "";
  let debounceTimer = null;

  const firebaseConfig = {
    apiKey: "AIzaSyBVoT23U4UfFqY9Q076q4g76K2NmcjS3jk",
    authDomain: "protocolos-b2a13.firebaseapp.com",
    projectId: "protocolos-b2a13",
    storageBucket: "protocolos-b2a13.firebasestorage.app",
    messagingSenderId: "999397114103",
    appId: "1:999397114103:web:fb94ab5e65184795f3d3f2",
    measurementId: "G-XEVSG8M6QZ"
  };

  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  (async function load() {
    try {
      state.classList.remove("hidden");
      state.textContent = "Carregando protocolos…";
      empty.classList.add("hidden");
      results.innerHTML = "";

      const snap = await db.collection("protocolos").get();
      if (snap.empty) {
        state.textContent = "Coleção 'protocolos' vazia.";
        return;
      }

      allProtocols = snap.docs.map(d => d.data());

      normalizedIndex = allProtocols.map(p => {
        const cidsRaw = (p.cids || "")
          .split(";").map(x=>x.trim().toUpperCase().replace(".",""))
          .filter(Boolean);

        return {
          ...p,
          nome: norm(p.nome),
          tema: norm(p.tema),
          resumo: norm(p.resumo),
          doencas: norm(p.doencas),
          fluxo: norm(p.fluxo),
          idades: norm(p.idades),
          keywords: makeKeywords(p),
          cidsRaw,
          hasAnexoStr: String(!!(p.anexos && p.anexos.trim()))
        };
      });

      fuse = new Fuse(normalizedIndex, {
        includeScore: true,
        useExtendedSearch: true,
        shouldSort: true,
        threshold: 0.3,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: "nome", weight: 0.35 },
          { name: "cidsRaw", weight: 0.28 },
          { name: "doencas", weight: 0.22 },
          { name: "tema", weight: 0.20 },
          { name: "resumo", weight: 0.15 },
          { name: "fluxo", weight: 0.10 },
          { name: "keywords", weight: 0.30 },
          { name: "hasAnexoStr", weight: 0.05 }
        ]
      });

      render(allProtocols.map(p => ({ item: p, score: 1 })));
      state.classList.add("hidden");
    } catch (e) {
      state.textContent = "Erro ao carregar: " + (e?.message || e);
      console.error(e);
    }
  })();

  function denormalize(nItem) {
    const idx = allProtocols.findIndex(p => norm(p.nome) === nItem.nome && norm(p.resumo||"") === nItem.resumo);
    return idx >= 0 ? allProtocols[idx] : nItem;
  }

  function onSearch() {
    if (!fuse) return;
    const raw = (q.value || "").trim();
    lastQuery = raw;

    let list = [];
    if (!raw) {
      list = allProtocols.map(p => ({ item: p, score: 1 }));
    } else {
      const extended = buildFuseQuery(raw);
      if (extended) {
        list = fuse.search(extended).map(r => ({ item: denormalize(r.item), score: r.score }));
      } else {
        list = fuse.search({ $path: "keywords", $val: norm(raw) })
                   .map(r => ({ item: denormalize(r.item), score: r.score }));
      }
    }
    render(list);
    renderChips(raw);
  }

  function render(list) {
    results.innerHTML = "";
    empty.classList.toggle("hidden", list.length > 0);
    list.sort((a,b)=>(a.score||1)-(b.score||1));

    list.forEach(r => {
      const p = r.item;

      const resumoTxt = p.resumo || "";
      const snippet = highlight(
        resumoTxt.substring(0, 180) + (resumoTxt.length > 180 ? "…" : ""),
        lastQuery
      );

      const cidsBadges = (p.cids || "")
        .split(";").map(x=>x.trim()).filter(Boolean).slice(0,6)
        .map(c=>`<span class="badge">\${c}</span>`).join(" ");

      const makeList = (text) => {
        if (!text) return "<li>Nenhum item.</li>";
        return text.split(";").map(s => s.trim()).filter(Boolean)
          .map(s => `<li>\${s}</li>`).join("");
      };

      let anexosHTML = "<p class='muted'>Nenhum anexo disponível.</p>";
      if (p.anexos && p.anexos.trim()) {
        const links = p.anexos.split(";").map(s=>s.trim()).filter(Boolean).map(s=>{
          const parts = s.split("|");
          if (parts.length === 2) {
            const [nome, url] = parts;
            return `<li><a href="\${url.trim()}" target="_blank" rel="noopener">\${nome.trim()}</a></li>`;
          }
          return "";
        }).filter(Boolean).join("");
        anexosHTML = `<ul>\${links}</ul>`;
      }

      const details = document.createElement("details");
      details.className = "ac";
      details.innerHTML = `
        <summary>
          <div style="flex:1 1 auto;min-width:0">
            <div class="ttl">\${highlight(p.nome || "Sem título", lastQuery)}</div>
            <div class="res">\${snippet}</div>
            <div class="badges">\${cidsBadges}</div>
          </div>
          \${p.anexos ? '<span class="badge">Anexos</span>' : ''}
        </summary>
        <div class="body">
          <div class="section">
            <h4>Resumo</h4>
            <p>\${p.resumo || "N/A"}</p>
          </div>
          <div class="section">
            <h4>Pontos Principais</h4>
            <ul>\${makeList(p.principais)}</ul>
          </div>
          <div class="section">
            <h4>Fluxo do Protocolo</h4>
            <ul>\${makeList(p.fluxo)}</ul>
          </div>
          <div class="section">
            <h4>Faixa Etária e Doenças/CIDs</h4>
            <p><b>Idades:</b> \${p.idades || "N/A"}</p>
            <p><b>Doenças/CIDs:</b> \${formatDoencasCIDs(p.doencas, p.cids)}</p>
          </div>
          <div class="section">
            <h4>Anexos</h4>
            \${anexosHTML}
          </div>
        </div>
      `;

      details.addEventListener("toggle", () => {
        if (details.open) {
          document.querySelectorAll(".ac[open]").forEach(el => {
            if (el !== details) el.removeAttribute("open");
          });
        }
      });

      results.appendChild(details);
    });
  }

  
  function formatDoencasCIDs(doencas, cids) {
    const d = (doencas || "").split(";").map(s=>s.trim());
    const c = (cids || "").split(";").map(s=>s.trim());
    const parts = [];
    const maxLen = Math.max(d.length, c.length);
    for (let i = 0; i < maxLen; i++) {
      const left = d[i] || "";
      const right = c[i] || "";
      if (left || right) {
        let piece = "";
        if (left) piece += "<b>" + left + "</b>";
        if (left && right) piece += " ";
        if (right) piece += "(" + right + ")";
        parts.push("<span>" + piece + "</span>");
      }
    }
    return parts.length ? parts.join(", ") : "N/A";
  }

  function renderChips(query) {
    const tokens = (query || "").toString().split(/\s+/).filter(Boolean);
    if (!tokens.length) { chips.classList.add("hidden"); chips.innerHTML=""; return; }

    const lastRaw = tokens[tokens.length - 1];
    const lastNorm = norm(lastRaw);
    if (!lastNorm) { chips.classList.add("hidden"); chips.innerHTML=""; return; }

    const colonIndex = lastNorm.indexOf(":");
    const prefix = colonIndex >= 0 ? lastNorm.slice(0, colonIndex) : "";
    const searchTerm = colonIndex >= 0 ? lastNorm.slice(colonIndex + 1) : lastNorm;

    const cidSet = new Set();
    const temaMap = new Map(); // normalized -> display
    const doencaSet = new Set();

    normalizedIndex.forEach(p => {
      (p.cidsRaw || []).forEach(c => cidSet.add(c));
      if (p.tema) {
        const temaNorm = norm(p.tema);
        if (!temaMap.has(temaNorm)) {
          temaMap.set(temaNorm, p.tema);
        }
      }
      (p.doencas || "")
        .split(";")
        .map(x => norm(x.trim()))
        .filter(Boolean)
        .forEach(d => doencaSet.add(d));
    });

    const chipData = [];

    if (!prefix || prefix === "cid") {
      const cidTerm = searchTerm.replace(/\./g, "");
      Array.from(cidSet)
        .filter(c => !cidTerm || norm(c).includes(cidTerm))
        .slice(0, 5)
        .forEach(c => chipData.push({ label: `CID \${c}`, value: `cid:\${c}` }));
    }

    if (!prefix || prefix === "tema") {
      Array.from(temaMap.entries())
        .filter(([temaNorm]) => !searchTerm || temaNorm.includes(searchTerm))
        .slice(0, 3)
        .forEach(([, display]) => {
          const value = norm(display);
          if (value) {
            chipData.push({ label: `tema:\${display}`, value: `tema:\${value}` });
          }
        });
    }

    if (!prefix || prefix === "doenca" || prefix === "doencas") {
      Array.from(doencaSet)
        .filter(d => !searchTerm || d.includes(searchTerm))
        .slice(0, 3)
        .forEach(d => chipData.push({ label: `doenca:\${d}`, value: `doenca:\${d}` }));
    }

    chips.innerHTML = "";
    if (!chipData.length) { chips.classList.add("hidden"); return; }

    chipData.forEach(ch => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = ch.label;
      b.addEventListener("click", () => {
        q.value = ch.value;
        onSearch();
        chips.classList.add("hidden");
      });
      chips.appendChild(b);
    });
    chips.classList.remove("hidden");
  }

  q.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onSearch, 220);
  });
  q.addEventListener("focus", () => renderChips(q.value));
  q.addEventListener("blur", () => setTimeout(()=>chips.classList.add("hidden"), 150));
  q.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      q.value = "";
      onSearch();
      chips.classList.add("hidden");
    }
  });
}
