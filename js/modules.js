// The five workflow modules. Each exports render(ctx) -> HTML and bind(ctx, root).
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const list = (arr) => (arr && arr.length ? `<ul class="clean">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Strip anything but basic formatting tags from AI-written product HTML before display.
  function safeHTML(html) {
    const allowed = /^(p|br|ul|ol|li|strong|b|em|i|h3|h4)$/i;
    const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
    const walk = (node) => {
      [...node.children].forEach((el) => {
        walk(el);
        if (!allowed.test(el.tagName)) el.replaceWith(...el.childNodes);
        else [...el.attributes].forEach((a) => el.removeAttribute(a.name));
      });
    };
    const root = doc.body.firstChild;
    walk(root);
    return root.innerHTML;
  }

  function selectedNiche(data) { return data.niches.find((n) => n.id === data.selectedNicheId); }
  function needNiche(data) {
    return selectedNiche(data) ? '' :
      `<div class="clay empty">Pick a niche in <b>1 · Niche</b> first. Every later step builds on it.</div>`;
  }

  async function run(ctx, btn, fn) {
    const label = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Working…';
    try { await fn(); } catch (e) { ctx.toast(e.message, true); }
    finally { btn.disabled = false; btn.innerHTML = label; }
  }

  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- 1. Niche Discovery Engine ----------
  const niche = {
    render({ data }) {
      const cards = data.niches.map((n) => `
        <div class="clay card ${n.id === data.selectedNicheId ? 'selected' : ''}">
          <div class="row between"><h3>${esc(n.name)}</h3><span class="pill">${esc(n.category)}</span></div>
          <label>Demand ${n.demandScore}/100</label><div class="meter"><div style="width:${+n.demandScore || 0}%"></div></div>
          <label>Stability ${'★'.repeat(+n.stabilityRating || 0)}${'☆'.repeat(5 - (+n.stabilityRating || 0))}</label>
          <p><b>Who buys:</b> ${esc(n.demographics)}</p>
          <p><b>Recurring need:</b> ${esc(n.recurringNeed)}</p>
          <p><b>Why evergreen:</b> ${esc(n.whyEvergreen)}</p>
          ${n.risks ? `<p class="muted"><b>Risks:</b> ${esc(n.risks)}</p>` : ''}
          <div class="row">
            ${n.id === data.selectedNicheId ? '<span class="pill ok">Selected</span>'
              : `<button class="btn primary small" data-select="${n.id}">Use this niche</button>`}
            <button class="btn small danger" data-del="${n.id}">Remove</button>
          </div>
        </div>`).join('');
      return `
        <div class="clay">
          <h2>Niche Discovery Engine</h2>
          <p class="muted">Finds evergreen niches with steady, repeat demand. Short-lived viral trends are filtered out.</p>
          <form id="niche-form" class="grid two">
            <div><label>Your interests or skills</label><input name="interests" placeholder="e.g. pets, home cooking, fitness"></div>
            <div><label>Target market</label><input name="market" placeholder="e.g. USA, Europe, Scandinavia"></div>
            <div><label>Starting budget</label><input name="budget" placeholder="e.g. $500"></div>
            <div><label>Avoid</label><input name="avoid" placeholder="e.g. electronics, supplements"></div>
          </form>
          <button class="btn primary" id="niche-go">Find evergreen niches</button>
        </div>
        ${data.niches.length ? `<div class="grid two">${cards}</div>` : '<div class="clay empty">No niches yet. Fill in what you can and press the button.</div>'}`;
    },
    bind(ctx, root) {
      root.querySelector('#niche-go').onclick = (e) => run(ctx, e.currentTarget, async () => {
        const f = Object.fromEntries(new FormData(root.querySelector('#niche-form')));
        const out = await AI.askJSON(ctx.data.settings,
          'You are an e-commerce market analyst. You only recommend stable, evergreen Shopify niches with proven, long-term demand and recurring customer needs (consumables, replacements, ongoing hobbies). Never recommend short-term viral trends or fads.',
          `Suggest 6 niches.\nInterests: ${f.interests || 'open'}\nMarket: ${f.market || 'global'}\nBudget: ${f.budget || 'small'}\nAvoid: ${f.avoid || 'nothing'}\n\n` +
          'Return {"niches":[{"name":str,"category":str,"demandScore":0-100,"stabilityRating":1-5,"demographics":str,"recurringNeed":str,"whyEvergreen":str,"risks":str}]} sorted by stabilityRating then demandScore, highest first.');
        (out.niches || []).forEach((n) => ctx.data.niches.push({ id: uid(), ...n }));
        await ctx.save();
        ctx.toast(`Found ${(out.niches || []).length} niches`);
        ctx.rerender();
      });
      root.querySelectorAll('[data-select]').forEach((b) => b.onclick = async () => {
        ctx.data.selectedNicheId = b.dataset.select;
        await ctx.save(); ctx.toast('Niche selected'); ctx.rerender();
      });
      root.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
        ctx.data.niches = ctx.data.niches.filter((n) => n.id !== b.dataset.del);
        if (ctx.data.selectedNicheId === b.dataset.del) ctx.data.selectedNicheId = null;
        await ctx.save(); ctx.rerender();
      });
    },
  };

  // ---------- 2. Store Layout Architect ----------
  const architect = {
    render({ data }) {
      const n = selectedNiche(data);
      if (!n) return needNiche(data);
      const s = data.schema;
      const view = !s ? '<div class="clay empty">No layout yet. Generate one above.</div>' : `
        <div class="grid two">
          <div class="clay">
            <h3>Theme: ${esc(s.themeName)}</h3>
            <p>${esc(s.themeReason)}</p>
            <div>${(s.colorPalette || []).map((c) => `<span class="swatch" title="${esc(c.role)} ${esc(c.hex)}" style="background:${/^#[0-9a-f]{3,8}$/i.test(c.hex) ? c.hex : '#ccc'}"></span>`).join('')}</div>
            <p class="muted">${(s.colorPalette || []).map((c) => `${esc(c.role)}: ${esc(c.hex)}`).join(' · ')}</p>
            <p><b>Fonts:</b> ${esc(s.typography)}</p>
            <h3>Navigation</h3>${list(s.navigation)}
          </div>
          <div class="clay">
            <h3>Mobile-first rules</h3>${list(s.mobileFirstRules)}
            <h3>Breakpoints</h3>
            <table><tr><th>Name</th><th>Min width</th><th>What changes</th></tr>
              ${(s.breakpoints || []).map((b) => `<tr><td>${esc(b.name)}</td><td>${esc(b.minWidth)}</td><td>${esc(b.notes)}</td></tr>`).join('')}
            </table>
          </div>
        </div>
        <div class="clay">
          <h3>Homepage sections (top to bottom)</h3>
          <div class="scroll-x"><table><tr><th>#</th><th>Section</th><th>On phone</th><th>On desktop</th></tr>
            ${(s.homepageSections || []).map((h, i) => `<tr><td>${i + 1}</td><td><b>${esc(h.name)}</b><br><span class="muted">${esc(h.purpose)}</span></td><td>${esc(h.mobile)}</td><td>${esc(h.desktop)}</td></tr>`).join('')}
          </table></div>
        </div>
        <div class="clay">
          <h3>Page hierarchy</h3>
          ${(s.pages || []).map((p) => `<details><summary>${esc(p.title)} <span class="muted">/${esc(p.handle)}</span></summary><p>${esc(p.purpose)}</p>${list(p.sections)}</details>`).join('')}
        </div>`;
      return `
        <div class="clay">
          <h2>Store Layout Architect</h2>
          <p class="muted">Designs your Shopify theme, pages and sections for <b>${esc(n.name)}</b>. Phones come first, desktop second.</p>
          <form id="arch-form" class="grid two">
            <div><label>Brand name (optional)</label><input name="brand" value="${esc(s?.brand || '')}"></div>
            <div><label>Brand feel</label><input name="vibe" placeholder="e.g. warm, trustworthy, playful" value="${esc(s?.vibe || '')}"></div>
          </form>
          <button class="btn primary" id="arch-go">${s ? 'Regenerate layout' : 'Generate layout'}</button>
        </div>
        ${view}`;
    },
    bind(ctx, root) {
      const go = root.querySelector('#arch-go');
      if (!go) return;
      go.onclick = (e) => run(ctx, e.currentTarget, async () => {
        const n = selectedNiche(ctx.data);
        const f = Object.fromEntries(new FormData(root.querySelector('#arch-form')));
        const out = await AI.askJSON(ctx.data.settings,
          'You are a senior Shopify theme architect and conversion-rate expert. Every design is MOBILE-FIRST: design for a 375px phone screen first, then enhance for larger screens. Recommend free Shopify Online Store 2.0 themes (e.g. Dawn, Refresh, Sense, Craft) where suitable.',
          `Niche: ${n.name} (${n.category}). Buyers: ${n.demographics}. Brand: ${f.brand || 'unnamed'}. Feel: ${f.vibe || 'clean and trustworthy'}.\n` +
          'Return {"themeName":str,"themeReason":str,"colorPalette":[{"role":str,"hex":"#RRGGBB"}],"typography":str,"navigation":[str],' +
          '"mobileFirstRules":[str],"breakpoints":[{"name":str,"minWidth":str,"notes":str}],' +
          '"homepageSections":[{"name":str,"purpose":str,"mobile":str,"desktop":str}],' +
          '"pages":[{"title":str,"handle":str,"purpose":str,"sections":[str]}]}. Include home, collection, product, about, FAQ, contact, shipping/returns pages.', 6000);
        ctx.data.schema = { ...out, brand: f.brand, vibe: f.vibe, nicheId: n.id, createdAt: Date.now() };
        await ctx.save(); ctx.toast('Layout ready'); ctx.rerender();
      });
    },
  };

  // ---------- 3. Product Bulk Importer ----------
  const CSV_HEAD = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
    'Variant Price', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Requires Shipping', 'SEO Title', 'SEO Description', 'Status'];
  const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const products = {
    render({ data }) {
      const n = selectedNiche(data);
      if (!n) return needNiche(data);
      const rows = data.products.map((p) => `
        <div class="clay">
          <div class="row between">
            <h3>${esc(p.title)}</h3>
            <span class="pill ${p.status === 'ready' ? 'ok' : 'warn'}">${p.status === 'ready' ? 'Ready' : 'Draft'}</span>
          </div>
          <p class="muted">${esc(p.productType)} · ${esc(p.price ? '$' + p.price : 'no price')} · /${esc(p.handle)}</p>
          <p><b>${esc(p.hook)}</b></p>
          ${list(p.benefits)}
          <details><summary>Full description</summary><div class="copy-html">${safeHTML(p.descriptionHtml)}</div></details>
          <details><summary>SEO & tags</summary><p><b>${esc(p.seoTitle)}</b><br>${esc(p.seoDescription)}</p><p class="muted">${esc((p.tags || []).join(', '))}</p></details>
          <div class="row">
            <button class="btn small" data-status="${p.id}">${p.status === 'ready' ? 'Mark draft' : 'Mark ready'}</button>
            <button class="btn small" data-redo="${p.id}">Rewrite copy</button>
            <button class="btn small danger" data-del="${p.id}">Remove</button>
          </div>
        </div>`).join('');
      return `
        <div class="clay">
          <h2>Product Bulk Importer</h2>
          <p class="muted">Paste one product per line: <code>name | price | notes</code>. The AI writes titles, descriptions and sales copy built to convert.</p>
          <textarea id="prod-input" placeholder="Stainless steel water bowl | 24.99 | non-slip base, 3 sizes&#10;Grain-free salmon treats | 12.50 | 200g bag"></textarea>
          <div class="row">
            <button class="btn primary" id="prod-go">Generate product copy</button>
            ${data.products.length ? '<button class="btn" id="prod-csv">Export Shopify CSV</button>' : ''}
          </div>
          ${data.products.length ? `<p class="muted">${data.products.filter((p) => p.status === 'ready').length} of ${data.products.length} ready. Import the CSV in Shopify: Products → Import.</p>` : ''}
        </div>
        ${rows ? `<div class="grid two">${rows}</div>` : '<div class="clay empty">No products yet.</div>'}`;
    },
    async write(ctx, items) {
      const n = selectedNiche(ctx.data);
      const brand = ctx.data.schema?.brand || '';
      const out = await AI.askJSON(ctx.data.settings,
        'You are a direct-response e-commerce copywriter. Write honest, benefit-led, scannable product copy that converts on mobile. Lead with the outcome for the buyer, handle the top objection, never invent certifications, reviews or medical claims.',
        `Store niche: ${n.name}. Buyers: ${n.demographics}. Brand: ${brand || 'unnamed'}.\nProducts:\n${items.map((i, k) => `${k + 1}. ${i.name} | price: ${i.price || '?'} | notes: ${i.notes || '-'}`).join('\n')}\n\n` +
        'Return {"products":[{"index":number (1-based, matches input),"title":str (max 70 chars),"hook":str (one-line promise),"benefits":[3-5 short bullets],' +
        '"descriptionHtml":str (p/ul/li/strong tags only, 120-200 words),"seoTitle":str (max 60 chars),"seoDescription":str (max 155 chars),"tags":[str],"productType":str}]}', 8000);
      return out.products || [];
    },
    bind(ctx, root) {
      const go = root.querySelector('#prod-go');
      if (!go) return;
      go.onclick = (e) => run(ctx, e.currentTarget, async () => {
        const items = root.querySelector('#prod-input').value.split('\n').map((l) => l.trim()).filter(Boolean)
          .map((l) => { const [name = '', price = '', notes = ''] = l.split('|').map((x) => x.trim()); return { name, price: price.replace(/[^0-9.]/g, ''), notes }; });
        if (!items.length) throw new Error('Paste at least one product line.');
        const all = [];
        for (let i = 0; i < items.length; i += 8) { // batches keep responses small and reliable
          const batch = items.slice(i, i + 8);
          const out = await this.write(ctx, batch);
          out.forEach((p) => {
            const src = batch[(p.index || 1) - 1] || {};
            all.push({ id: uid(), sourceName: src.name, price: src.price, notes: src.notes, status: 'draft', handle: slug(p.title), ...p });
          });
        }
        ctx.data.products.push(...all);
        await ctx.save(); ctx.toast(`Created ${all.length} products`); ctx.rerender();
      });
      const csv = root.querySelector('#prod-csv');
      if (csv) csv.onclick = () => {
        const vendor = ctx.data.schema?.brand || 'My Store';
        const lines = [CSV_HEAD.join(',')].concat(ctx.data.products.map((p) => [
          p.handle, p.title, safeHTML(p.descriptionHtml), vendor, '', p.productType, (p.tags || []).join(', '),
          p.status === 'ready' ? 'TRUE' : 'FALSE', p.price || '', 'deny', 'manual', 'TRUE', p.seoTitle, p.seoDescription,
          p.status === 'ready' ? 'active' : 'draft',
        ].map(csvCell).join(',')));
        download('shopify-products.csv', lines.join('\n'), 'text/csv');
      };
      root.querySelectorAll('[data-status]').forEach((b) => b.onclick = async () => {
        const p = ctx.data.products.find((x) => x.id === b.dataset.status);
        p.status = p.status === 'ready' ? 'draft' : 'ready';
        await ctx.save(); ctx.rerender();
      });
      root.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
        ctx.data.products = ctx.data.products.filter((x) => x.id !== b.dataset.del);
        await ctx.save(); ctx.rerender();
      });
      root.querySelectorAll('[data-redo]').forEach((b) => b.onclick = () => run(ctx, b, async () => {
        const p = ctx.data.products.find((x) => x.id === b.dataset.redo);
        const [fresh] = await this.write(ctx, [{ name: p.sourceName || p.title, price: p.price, notes: p.notes }]);
        if (fresh) Object.assign(p, fresh, { handle: slug(fresh.title), status: 'draft' });
        await ctx.save(); ctx.toast('Copy rewritten'); ctx.rerender();
      }));
    },
  };

  // ---------- 4. Virtual Customer Auditor ----------
  const PERSONAS = {
    'Impulse Buyer': 'Scrolls fast on a phone, decides in seconds, bounces if anything is slow, unclear or needs effort. Cares about the hook, visuals, price and a fast checkout.',
    'Skeptical Researcher': 'Reads everything, compares with Amazon, looks for proof: reviews, guarantees, shipping and returns policy, who runs the store, exact specs. Distrusts hype.',
    'Bargain Hunter': 'Looks for discounts, bundles, free-shipping thresholds and total cost at checkout.',
    'Gift Shopper': 'Buying for someone else. Needs gift ideas, delivery dates, gift wrap and easy returns.',
  };
  const auditor = {
    render({ data }) {
      if (!selectedNiche(data)) return needNiche(data);
      const ready = data.schema && data.products.length;
      const latest = data.audits[data.audits.length - 1];
      const report = !latest ? '<div class="clay empty">No audits yet.</div>' : `
        <p class="muted">Latest audit: ${new Date(latest.createdAt).toLocaleString()} · ${data.audits.length} total</p>
        <div class="grid two">${latest.reports.map((r) => `
          <div class="clay">
            <div class="row between"><h3>${esc(r.persona)}</h3><span class="score">${esc(r.score)}/10</span></div>
            <p><i>"${esc(r.firstImpression)}"</i></p>
            <p><b>Would they buy?</b> ${esc(r.wouldBuy)}</p>
            <details open><summary>Friction points</summary>${list(r.frictionPoints)}</details>
            <details><summary>Copy problems</summary>${list(r.copyIssues)}</details>
            <h3>Fixes</h3>
            ${(r.fixes || []).map((f) => `<p><span class="pill ${f.priority === 'high' ? 'accent' : ''}">${esc(f.priority)}</span> ${esc(f.fix)}</p>`).join('')}
          </div>`).join('')}
        </div>`;
      return `
        <div class="clay">
          <h2>Virtual Customer Auditor</h2>
          <p class="muted">Simulated shoppers walk through your layout and product copy on a phone and tell you what stops them buying.</p>
          ${ready ? '' : '<p class="error">Tip: generate a layout (step 2) and at least one product (step 3) for a useful audit.</p>'}
          <label>Shopper personas</label>
          <div class="checks">${Object.keys(PERSONAS).map((p, i) => `<label><input type="checkbox" name="persona" value="${p}" ${i < 2 ? 'checked' : ''}> ${p}</label>`).join('')}</div>
          <button class="btn primary" id="audit-go">Run audit</button>
        </div>
        ${report}`;
    },
    bind(ctx, root) {
      const go = root.querySelector('#audit-go');
      if (!go) return;
      go.onclick = (e) => run(ctx, e.currentTarget, async () => {
        const chosen = [...root.querySelectorAll('input[name=persona]:checked')].map((i) => i.value);
        if (!chosen.length) throw new Error('Pick at least one persona.');
        const d = ctx.data;
        const s = d.schema || {};
        const storeSummary = JSON.stringify({
          niche: selectedNiche(d).name, brand: s.brand, theme: s.themeName, navigation: s.navigation,
          homepage: (s.homepageSections || []).map((h) => ({ name: h.name, mobile: h.mobile })),
          pages: (s.pages || []).map((p) => p.title),
          products: d.products.slice(0, 12).map((p) => ({ title: p.title, price: p.price, hook: p.hook, benefits: p.benefits, description: p.descriptionHtml })),
        });
        const out = await AI.askJSON(d.settings,
          'You are a UX research panel that role-plays specific online shoppers visiting a Shopify store on a phone. Stay fully in character, be blunt and specific, quote exact copy that fails, and give concrete fixes.',
          `Personas:\n${chosen.map((p) => `- ${p}: ${PERSONAS[p]}`).join('\n')}\n\nStore:\n${storeSummary}\n\n` +
          'Return {"reports":[{"persona":str,"score":1-10,"firstImpression":str (first person),"wouldBuy":str,"frictionPoints":[str],"copyIssues":[str],"fixes":[{"priority":"high"|"medium"|"low","fix":str}]}]}', 6000);
        d.audits.push({ id: uid(), createdAt: Date.now(), personas: chosen, reports: out.reports || [] });
        await ctx.save(); ctx.toast('Audit complete'); ctx.rerender();
      });
    },
  };

  // ---------- 5. Ad Creative Generator ----------
  const ads = {
    render({ data }) {
      if (!selectedNiche(data)) return needNiche(data);
      const cards = data.ads.slice().reverse().map((a) => `
        <div class="clay">
          <div class="row between"><h3>${esc(a.title)}</h3><span class="pill accent">${esc(a.platform)}</span></div>
          <p class="muted">${esc(a.productTitle || 'Whole store')} · ${esc(a.length)} · angle: ${esc(a.angle)}</p>
          <p><b>🎣 Hook (0–3s):</b> ${esc(a.hook)}</p>
          <p><b>👀 Visual hook:</b> ${esc(a.visualHook)}</p>
          <details><summary>Shot-by-shot script</summary>
            ${(a.script || []).map((s) => `<div class="script-step"><b>${esc(s.time)}</b> — ${esc(s.visual)}<br>🎙️ ${esc(s.voiceover)}<br><span class="muted">Text: ${esc(s.onScreenText)}</span></div>`).join('')}
          </details>
          <p><b>CTA:</b> ${esc(a.cta)}</p>
          <button class="btn small danger" data-del="${a.id}">Remove</button>
        </div>`).join('');
      return `
        <div class="clay">
          <h2>Ad Creative Generator</h2>
          <p class="muted">Short-form video scripts and scroll-stopping visual hooks for social ads.</p>
          <form id="ad-form" class="grid two">
            <div><label>Platform</label><select name="platform">
              ${['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Facebook Reels'].map((p) => `<option>${p}</option>`).join('')}</select></div>
            <div><label>Product</label><select name="product"><option value="">Whole store / brand</option>
              ${data.products.map((p) => `<option value="${p.id}">${esc(p.title)}</option>`).join('')}</select></div>
            <div><label>Angle</label><select name="angle">
              ${['Problem → solution', 'UGC testimonial style', 'Before / after', 'Unboxing', 'Myth-busting', 'Founder story'].map((p) => `<option>${p}</option>`).join('')}</select></div>
            <div><label>How many variations</label><select name="count"><option>3</option><option>1</option><option>5</option></select></div>
          </form>
          <button class="btn primary" id="ad-go">Write ad scripts</button>
        </div>
        ${cards ? `<div class="grid two">${cards}</div>` : '<div class="clay empty">No ad creatives yet.</div>'}`;
    },
    bind(ctx, root) {
      const go = root.querySelector('#ad-go');
      if (!go) return;
      go.onclick = (e) => run(ctx, e.currentTarget, async () => {
        const f = Object.fromEntries(new FormData(root.querySelector('#ad-form')));
        const d = ctx.data;
        const p = d.products.find((x) => x.id === f.product);
        const n = selectedNiche(d);
        const out = await AI.askJSON(d.settings,
          'You are a performance creative strategist for short-form vertical video ads. You only write video scripts and describe visual hooks. The first 3 seconds must stop the scroll. Keep scripts 15-30 seconds, native to the platform, filmable on a phone.',
          `Platform: ${f.platform}. Angle: ${f.angle}. Variations: ${f.count}.\nNiche: ${n.name}. Audience: ${n.demographics}. Brand: ${d.schema?.brand || 'unnamed'}.\n` +
          (p ? `Product: ${p.title} ($${p.price || '?'}). Hook: ${p.hook}. Benefits: ${(p.benefits || []).join('; ')}` : 'Promote the store as a whole.') +
          '\n\nReturn {"ads":[{"title":str,"length":str,"hook":str (spoken/text line for 0-3s),"visualHook":str (what the viewer sees in the first frame),' +
          '"script":[{"time":str,"visual":str,"voiceover":str,"onScreenText":str}],"cta":str}]}', 6000);
        (out.ads || []).forEach((a) => d.ads.push({ id: uid(), createdAt: Date.now(), platform: f.platform, angle: f.angle, productId: p?.id, productTitle: p?.title, ...a }));
        await ctx.save(); ctx.toast(`Wrote ${(out.ads || []).length} scripts`); ctx.rerender();
      });
      root.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
        ctx.data.ads = ctx.data.ads.filter((x) => x.id !== b.dataset.del);
        await ctx.save(); ctx.rerender();
      });
    },
  };

  // ---------- Settings ----------
  const settings = {
    render({ data }) {
      const s = data.settings;
      return `
        <div class="clay">
          <h2>Settings</h2>
          <label>Claude API key</label>
          <input id="set-key" type="password" autocomplete="off" placeholder="sk-ant-…" value="${esc(s.apiKey)}">
          <p class="muted">Stored encrypted on this device only. Sent only to api.anthropic.com.</p>
          <label>Model</label>
          <input id="set-model" value="${esc(s.model || AI.DEFAULT_MODEL)}">
          <button class="btn primary" id="set-save">Save</button>
        </div>
        <div class="clay">
          <h3>Backup</h3>
          <p class="muted">Backups are plain JSON (not encrypted) and exclude your API key.</p>
          <div class="row">
            <button class="btn" id="set-export">Export backup</button>
            <label class="btn" style="margin:0">Import backup<input id="set-import" type="file" accept="application/json" hidden></label>
            <button class="btn danger" id="set-wipe">Delete all data</button>
          </div>
        </div>`;
    },
    bind(ctx, root) {
      root.querySelector('#set-save').onclick = async () => {
        ctx.data.settings.apiKey = root.querySelector('#set-key').value.trim();
        ctx.data.settings.model = root.querySelector('#set-model').value.trim() || AI.DEFAULT_MODEL;
        await ctx.save(); ctx.toast('Settings saved');
      };
      root.querySelector('#set-export').onclick = () => {
        const copy = { ...ctx.data, settings: { ...ctx.data.settings, apiKey: '' } };
        download('store-builder-backup.json', JSON.stringify(copy, null, 2), 'application/json');
      };
      root.querySelector('#set-import').onchange = async (e) => {
        try {
          const incoming = JSON.parse(await e.target.files[0].text());
          const key = ctx.data.settings.apiKey;
          Object.assign(ctx.data, window.freshData(), incoming);
          ctx.data.settings.apiKey = key;
          await ctx.save(); ctx.toast('Backup imported'); ctx.rerender();
        } catch { ctx.toast('That file is not a valid backup', true); }
      };
      root.querySelector('#set-wipe').onclick = () => {
        if (confirm('Delete ALL store data on this device? This cannot be undone.')) { Vault.wipe(); location.reload(); }
      };
    },
  };

  window.Modules = { niche, architect, products, auditor, ads, settings };
})();
