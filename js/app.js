// App shell: lock screen, tab routing, readiness progress.
(function () {
  const $ = (s) => document.querySelector(s);

  window.freshData = () => ({
    version: 1,
    settings: { apiKey: '', model: AI.DEFAULT_MODEL },
    niches: [], selectedNicheId: null,
    schema: null,
    products: [],
    audits: [],
    ads: [],
  });

  const state = { data: null, tab: 'niche' };

  const ctx = {
    get data() { return state.data; },
    save: () => Vault.save(state.data),
    rerender: () => render(),
    toast(msg, isError) {
      const t = $('#toast');
      t.textContent = msg;
      t.style.background = isError ? 'var(--bad)' : '';
      t.hidden = false;
      clearTimeout(t._h);
      t._h = setTimeout(() => (t.hidden = true), isError ? 5000 : 2500);
    },
  };

  // Five readiness steps, one per module.
  function steps(d) {
    return {
      niche: !!d.selectedNicheId,
      architect: !!d.schema,
      products: d.products.some((p) => p.status === 'ready'),
      auditor: d.audits.length > 0,
      ads: d.ads.length > 0,
    };
  }

  function render() {
    const done = steps(state.data);
    const pct = Math.round((Object.values(done).filter(Boolean).length / 5) * 100);
    $('#ready-fill').style.width = pct + '%';
    $('#ready-label').textContent = pct + '%';
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === state.tab);
      t.classList.toggle('done', !!done[t.dataset.tab]);
    });
    const mod = Modules[state.tab];
    const view = $('#view');
    view.innerHTML = mod.render(ctx);
    mod.bind(ctx, view);
  }

  function go(tab) { state.tab = tab; render(); window.scrollTo(0, 0); }

  function showApp(data) {
    state.data = Object.assign(freshData(), data);
    $('#lock').hidden = true;
    $('#app').hidden = false;
    go(state.data.settings.apiKey ? 'niche' : 'settings');
    if (!state.data.settings.apiKey) ctx.toast('Add your Claude API key to get started');
  }

  function setupLock() {
    const creating = !Vault.exists();
    $('#lock-msg').textContent = creating ? 'Create a passcode to protect your store data on this device.' : 'Enter your passcode to unlock.';
    $('#lock-btn').textContent = creating ? 'Create & open' : 'Unlock';
    $('#lock-pass2').hidden = !creating;
    $('#lock-pass2').required = creating;
    $('#lock-reset').hidden = creating;
    $('#lock-err').textContent = '';
    $('#lock-pass').value = $('#lock-pass2').value = '';
    $('#lock').hidden = false;
    $('#app').hidden = true;
    $('#lock-pass').focus();

    $('#lock-form').onsubmit = async (e) => {
      e.preventDefault();
      const pass = $('#lock-pass').value;
      $('#lock-err').textContent = '';
      try {
        if (creating) {
          if (pass !== $('#lock-pass2').value) throw new Error('Passcodes do not match');
          const data = freshData();
          await Vault.create(pass, data);
          showApp(data);
        } else {
          showApp(await Vault.unlock(pass));
        }
      } catch (err) {
        $('#lock-err').textContent = err.message;
      }
    };
  }

  $('#lock-reset').onclick = () => {
    if (confirm('This deletes ALL store data on this device. Continue?')) { Vault.wipe(); setupLock(); }
  };
  $('#lock-now').onclick = () => { Vault.lock(); state.data = null; setupLock(); };
  document.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => go(b.dataset.tab)));

  setupLock();
})();
