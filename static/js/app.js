/* ===== Le Blog IA — front SPA ===== */
const APP = document.getElementById('app');
const STATE = { data: null, currentTheme: 'all' };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const fmtDate = (s) => {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'}); }
  catch { return s; }
};

async function boot() {
  const r = await fetch('/api/bootstrap');
  STATE.data = await r.json();
  router();
  window.addEventListener('hashchange', router);
}

function router() {
  const h = location.hash.replace(/^#/, '') || 'home';
  if (h === 'home' || h === '') return renderHome();
  if (h === 'formations') return renderFormationsIndex();
  if (h.startsWith('formation/')) {
    const parts = h.split('/');
    const niveau = parts[1];
    const num = parts[3];
    if (num) return renderModule(niveau, parseInt(num, 10));
    return renderFormation(niveau);
  }
  if (h === 'blog') return renderBlog('all');
  if (h.startsWith('blog/')) return renderBlog(h.split('/')[1]);
  if (h === 'recap') return renderRecap();
  if (h === 'bibliotheque') return renderBibliotheque();
  renderHome();
}

/* ===== HOME ===== */
function renderHome() {
  const d = STATE.data;
  const ed = d.edition;
  const recap = d.recap;
  const formations = d.formations;
  const themes = d.themes.themes;
  const articles = d.blog.articles;
  const featured = articles.find(a => a.featured) || articles[0];
  const others = articles.filter(a => a.slug !== featured.slug).slice(0, 4);

  const heroImg = "https://wsrv.nl/?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1581090700227-1e37b190418e%3Fw%3D2000&w=2000&output=webp";

  APP.innerHTML = `
    <section class="hero" style="--hero-img: url('${heroImg}');">
      <div class="hero-inner">
        <span class="hero-eyebrow">${esc(ed.label)}</span>
        <h1>Enseigner avec l'IA,<br><em>sans perdre son métier.</em></h1>
        <p class="hero-lead">Le blog des deux formations Eduservices à l'IA générative. Pour comprendre, gagner du temps, puis concevoir autrement. Une veille hebdomadaire qui nourrit les formations en continu.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#recap">Voir le Récap de la semaine <span class="arrow">→</span></a>
          <a class="btn btn-ghost" href="#formations">Reprendre la formation</a>
        </div>
      </div>
    </section>

    <div class="this-week">
      <div class="tw-left">
        <div class="tw-dot">é</div>
        <div>
          <div class="tw-meta">Cette semaine · semaine ${recap.semaine}</div>
          <div class="tw-title">${esc(recap.titre)}</div>
        </div>
      </div>
      <a class="tw-pdf" href="#recap">↓ Récap PDF</a>
    </div>

    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">Les deux formations</div>
          <h2>Un parcours en ligne <em style="font-style:italic;color:var(--moss);">en deux temps</em>.</h2>
        </div>
        <a class="section-link" href="#formations">Voir tout →</a>
      </div>
      <div class="formations-grid">
        ${['n1','n2'].map(n => {
          const f = formations[n];
          return `
            <a class="formation-card" href="#formation/${n}" style="--img: url('${f.hero_img}');">
              <div class="formation-img" style="background:#000 var(--img) center/cover no-repeat;"></div>
              <div class="formation-bar" style="background:${f.color};"></div>
              <div class="formation-body">
                <div class="formation-eyebrow" style="color:${f.color};">${esc(f.label)}</div>
                <h3>${esc(f.tagline)}</h3>
                <div class="formation-desc">${esc(f.long)}</div>
                <div class="formation-meta">
                  <span class="chip">${f.modules.length} modules</span>
                  <span class="chip">Livret · Slides · Exercices · Corrigés</span>
                </div>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </section>

    <section class="quote-band">
      <div class="quote-inner">
        <div class="quote-photo" style="background:#000 url('/static/img/eu_portrait.jpeg') center/cover no-repeat;"></div>
        <div class="quote-body">
          <blockquote>L'IA ne remplace pas le prof. Elle remplace le prof qui n'utilise pas l'IA — par celui qui l'utilise.</blockquote>
          <div class="quote-by"><strong>E. Urschel</strong> · formateur, enseignant·relais Eduservices</div>
        </div>
      </div>
    </section>

    <section class="section" id="blog">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">Le blog</div>
          <h2>L'<em style="font-style:italic;color:var(--moss);">actualité</em> qui nourrit les formations.</h2>
        </div>
        <a class="section-link" href="#blog">Voir tout →</a>
      </div>
      <div class="themes-chips">
        <span class="chip active">Tout</span>
        ${themes.map(t => `<span class="chip" data-theme="${t.slug}" style="--c:${t.color};">${esc(t.label)}</span>`).join('')}
      </div>
      <div class="blog-grid">
        <a class="article-card featured" href="${esc(featured.url)}" target="_blank" rel="noopener">
          <div class="article-img" style="background:#000 url('${featured.image}') center/cover no-repeat;">
            <span class="article-badge type-${esc(featured.type)}">${esc(typeLabel(featured.type))}</span>
            <span class="article-source">${esc(featured.source)}</span>
          </div>
          <div class="article-body">
            <div class="article-meta">${esc(typeLabel(featured.type))} · ${esc(featured.duree)} · ${fmtDate(featured.date)}</div>
            <h4>${esc(featured.titre)}</h4>
            <p class="article-lead">${esc(featured.lead)}</p>
          </div>
        </a>
        ${others.map(a => `
          <a class="article-card" href="${esc(a.url)}" target="_blank" rel="noopener">
            <div class="article-img" style="background:#000 url('${a.image}') center/cover no-repeat;">
              <span class="article-badge type-${esc(a.type)}">${esc(typeLabel(a.type))}</span>
              <span class="article-source">${esc(a.source)}</span>
            </div>
            <div class="article-body">
              <div class="article-meta">${esc(a.themes[0].toUpperCase())} · ${esc(a.duree)}</div>
              <h4>${esc(a.titre)}</h4>
            </div>
          </a>
        `).join('')}
      </div>
    </section>

    <footer class="footer">
      <span>Le Blog IA · par Eduservices · ${ed.annee} · Édition #${ed.numero}</span>
      <span class="lock">🔒 Accès participants</span>
    </footer>
  `;
}

function typeLabel(t){ const m={'article':'Article','video':'Vidéo','podcast':'Podcast','livre-blanc':'Livre blanc','etude':'Étude','outil':'Outil','tuto':'Tuto'}; return m[t]||t; }
function getThemeColor(slug) {
  const t = STATE.data.themes.themes.find(x => x.slug === slug);
  return t ? t.color : '#d9a441';
}

/* ===== Placeholders pour les autres pages (à enrichir) ===== */
function renderFormationsIndex() {
  const f = STATE.data.formations;
  APP.innerHTML = `
    <section class="section" style="padding-top:60px;">
      <div class="section-eyebrow">Le programme</div>
      <h2 style="font-family:Fraunces,serif;font-size:42px;line-height:1.05;margin:8px 0 40px;font-weight:500;">Les deux formations.</h2>
      <div class="formations-grid">
        ${['n1','n2'].map(n => {
          const x = f[n];
          return `
            <a class="formation-card" href="#formation/${n}" style="--img: url('${x.hero_img}');">
              <div class="formation-img" style="background:#000 var(--img) center/cover no-repeat;"></div>
              <div class="formation-bar" style="background:${x.color};"></div>
              <div class="formation-body">
                <div class="formation-eyebrow" style="color:${x.color};">${esc(x.label)}</div>
                <h3>${esc(x.tagline)}</h3>
                <div class="formation-desc">${esc(x.long)}</div>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderFormation(niveau) {
  const f = STATE.data.formations[niveau];
  if (!f) { APP.innerHTML = '<div style="padding:80px;text-align:center;">Niveau introuvable.</div>'; return; }
  APP.innerHTML = `
    <section class="hero" style="--hero-img: url('${f.hero_img}'); padding:70px 32px 50px;">
      <div class="hero-inner">
        <span class="hero-eyebrow" style="color:${f.color};">${esc(f.label)}</span>
        <h1>${esc(f.tagline)}</h1>
        <p class="hero-lead">${esc(f.long)}</p>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><div class="section-eyebrow">Modules</div><h2>${f.modules.length} modules.</h2></div></div>
      <div class="formations-grid">
        ${f.modules.map(m => `
          <a class="formation-card" href="#formation/${niveau}/module/${m.num}" style="--img: url('${m.img}');">
            <div class="formation-img" style="background:#000 var(--img) center/cover no-repeat;"></div>
            <div class="formation-bar" style="background:${f.color};"></div>
            <div class="formation-body">
              <div class="formation-eyebrow" style="color:${f.color};">Module ${m.num} · ${esc(m.duree)}</div>
              <h3>${esc(m.title)}</h3>
              <div class="formation-desc">${esc(m.tagline)}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

async function renderModule(niveau, num) {
  const r = await fetch(`/api/formation/${niveau}/module/${num}`);
  const m = await r.json();
  const f = STATE.data.formations[niveau];
  APP.innerHTML = `
    <section class="hero" style="--hero-img: url('${m.img}'); padding:60px 32px 50px;">
      <div class="hero-inner">
        <span class="hero-eyebrow" style="color:${f.color};">${esc(f.label)} · Module ${m.num} · ${esc(m.duree)}</span>
        <h1>${esc(m.title)}</h1>
        <p class="hero-lead">${esc(m.tagline)}</p>
      </div>
    </section>
    <section class="section section-full">
      ${m.sections.map(s => `
        <details ${s.type === 'cours' ? 'open' : ''} style="margin:0 0 18px;background:var(--bg2);border:0.5px solid var(--line);border-radius:14px;overflow:hidden;">
          <summary style="padding:22px 26px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:11px;color:${f.color};letter-spacing:0.14em;text-transform:uppercase;margin-bottom:6px;">${esc(s.type)}</div>
              <h3 style="font-family:Fraunces,serif;font-size:21px;font-weight:500;margin:0;">${esc(s.titre)}</h3>
              ${s.lead ? `<p style="color:var(--ink2);font-size:13px;line-height:1.55;margin-top:6px;">${esc(s.lead)}</p>` : ''}
            </div>
            <span style="color:var(--ink3);font-size:18px;">▾</span>
          </summary>
          <div class="content" style="padding:0 28px 26px;color:var(--ink);line-height:1.7;font-size:15px;">
            ${s.html || `<p style="color:var(--ink3);">Contenu à intégrer.</p>`}
          </div>
        </details>
      `).join('')}
      ${m.linked_actus && m.linked_actus.length ? `
        <div style="margin-top:50px;padding:24px;background:linear-gradient(135deg,rgba(217,164,65,0.12),rgba(217,164,65,0.04));border:0.5px solid rgba(217,164,65,0.30);border-radius:14px;">
          <div style="font-size:11px;color:var(--gold);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px;">⚡ Actus liées à ce module</div>
          ${m.linked_actus.map(a => `<a href="#blog/${esc(a.themes[0])}" style="display:block;padding:10px 0;border-top:0.5px solid var(--line);"><div style="font-size:11px;color:var(--ink3);">${esc(a.type)} · ${fmtDate(a.date)}</div><div style="font-family:Fraunces,serif;font-size:16px;">${esc(a.titre)}</div></a>`).join('')}
        </div>` : ''}
    </section>
  `;
}

function renderBlog(theme) {
  const arts = STATE.data.blog.articles;
  const themes = STATE.data.themes.themes;
  const filtered = theme === 'all' ? arts : arts.filter(a => a.themes.includes(theme));
  APP.innerHTML = `
    <section class="section" style="padding-top:60px;">
      <div class="section-eyebrow">Le blog</div>
      <h2 style="font-family:Fraunces,serif;font-size:42px;font-weight:500;line-height:1.05;margin:8px 0 32px;">Par thèmes.</h2>
      <div class="themes-chips">
        <a href="#blog" class="chip ${theme === 'all' ? 'active' : ''}">Tout</a>
        ${themes.map(t => `<a href="#blog/${t.slug}" class="chip ${theme === t.slug ? 'active' : ''}" style="${theme === t.slug ? `background:${t.color};color:var(--bg);border-color:${t.color};` : ''}">${esc(t.label)}</a>`).join('')}
      </div>
      <div class="blog-grid" style="grid-template-columns:repeat(3,1fr);">
        ${filtered.map(a => `
          <a class="article-card" href="${esc(a.url)}" target="_blank" rel="noopener">
            <div class="article-img" style="background:#000 url('${a.image}') center/cover no-repeat;">
              <span class="article-badge type-${esc(a.type)}">${esc(typeLabel(a.type))}</span>
              <span class="article-source">${esc(a.source)}</span>
            </div>
            <div class="article-body">
              <div class="article-meta">${esc(a.themes[0].toUpperCase())} · ${esc(a.duree)} · ${fmtDate(a.date)}</div>
              <h4>${esc(a.titre)}</h4>
              <p class="article-lead">${esc(a.lead)}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

function renderRecap() {
  const r = STATE.data.recap;
  APP.innerHTML = `
    <section class="hero" style="--hero-img: url('https://wsrv.nl/?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1495020689067-958852a7765e%3Fw%3D2000&w=2000&output=webp'); padding:60px 32px;">
      <div class="hero-inner">
        <span class="hero-eyebrow">Le Récap · semaine ${r.semaine}</span>
        <h1>${esc(r.titre)}</h1>
        <p class="hero-lead">${esc(r.lead)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${r.pdf}">↓ Télécharger le PDF</a>
        </div>
      </div>
    </section>
    <section class="section section-full">
      ${r.items.map(it => `
        <a href="${it.url || '#'}" target="_blank" style="display:block;padding:22px 24px;background:var(--bg2);border:0.5px solid var(--line);border-radius:12px;margin-bottom:14px;">
          <div style="font-size:11px;color:var(--gold);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">${esc(it.type)}</div>
          <h3 style="font-family:Fraunces,serif;font-size:19px;font-weight:500;margin:0 0 6px;">${esc(it.titre)}</h3>
          <p style="color:var(--ink2);line-height:1.5;font-size:14px;">${esc(it.lead)}</p>
        </a>
      `).join('')}
    </section>
  `;
}

function renderBibliotheque() {
  const livrets = [
    {
      titre: "Niveau 1 — Manuel de formation",
      sous_titre: "Travailler mieux avec l'IA · découverte, prompt, outils, pédagogie",
      auteur: "E. Urschel",
      pages: "≈ 35 pages",
      size: "232 Ko",
      type: "DOCX",
      url: "/static/livrets/Niveau1_Livret.docx",
      color: "var(--moss)"
    },
    {
      titre: "Niveau 2 — Manuel de formation",
      sous_titre: "Concevoir avec l'IA · idéation, prompting avancé, agents, évaluation",
      auteur: "E. Urschel",
      pages: "≈ 28 pages",
      size: "182 Ko",
      type: "DOCX",
      url: "/static/livrets/Niveau2_Livret.docx",
      color: "var(--coral)"
    },
    {
      titre: "L'Intelligence Artificielle Générative — Guide complet 2026",
      sous_titre: "Ouvrage de référence rédigé par un collègue, à recommander largement",
      auteur: "Eduservices",
      pages: "PDF illustré",
      size: "5,8 Mo",
      type: "PDF",
      url: "/static/livrets/Guide_IA_Generative_2026.pdf",
      color: "var(--gold)"
    }
  ];
  APP.innerHTML = `
    <section class="section" style="padding-top:60px;">
      <div class="section-eyebrow">Bibliothèque</div>
      <h2 style="font-family:Fraunces,serif;font-size:42px;font-weight:500;line-height:1.05;margin:8px 0 14px;">Les livrets.</h2>
      <p style="color:var(--ink2);max-width:680px;font-size:16px;line-height:1.6;margin-bottom:36px;">Les trois manuels de référence à télécharger. Les modules en ligne (Formations) reprennent ces contenus en version interactive ; les livrets restent utiles à imprimer ou à garder hors ligne.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;">
        ${livrets.map(l => `
          <a class="livret-card" href="${esc(l.url)}" download style="display:flex;flex-direction:column;padding:26px 28px 24px;background:var(--bg2);border:0.5px solid var(--line2);border-radius:14px;transition:0.18s;text-decoration:none;color:var(--ink);">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
              <div style="width:48px;height:56px;border-radius:6px;background:${l.color};color:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;letter-spacing:0.04em;flex:none;">${esc(l.type)}</div>
              <div>
                <div style="font-size:11px;color:${l.color};letter-spacing:0.14em;text-transform:uppercase;">Livret</div>
                <div style="font-size:12px;color:var(--ink3);margin-top:2px;">${esc(l.pages)} · ${esc(l.size)}</div>
              </div>
            </div>
            <h3 style="font-family:Fraunces,serif;font-size:20px;font-weight:500;line-height:1.25;margin:0 0 10px;">${esc(l.titre)}</h3>
            <p style="font-size:13.5px;color:var(--ink2);line-height:1.55;margin:0 0 18px;flex:1;">${esc(l.sous_titre)}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:0.5px solid var(--line);">
              <span style="font-size:11px;color:var(--ink3);">${esc(l.auteur)}</span>
              <span style="font-size:12px;color:${l.color};font-weight:500;">↓ Télécharger</span>
            </div>
          </a>
        `).join('')}
      </div>
      <p style="color:var(--ink3);margin-top:36px;font-size:13px;font-style:italic;">Les exercices, corrigés et présentations sont accessibles depuis chaque module en ligne (rubrique Formations).</p>
    </section>
  `;
}

boot();
