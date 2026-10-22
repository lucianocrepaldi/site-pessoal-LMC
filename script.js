(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NOW = new Date().getFullYear();
  $("#year").textContent = NOW;

  /* ---------- ticker: duplica para loop contínuo ---------- */
  const track = $("#tickerTrack");
  track.innerHTML += track.innerHTML;

  /* ---------- nav / progresso / menu ---------- */
  const nav = $("#nav");
  const bar = $("#progressBar");
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100).toFixed(2) + "%";
    nav.classList.toggle("is-scrolled", h.scrollTop > 40);
    journalProgress();
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  $("#navToggle").addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  const sections = $$("main section[id]");
  const navMap = new Map($$("#navLinks a").map(a => [a.getAttribute("href").slice(1), a]));
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      navMap.forEach(a => a.classList.remove("is-active"));
      navMap.get(e.target.id)?.classList.add("is-active");
    }
  }), { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => navIO.observe(s));

  /* ---------- brilho do cursor ---------- */
  const glow = $(".cursor-glow");
  window.addEventListener("pointermove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, { passive: true });

  /* ---------- título: letras subindo ---------- */
  let delay = 0;
  $$("#heroTitle .line").forEach(line => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(word => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "word";
            [...word].forEach(ch => {
              const s = document.createElement("span");
              s.className = "char";
              s.textContent = ch;
              s.style.animationDelay = (delay += 0.035).toFixed(3) + "s";
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else walk(n);
      });
    };
    walk(line);
    delay += 0.08;
  });

  /* ---------- papel digitado ---------- */
  const roles = [
    "Gerente de Contabilidade @ LHH",
    "Contador — CRC-SP",
    "Dev em formação: TypeScript · React · Node",
    "Fechamento contábil sem planilha perdida",
    "Transformando lançamentos em lógica"
  ];
  const typed = $("#typed");
  let ri = 0, ci = 0, del = false;
  const typeLoop = () => {
    const word = roles[ri];
    typed.textContent = word.slice(0, ci);
    if (!del && ci < word.length) { ci++; setTimeout(typeLoop, 55); }
    else if (!del) { del = true; setTimeout(typeLoop, 1900); }
    else if (ci > 0) { ci--; setTimeout(typeLoop, 25); }
    else { del = false; ri = (ri + 1) % roles.length; setTimeout(typeLoop, 300); }
  };
  if (reduce) typed.textContent = roles[0]; else setTimeout(typeLoop, 1200);

  /* ---------- bloco de código digitado ---------- */
  const code = [
    ["c", "// balanço de um contador que programa\n"],
    ["k", "const "], ["v", "luciano"], ["p", " = {\n"],
    ["p", "  cargo: "], ["s", "\"Gerente de Contabilidade\""], ["p", ",\n"],
    ["p", "  empresa: "], ["s", "\"Lee Hecht Harrison\""], ["p", ",\n"],
    ["p", "  desde: "], ["n", "2009"], ["p", ", "], ["c", "// finanças\n"],
    ["p", "  crc: "], ["s", "\"SP · 2014\""], ["p", ",\n"],
    ["p", "  stack: ["], ["s", "\"TS\""], ["p", ", "], ["s", "\"React\""], ["p", ", "], ["s", "\"Next\""], ["p", ", "], ["s", "\"Node\""], ["p", "],\n"],
    ["p", "  fecharMes"], ["p", ": () => "], ["v", "debito"], ["p", " === "], ["v", "credito"], ["p", ",\n"],
    ["p", "};\n\n"],
    ["v", "luciano"], ["p", ".fecharMes(); "], ["c", "// → true ✓\n"]
  ];
  const codeEl = $("#codeBlock");
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  if (reduce) {
    codeEl.innerHTML = code.map(([t, s]) => `<span class="tk-${t}">${esc(s)}</span>`).join("");
  } else {
    let ti = 0, chi = 0, html = "";
    const tick = () => {
      if (ti >= code.length) { codeEl.innerHTML = html + '<span class="caret"></span>'; return; }
      const [t, s] = code[ti];
      chi++;
      const cur = html + `<span class="tk-${t}">${esc(s.slice(0, chi))}</span>`;
      codeEl.innerHTML = cur + '<span class="caret"></span>';
      if (chi >= s.length) { html += `<span class="tk-${t}">${esc(s)}</span>`; ti++; chi = 0; }
      setTimeout(tick, s[chi - 1] === "\n" ? 90 : 18 + Math.random() * 22);
    };
    setTimeout(tick, 900);
  }

  /* ---------- gráfico financeiro animado no fundo ---------- */
  const cv = $("#chart");
  const ctx = cv.getContext("2d");
  let W, H, DPR, candles = [], line = [], t0 = performance.now();
  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  };
  const build = () => {
    candles = []; line = [];
    const n = Math.ceil(W / 22) + 4;
    let v = H * 0.72;
    for (let i = 0; i < n; i++) {
      const drift = -H * 0.0045;
      const o = v;
      const c = v + drift + (Math.random() - 0.5) * H * 0.05;
      const hi = Math.min(o, c) - Math.random() * H * 0.025;
      const lo = Math.max(o, c) + Math.random() * H * 0.025;
      candles.push({ o, c, hi, lo });
      v = Math.max(H * 0.18, c);
      line.push(c);
    }
  };
  const draw = now => {
    const el = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    const reveal = Math.min(1, el / 2.6);
    const visible = Math.floor(candles.length * reveal);
    const offset = reduce ? 0 : (el * 8) % 22;
    for (let i = 0; i < visible; i++) {
      const k = candles[i];
      const x = i * 22 - offset;
      const up = k.c < k.o;
      const col = up ? "rgba(25,211,138,.42)" : "rgba(255,93,108,.32)";
      ctx.strokeStyle = col; ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x + 5, k.hi); ctx.lineTo(x + 5, k.lo); ctx.stroke();
      ctx.fillRect(x + 1, Math.min(k.o, k.c), 8, Math.max(2, Math.abs(k.c - k.o)));
    }
    // linha de média móvel
    ctx.beginPath();
    for (let i = 0; i < visible; i++) {
      const a = Math.max(0, i - 4);
      const avg = line.slice(a, i + 1).reduce((s, x) => s + x, 0) / (i - a + 1);
      const x = i * 22 - offset + 5;
      i ? ctx.lineTo(x, avg) : ctx.moveTo(x, avg);
    }
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "rgba(255,176,32,0)"); g.addColorStop(.5, "rgba(255,176,32,.7)"); g.addColorStop(1, "rgba(255,176,32,.9)");
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
    // vinheta
    const v = ctx.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, "rgba(7,9,13,.85)"); v.addColorStop(.45, "rgba(7,9,13,.35)"); v.addColorStop(1, "rgba(7,9,13,.95)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    if (!reduce || reveal < 1) requestAnimationFrame(draw);
  };
  window.addEventListener("resize", () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 150); });
  resize(); requestAnimationFrame(draw);

  /* ---------- tilt no terminal ---------- */
  const tilt = $(".tilt");
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    tilt.addEventListener("pointermove", e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    tilt.addEventListener("pointerleave", () => tilt.style.transform = "");
    $$(".magnetic").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener("pointerleave", () => b.style.transform = "");
    });
  }

  /* ---------- contadores ---------- */
  const countUp = el => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = target; return; }
    const start = performance.now(), dur = 1600;
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- balanço: barras por tempo de prática ---------- */
  const FIRST = 2009;
  $$(".ledger__list li").forEach(li => {
    const since = +li.dataset.since;
    const yrs = Math.max(1, NOW - since);
    li.querySelector(".yr").textContent = yrs + (yrs > 1 ? " anos" : " ano");
    li.dataset.pct = Math.max(6, (yrs / (NOW - FIRST)) * 100).toFixed(1);
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");
      $$("[data-count]", el).forEach(countUp);
      if (el.classList.contains("ledger")) {
        $$(".ledger__list li", el).forEach((li, i) => setTimeout(() => li.querySelector(".bar i").style.width = li.dataset.pct + "%", i * 90));
      }
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- linha do razão ---------- */
  const journal = $(".journal"), jp = $("#journalProgress");
  function journalProgress() {
    if (!journal) return;
    const r = journal.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    jp.style.height = (p * 100) + "%";
  }

  /* ---------- portfólio ---------- */
  const LANG = { TypeScript: "#3178c6", JavaScript: "#f1e05a", HTML: "#e34c26", "C++": "#f34b7d" };
  const GH = "https://github.com/lucianocrepaldi/";
  const projects = [
    { t: "FINW", n: "FinWise", cat: "mobile", lang: "TypeScript", st: "wip", repo: "FinWise-app", y: 2025,
      d: "App mobile de finanças — projeto PAMII na Etec. Onde a controladoria encontra o celular." },
    { t: "CRLM", n: "Corrida LM — API", cat: "backend", lang: "TypeScript", st: "wip", repo: "corrida-lm-api", y: 2026,
      d: "Back-end do app Corrida LM: a API que sustenta o produto." },
    { t: "IBGE", n: "API IBGE", cat: "web", lang: "TypeScript", st: "done", repo: "API_IBGE", y: 2025,
      d: "Consumo da API pública do IBGE com TypeScript — dados oficiais, tratados e exibidos." },
    { t: "CAM", n: "Camera", cat: "mobile", lang: "TypeScript", st: "done", repo: "CAMERA", y: 2025,
      d: "App mobile com acesso à câmera do dispositivo — projeto da aula PAMII." },
    { t: "NEXT", n: "Auth em Next.js", cat: "web", lang: "JavaScript", st: "done", repo: "projReactNext", y: 2025,
      d: "Aprimoramento de um sistema de autenticação em Next.js." },
    { t: "RCTA", n: "Projeto Receita", cat: "mobile", lang: "JavaScript", st: "done", repo: "projetoreceita_PAMI", y: 2025,
      d: "App de receitas desenvolvido em Programação de Aplicativos Mobile I." },
    { t: "IMC", n: "Calculadora IMC", cat: "mobile", lang: "JavaScript", st: "done", repo: "calculadoraimc_LucianoMendesCrepaldi", y: 2025,
      d: "Calculadora de IMC: entrada, regra de negócio e resultado — o básico bem feito." },
    { t: "PW3", n: "App PWIII", cat: "web", lang: "JavaScript", st: "done", repo: "my-app-2", y: 2025,
      d: "Aplicação web desenvolvida na disciplina de Programação Web III." },
    { t: "IP16", n: "Site iPhone 16", cat: "web", lang: "HTML", st: "done", repo: "ATV03PW1-", y: 2024, live: "https://atv-03-pw-1.vercel.app",
      d: "Website de apresentação do iPhone 16 em HTML5 e CSS3 — publicado na Vercel." },
    { t: "ARDU", n: "Desafios Embarcados", cat: "embarcados", lang: "C++", st: "done", repo: "ATVSE_DESAFIOS", y: 2025,
      d: "Funções essenciais para sistemas embarcados com Arduino Uno e C++." },
    { t: "TKCD", n: "TinkerCad C++", cat: "embarcados", lang: "C++", st: "done", repo: "ATV04_TinkerCad", y: 2025,
      d: "Circuitos e firmware simulados no TinkerCad, programados em C++." }
  ];
  const seeded = seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const spark = (seed, color) => {
    const r = seeded(seed), pts = [];
    let v = 34;
    for (let i = 0; i <= 20; i++) { v = Math.max(6, Math.min(40, v - 1.3 + (r() - 0.45) * 9)); pts.push([i * 10, v]); }
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1].toFixed(1)).join(" ");
    const id = "g" + seed;
    return `<svg class="spark" viewBox="0 0 200 46" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".25"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <path d="${d} L200 46 L0 46 Z" fill="url(#${id})"/>
      <path class="l" d="${d}" stroke="${color}"/></svg>`;
  };
  const pf = $("#portfolio");
  pf.innerHTML = projects.map((p, i) => `
    <article class="card reveal" data-cat="${p.cat}" style="transition-delay:${(i % 3) * 70}ms">
      <div class="card__top">
        <div><div class="card__ticker">$${p.t}</div><h3 class="card__name">${p.n}</h3></div>
        <span class="status status--${p.st}">${p.st === "wip" ? "● em andamento" : "✓ entregue"}</span>
      </div>
      <p class="card__desc">${p.d}</p>
      ${spark(i * 97 + 13, p.st === "wip" ? "#ffb020" : "#19d38a")}
      <div class="card__foot">
        <span class="lang"><i style="background:${LANG[p.lang]}"></i>${p.lang} · ${p.y}</span>
        <span>${p.live ? `<a class="card__link" href="${p.live}" target="_blank" rel="noopener">demo ↗</a> · ` : ""}<a class="card__link" href="${GH + p.repo}" target="_blank" rel="noopener">repo ↗</a></span>
      </div>
    </article>`).join("");
  $$(".card", pf).forEach(c => {
    io.observe(c);
    c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    $$(".card", pf).forEach(c => {
      const show = f === "all" || c.dataset.cat === f;
      c.classList.toggle("is-hidden", !show);
      if (show) { c.classList.remove("in"); requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add("in"))); }
    });
  }));

  /* ---------- console interativo ---------- */
  const out = $("#shellOut"), input = $("#shellInput"), form = $("#shellForm");
  const hist = []; let hi = 0;
  const print = html => { out.insertAdjacentHTML("beforeend", html + "\n"); out.scrollTop = out.scrollHeight; };
  const cmds = {
    help: () => `Comandos disponíveis:
  <span class="hl">whoami</span>     quem é o Luciano
  <span class="hl">balanco</span>    ativo × passivo de competências
  <span class="hl">razao</span>      lançamentos da carreira
  <span class="hl">stack</span>      tecnologias em uso
  <span class="hl">lab</span>        projetos e apps
  <span class="hl">dre</span>        demonstração do resultado (da carreira)
  <span class="hl">contato</span>    como falar comigo
  <span class="hl">clear</span>      limpar a tela`,
    whoami: () => `<span class="hl">Luciano Mendes Crepaldi</span>
Gerente de Contabilidade · Lee Hecht Harrison · São Paulo
Contador CRC-SP · Bacharel em Ciências Contábeis (Anhanguera)
Dev em formação na Etec: web, mobile, embarcados e APIs.`,
    balanco: () => {
      const L = [["Faturamento", 2009], ["Fiscal", 2010], ["Fechamento", 2011], ["Conciliações", 2011], ["CRC-SP", 2014], ["Gestão de equipe", 2019]];
      const R = [["HTML/CSS", 2024], ["JavaScript", 2024], ["TypeScript", 2025], ["React / Next", 2025], ["C++ / Arduino", 2025], ["APIs / Node", 2026]];
      const f = ([n, y]) => (n + " ").padEnd(19, ".") + " " + String(Math.max(1, NOW - y)).padStart(2) + "a";
      return `<span class="hl">${"ATIVO".padEnd(27)}</span><span class="bl">PASSIVO + PL</span>\n` +
        L.map((l, i) => f(l) + "    " + f(R[i])).join("\n") + `\n<span class="gr">✓ Ativo = Passivo + PL</span>`;
    },
    razao: () => `001 jun/2009  Analista de Faturamento ....... Weleda
002 fev/2010  Analista Fiscal ............... Weleda
003 mai/2011  Analista Contábil Pleno ....... Weleda
004 nov/2011  Analista Contábil ............. LHH
005 jan/2014  Registro de Contador .......... CRC-SP
006 jan/2019  Coordenador de Contabilidade .. LHH
007 jan/2020  <span class="hl">Gerente de Contabilidade ...... LHH  ← atual</span>
008 2024 →    <span class="bl">Desenvolvimento de sistemas ... Etec</span>`,
    stack: () => `<span class="bl">front</span>   HTML5 · CSS3 · JavaScript · TypeScript · React · Next.js
<span class="bl">mobile</span>  apps em TypeScript (FinWise, Camera)
<span class="bl">back</span>    Node · APIs REST (Corrida LM)
<span class="bl">hw</span>      C++ · Arduino Uno · TinkerCad
<span class="bl">deploy</span>  Git · GitHub · Vercel
<span class="bl">core</span>    contabilidade · fiscal · controladoria`,
    lab: () => projects.map(p => `<span class="hl">$${p.t.padEnd(5)}</span> ${p.n.padEnd(22)} ${p.st === "wip" ? '<span class="hl">● em andamento</span>' : '<span class="gr">✓ entregue</span>'}`).join("\n") + `\n→ <a href="#lab">ver cards</a>`,
    dre: () => `<span class="hl">DRE — Demonstração do Resultado da Carreira</span>
(+) Receita bruta de experiência ........ ${NOW - 2009} anos
(−) Deduções: bugs, erros de compilação .. (corrigidos)
(=) Receita líquida ..................... visão de negócio + código
(−) Custo: cafés, madrugadas, commits ...  ∞
(=) <span class="gr">Lucro: aprendizado contínuo ......... ▲ crescente</span>`,
    contato: () => `LinkedIn → <a href="https://www.linkedin.com/in/luciano-mendes-05887730" target="_blank" rel="noopener">linkedin.com/in/luciano-mendes-05887730</a>
GitHub   → <a href="https://github.com/lucianocrepaldi" target="_blank" rel="noopener">github.com/lucianocrepaldi</a>`,
    ls: () => `curriculo.txt  balanco.xlsx  razao.csv  apps/  <span class="bl">cafe.exe</span>`,
    "cat curriculo.txt": () => cmds.whoami(),
    date: () => new Date().toLocaleString("pt-BR"),
    sudo: () => `<span class="rd">permissão negada:</span> lançamentos sem documento-suporte não são aceitos.`,
    exit: () => `Não há saída: o balanço precisa fechar primeiro. 😉`
  };
  const run = raw => {
    const c = raw.trim();
    print(`<span class="cmd"><b>$</b> ${esc(c)}</span>`);
    if (!c) return;
    hist.push(c); hi = hist.length;
    const key = c.toLowerCase();
    if (key === "clear") { out.innerHTML = ""; return; }
    const fn = cmds[key] || (key.startsWith("sudo") ? cmds.sudo : null);
    print(fn ? fn() : `<span class="rd">comando não encontrado:</span> ${esc(c)} — digite <span class="hl">help</span>`);
  };
  print(`<span class="gr">LMC shell v1.0</span> — saldo inicial carregado.\nDigite <span class="hl">help</span> para começar.\n`);
  form.addEventListener("submit", e => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && hi > 0) { input.value = hist[--hi]; e.preventDefault(); }
    if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault(); }
    if (e.key === "Tab") {
      e.preventDefault();
      const m = Object.keys(cmds).concat("clear").filter(k => k.startsWith(input.value.toLowerCase()));
      if (m.length === 1) input.value = m[0];
    }
  });
  $$(".shell__chips button").forEach(b => b.addEventListener("click", () => { run(b.dataset.cmd); }));
  $("#shell").addEventListener("click", e => { if (!e.target.closest("a,button") && matchMedia("(pointer:fine)").matches) input.focus({ preventScroll: true }); });

  onScroll();
})();
