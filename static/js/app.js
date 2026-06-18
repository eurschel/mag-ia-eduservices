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
  const r = await fetch('/api/bootstrap', {cache: 'no-cache'});
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
  if (h === 'newsletter') return renderNewsletter();
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

  APP.innerHTML = `
    <section class="hero hero-video">
      <video class="hero-bg-video" autoplay loop muted playsinline preload="auto">
        <source src="/static/videos/hero-home.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
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
      <a class="tw-pdf" href="#recap">↗ Voir le récap</a>
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
            <a class="formation-card formation-card-video" href="#formation/${n}">
              <div class="formation-img">
                <video autoplay loop muted playsinline preload="auto">
                  <source src="/static/videos/formation-${n}.mp4" type="video/mp4">
                </video>
              </div>
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
        <a class="chip active" href="#blog">Tout</a>
        ${themes.map(t => `<a class="chip" href="#blog/${t.slug}" style="--c:${t.color};">${esc(t.label)}</a>`).join('')}
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
            <a class="formation-card formation-card-video" href="#formation/${n}">
              <div class="formation-img">
                <video loop muted playsinline preload="metadata" poster="${x.hero_img}" onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0">
                  <source src="/static/videos/formation-${n}.mp4" type="video/mp4">
                </video>
              </div>
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
    <section class="hero hero-video" style="padding:70px 32px 50px;">
      <video class="hero-bg-video" autoplay loop muted playsinline preload="auto">
        <source src="/static/videos/formation-${niveau}.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
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
  const r = await fetch(`/api/formation/${niveau}/module/${num}`, {cache: 'no-cache'});
  const m = await r.json();
  const f = STATE.data.formations[niveau];
  STATE.currentModule = m;
  const hasVignettes = Array.isArray(m.vignettes) && m.vignettes.length > 0;

  APP.innerHTML = `
    <section class="hero" style="--hero-img: url('${m.img}'); padding:60px 32px 50px;">
      <div class="hero-inner">
        <span class="hero-eyebrow">${esc(f.label)} · Module ${m.num} · ${esc(m.duree)}</span>
        <h1>${esc(m.title)}</h1>
        <p class="hero-lead">${esc(m.tagline)}</p>
      </div>
    </section>
    <section class="section section-full">
      <div class="module-layout ${hasVignettes ? 'has-sidebar' : ''}">
        <div class="module-main">
          ${m.sections.map(s => `
            <details ${s.type === 'cours' ? 'open' : ''} class="section-block">
              <summary>
                <div>
                  <div class="section-block-type">${esc(s.type)}</div>
                  <h3>${esc(s.titre)}</h3>
                  ${s.lead ? `<p class="section-block-lead">${esc(s.lead)}</p>` : ''}
                </div>
                <span class="section-block-chev">▾</span>
              </summary>
              <div class="content">
                ${s.html || `<p style="color:var(--ink3);">Contenu à intégrer.</p>`}
              </div>
            </details>
          `).join('')}
          ${m.linked_actus && m.linked_actus.length ? `
            <div class="linked-actus">
              <div class="linked-actus-eye">⚡ Actus liées à ce module</div>
              ${m.linked_actus.map(a => `<a href="#blog/${esc(a.themes[0])}" class="linked-actu-item"><div class="meta">${esc(a.type)} · ${fmtDate(a.date)}</div><div class="t">${esc(a.titre)}</div></a>`).join('')}
            </div>` : ''}
        </div>
        ${hasVignettes ? `
        <aside class="module-sidebar">
          <div class="sidebar-eye">Pour aller plus loin</div>
          ${m.vignettes.map((v, i) => renderVignette(v, i)).join('')}
        </aside>
        ` : ''}
      </div>
    </section>
    <div id="modal-root"></div>
  `;
  bindVignetteClicks();
}

function renderVignette(v, idx) {
  const t = v.type || 'approfondir';
  const isVideo = t === 'video';
  const isExternal = isVideo && v.url;
  const isModal = v.modal_id != null;

  const tag = isExternal
    ? `<a class="vignette vignette-${t}" href="${esc(v.url)}" target="_blank" rel="noopener" data-vignette="${idx}">`
    : isModal
      ? `<button class="vignette vignette-${t}" type="button" data-modal="${esc(v.modal_id)}" data-vignette="${idx}">`
      : `<div class="vignette vignette-${t}" data-vignette="${idx}">`;
  const closetag = isExternal ? '</a>' : isModal ? '</button>' : '</div>';

  let body = '';
  if (isVideo && v.thumb) {
    body = `
      <div class="vignette-thumb"><img src="${esc(v.thumb)}" alt=""><span class="vignette-play">▶</span></div>
      <div class="vignette-body">
        <div class="vignette-label"><span class="vignette-icon">${v.icon || ''}</span>${esc(v.label || '')}</div>
        <div class="vignette-title">${esc(v.titre)}</div>
        <p class="vignette-lead">${esc(v.lead)}</p>
        ${v.source ? `<div class="vignette-meta">${esc(v.source)}${v.duree ? ' · ' + esc(v.duree) : ''}</div>` : ''}
      </div>`;
  } else if (t === 'chiffre') {
    body = `
      <div class="vignette-body">
        <div class="vignette-label"><span class="vignette-icon">${v.icon || '📊'}</span>${esc(v.label || 'Chiffre clé')}</div>
        <div class="vignette-bignum">${esc(v.titre)}</div>
        <p class="vignette-lead">${esc(v.lead)}</p>
      </div>`;
  } else if (t === 'citation') {
    body = `
      <div class="vignette-body">
        <div class="vignette-label"><span class="vignette-icon">${v.icon || '💬'}</span>${esc(v.label || 'Citation')}</div>
        <blockquote class="vignette-quote">${esc(v.titre)}</blockquote>
        <p class="vignette-lead">${esc(v.lead)}</p>
        ${v.source ? `<div class="vignette-meta">— ${esc(v.source)}</div>` : ''}
      </div>`;
  } else {
    body = `
      <div class="vignette-body">
        <div class="vignette-label"><span class="vignette-icon">${v.icon || '💡'}</span>${esc(v.label || '')}</div>
        <div class="vignette-title">${esc(v.titre)}</div>
        <p class="vignette-lead">${esc(v.lead)}</p>
        ${isModal ? `<div class="vignette-cta">Voir la fiche →</div>` : ''}
        ${isExternal && !v.thumb ? `<div class="vignette-cta">Ouvrir la vidéo ↗</div>` : ''}
      </div>`;
  }
  return tag + body + closetag;
}

function bindVignetteClicks() {
  if (window._modalDelegationBound) return;
  window._modalDelegationBound = true;
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal]');
    if (!trigger) return;
    e.preventDefault();
    openModal(trigger.getAttribute('data-modal'));
  });
}

function openModal(id) {
  const m = STATE.currentModule;
  if (!m || !m.modals || !m.modals[id]) return;
  const data = m.modals[id];
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal()"></div>
    <div class="modal-window" role="dialog" aria-modal="true">
      <button class="modal-close" onclick="closeModal()" aria-label="Fermer">✕</button>
      <div class="modal-head"><h2>${esc(data.titre)}</h2></div>
      <div class="modal-body">${data.html || ''}</div>
    </div>
  `;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', escClose);
}
function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
  document.body.style.overflow = '';
  document.removeEventListener('keydown', escClose);
}
function escClose(e) { if (e.key === 'Escape') closeModal(); }
window.closeModal = closeModal;

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
  const dateLabel = r.annee ? `Semaine ${r.semaine} · ${r.annee}` : `Semaine ${r.semaine}`;
  APP.innerHTML = `
    <section class="hero" style="padding:80px 32px 50px; --hero-img: url('/static/img/gemini/dashboard-executif.jpg');">
      <div class="hero-inner">
        <div class="hero-eyebrow"><span class="dot"></span>Le Récap hebdo · ${esc(dateLabel)}</div>
        <h1>${esc(r.titre)}</h1>
        <p class="hero-lead">${esc(r.lead)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#newsletter">S'abonner au Récap →</a>
          ${r.pdf ? `<a class="btn btn-ghost" href="${r.pdf}">↓ Télécharger en PDF</a>` : ''}
        </div>
      </div>
    </section>
    <section class="newsletter-banner">
      <div class="nlb-inner">
        <div class="nlb-icon">✉️</div>
        <div class="nlb-text">
          <h3>Recevez le Récap chaque dimanche</h3>
          <p>Une sélection IA &amp; pédagogie qui nourrit vos cours, directement dans votre boîte mail. Désinscription en 1 clic.</p>
        </div>
        <a class="btn btn-primary" href="#newsletter">S'inscrire gratuitement →</a>
      </div>
    </section>
  `;
}

function recapTypeLabel(t) {
  const m = {cadre:'Cadre réglementaire',etude:'Étude / rapport',veille:'Veille produit',actu:'Actualité',outil:'Outil',terrain:'Retour terrain',lecture:'Lecture longue',video:'Vidéo'};
  return m[t] || t || 'Ressource';
}

function renderNewsletter() {
  APP.innerHTML = `
    <section class="hero" style="padding:80px 32px 60px; --hero-img: url('/static/img/gemini/centre-commandement.jpg');">
      <div class="hero-inner">
        <div class="hero-eyebrow"><span class="dot"></span>Newsletter</div>
        <h1>Le Récap arrive <em>chaque dimanche</em>.</h1>
        <p class="hero-lead">Une sélection curée des essentiels IA &amp; pédagogie de la semaine. Conçue pour les enseignants du supérieur tertiaire. Trois minutes de lecture, douze mois d'avance.</p>
      </div>
    </section>
    <section class="section">
      <div class="newsletter-grid">
        <div class="nl-form-box">
          <h2>S'abonner au Récap</h2>
          <p class="nl-form-lead">Votre adresse. Pas de spam, pas de partage à des tiers. Désinscription en 1 clic. Conforme RGPD.</p>
          <form class="nl-form" onsubmit="return submitNewsletter(event)">
            <label for="nl-email" class="nl-label">Adresse e-mail</label>
            <input type="email" id="nl-email" name="EMAIL" required placeholder="prenom.nom@eduservices.fr" autocomplete="email">
            <label class="nl-consent">
              <input type="checkbox" id="nl-consent" required>
              <span>J'accepte de recevoir Le Récap hebdo et la politique de <a href="#confidentialite">confidentialité</a>.</span>
            </label>
            <button type="submit" class="btn btn-primary">M'abonner →</button>
            <div id="nl-status" class="nl-status"></div>
          </form>
        </div>
        <div class="nl-promise-box">
          <h3>Ce que vous recevrez</h3>
          <ul class="nl-promise">
            <li><strong>3 ressources curées</strong> · cadre, étude, outil — toutes vérifiables.</li>
            <li><strong>1 prompt de la semaine</strong> · à copier-coller pour vos cours.</li>
            <li><strong>1 chaîne YouTube</strong> · pour creuser à votre rythme.</li>
            <li><strong>1 actu Eduservices</strong> · ce qui se passe dans nos écoles.</li>
          </ul>
          <div class="nl-meta">
            <div><span>✓</span> Envoi unique le dimanche soir</div>
            <div><span>✓</span> Aucun partage à des tiers</div>
            <div><span>✓</span> Désinscription en 1 clic</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

async function submitNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('nl-email').value;
  const status = document.getElementById('nl-status');
  status.textContent = 'Inscription en cours…';
  status.className = 'nl-status pending';
  // PLACEHOLDER : URL du formulaire Brevo à configurer
  // Quand la liste Brevo "Le Mag IA — Récap hebdo" sera créée, mettre l'URL ici
  const BREVO_FORM_URL = ''; // TODO
  if (!BREVO_FORM_URL) {
    status.textContent = '⚠️ Inscription bientôt disponible — Brevo en cours de configuration.';
    status.className = 'nl-status warn';
    return false;
  }
  try {
    const fd = new FormData();
    fd.append('EMAIL', email);
    fd.append('locale', 'fr');
    await fetch(BREVO_FORM_URL, {method:'POST', body:fd, mode:'no-cors'});
    status.textContent = '✓ Inscription enregistrée — vérifiez votre boîte mail !';
    status.className = 'nl-status ok';
    document.getElementById('nl-email').value = '';
  } catch (err) {
    status.textContent = 'Erreur. Réessayez ou contactez bonjour@news.tablonoir.fr';
    status.className = 'nl-status err';
  }
  return false;
}
window.submitNewsletter = submitNewsletter;

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
      titre: "Niveau 1 — Cahier d'exercices",
      sous_titre: "8 exercices pratiques pour ancrer la formation : prompts, étude de cas, QCM, RGPD…",
      auteur: "E. Urschel",
      pages: "≈ 20 pages",
      size: "254 Ko",
      type: "DOCX",
      url: "/static/livrets/Niveau1_Exercices.docx",
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
      titre: "Niveau 2 — Cahier d'exercices",
      sous_titre: "8 exercices avancés : challenger une IA, créer une Skill, repenser l'évaluation…",
      auteur: "E. Urschel",
      pages: "≈ 18 pages",
      size: "172 Ko",
      type: "DOCX",
      url: "/static/livrets/Niveau2_Exercices.docx",
      color: "var(--coral)"
    },
    {
      titre: "Le Guide complet — Christophe Bruneau",
      sous_titre: "Comprendre, maîtriser et utiliser l'IA générative. 5 parties : LLM, prompts, outils, agents, bibliothèque de prompts. Le livre de référence de notre collègue.",
      auteur: "Christophe Bruneau · 2026",
      pages: "≈ 600 pages",
      size: "3.7 Mo",
      type: "PDF",
      url: "/static/livrets/Bruneau-Guide-IA-Decouverte.pdf",
      color: "var(--cyan)"
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
