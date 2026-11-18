(function (g) {
  const SAFE = new Set("the this that it these those they we you he she a an there here in on at as if when with for by some many most each every our your their its his her one people users teams".split(" "));
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = (a, r) => a[Math.floor(r() * a.length)];
  const words = s => s.trim().split(/\s+/).filter(Boolean).length;
  const cap = s => s.replace(/^([^A-Za-z]*)([a-z])/, (_, p, c) => p + c.toUpperCase());
  const lowerFirst = s => SAFE.has(s.split(/\s+/)[0].toLowerCase()) ? s[0].toLowerCase() + s.slice(1) : null;
  const matchCase = (src, rep) => rep && /[A-Z]/.test(src[0]) ? rep[0].toUpperCase() + rep.slice(1) : rep;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const clean = s => s.replace(/\s+([,.;!?])/g, "$1").replace(/,\s*,/g, ",").replace(/^[\s,;:]+/, "").replace(/\s{2,}/g, " ").trim();
  const spread = a => { const l = a.map(words), m = l.reduce((x, y) => x + y, 0) / l.length; return Math.sqrt(l.reduce((x, y) => x + (y - m) ** 2, 0) / l.length); };

  function rewriteWords(s, tone, r, R) {
    const conRe = new RegExp("^(" + Object.keys(R.connectors).join("|") + "),?\\s+", "i");
    s = s.replace(conRe, (_, w) => { const rep = pick(tone.swap[R.connectors[w.toLowerCase()]], r); return rep ? rep + " " : ""; });
    for (const k of Object.keys(R.phrases).sort((a, b) => b.length - a.length))
      s = s.replace(new RegExp("(?<!\\w)" + esc(k) + "(?!\\w)", "gi"), m => matchCase(m, pick(R.phrases[k], r)));
    for (const [a, b] of R.contractions)
      s = s.replace(new RegExp("(?<!\\w)" + esc(a) + "(?!\\w)", "gi"), m => r() < tone.contractions ? matchCase(m, b) : m);
    return s;
  }

  function flip(s) {
    const m = s.match(/^(Because|Since|Although|While|If|When|Unless)\s+([^,]{8,}),\s+(.+?)([.!?])$/);
    return m && !/^then\b/i.test(m[3]) ? cap(m[3]) + " " + m[1].toLowerCase() + " " + m[2] + m[4] : s;
  }

  function split(s, tone, r) {
    const mid = s.length / 2;
    const ok = [...s.matchAll(/;\s+|,\s+(and|but|so)\s+/gi)]
      .filter(x => words(s.slice(0, x.index)) >= 4 && words(s.slice(x.index + x[0].length)) >= 4)
      .sort((a, b) => Math.abs(a.index - mid) - Math.abs(b.index - mid));
    if (!ok.length) return [s];
    const x = ok[0], c = (x[1] || "").toLowerCase();
    const left = s.slice(0, x.index).replace(/[,;:]$/, "") + ".";
    let right = s.slice(x.index + x[0].length);
    if (c === "but") right = (tone.allowFragments ? "But " : pick(["However, ", "Still, "], r)) + right;
    else if (c === "and" && tone.allowFragments && r() < 0.5) right = "And " + right;
    else if (c === "so") right = (tone.allowFragments ? "So " : "As a result, ") + right;
    return [left, cap(right)];
  }
