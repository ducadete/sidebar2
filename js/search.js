export const norm = (s) => (s || "")
  .toString()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

export const SYNONYMS = {
  "has": ["hipertensao arterial sistemica","hipertensao","pressao alta"],
  "diabetes": ["dm","glicemia","diabete","hiperglicemia"],
  "asma": ["sibilo","chiado","broncospasmo","crise asmatica"],
  "gestante": ["gravida","pre-natal","prenatal"],
  "idoso": ["terceira idade","longevidade"],
  "crianca": ["pediatria","pediatrico"],
  "tb": ["tuberculose"],
  "ist": ["dst","sexualmente transmissivel"]
};

export const makeKeywords = (p) => {
  const tokens = [p.nome, p.tema, p.resumo, p.doencas, p.cids, p.principais, p.fluxo, p.idades, p.anexos]
    .map(x => norm(x)).join(" ").split(/\s+/).filter(Boolean);

  Object.entries(SYNONYMS).forEach(([base, list]) => {
    if (tokens.join(" ").includes(base)) list.forEach(syn => tokens.push(syn));
  });

  const cidsNoDot = (p.cids || "")
    .split(";").map(c => c.trim().replace(".","")).filter(Boolean);
  cidsNoDot.forEach(c => tokens.push(c));

  return tokens.join(" ");
};

export const buildFuseQuery = (raw) => {
  const q = raw.trim();
  if (!q) return null;

  const tokens = [];
  q.replace(/"([^"]+)"|(\S+)/g, (_, quoted, bare) => {
    tokens.push(quoted ? `"\${quoted}"` : bare);
  });

  const clauses = [];
  for (const tk of tokens) {
    if (tk.startsWith("!")) {
      const term = norm(tk.slice(1));
      clauses.push({ $and: [{ $path: "keywords", $not: term }] });
      continue;
    }
    if (tk.startsWith('"') && tk.endsWith('"')) {
      const term = norm(tk.slice(1, -1));
      clauses.push({ $or: [
        { $path: "nome", $val: `="\${term}"` },
        { $path: "tema", $val: `="\${term}"` },
        { $path: "resumo", $val: `="\${term}"` },
        { $path: "doencas", $val: `="\${term}"` },
        { $path: "fluxo", $val: `="\${term}"` },
        { $path: "keywords", $val: `="\${term}"` }
      ]});
      continue;
    }
    const m = tk.match(/^([a-z]+):(.*)$/i);
    if (m) {
      const field = m[1].toLowerCase();
      let value = norm(m[2] || "");
      if (field === "cid") {
        value = value.replace(".","").toUpperCase();
        clauses.push({ $or: [
          { $path: "cidsRaw", $val: `^"\${value}"` },
          { $path: "keywords", $val: value.toLowerCase() }
        ]});
      } else if (field === "has" && value === "anexo") {
        clauses.push({ $path: "hasAnexoStr", $val: "=true" });
      } else if (["tema","nome","resumo","doenca","doencas","fluxo","idades"].includes(field)) {
        const mapped = field === "doenca" ? "doencas" : field;
        clauses.push({ $path: mapped, $val: value });
      } else {
        clauses.push({ $path: "keywords", $val: value });
      }
      continue;
    }
    clauses.push({ $path: "keywords", $val: norm(tk) });
  }
  return clauses.length ? { $and: clauses } : null;
};

export const highlight = (original, rawQuery) => {
  if (!rawQuery) return original || "";
  const normOriginal = norm(original || "");
  const terms = [];
  rawQuery.replace(/"([^"]+)"|(\S+)/g, (_, quoted, bare) => {
    let t = norm(quoted || bare || "");
    if (!t || t.startsWith("!") || t.includes(":")) return;
    terms.push(t);
  });
  if (!terms.length) return original || "";

  const ranges = [];
  terms.forEach(term => {
    let start = 0, idx;
    while ((idx = normOriginal.indexOf(term, start)) !== -1) {
      ranges.push([idx, idx + term.length]);
      start = idx + term.length;
    }
  });
  if (!ranges.length) return original || "";

  ranges.sort((a,b)=>a[0]-b[0]);
  const merged = [];
  for (const r of ranges) {
    if (!merged.length || r[0] > merged[merged.length-1][1]) merged.push(r);
    else merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], r[1]);
  }

  let html = "", pos = 0;
  for (const [s,e] of merged) {
    html += (original || "").slice(pos, s);
    html += "<mark>" + (original || "").slice(s, e) + "</mark>";
    pos = e;
  }
  html += (original || "").slice(pos);
  return html;
};
