// Local, passcode-protected storage. All data is AES-GCM encrypted with a key
// derived from the passcode (PBKDF2). Nothing leaves the browser.
(function () {
  const KEY = 'ssb:vault';
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let cryptoKey = null;
  let salt = null;

  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function derive(pass, saltBytes) {
    const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBytes, iterations: 250000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }

  const Vault = {
    exists() { return !!localStorage.getItem(KEY); },

    async create(pass, data) {
      salt = crypto.getRandomValues(new Uint8Array(16));
      cryptoKey = await derive(pass, salt);
      await this.save(data);
    },

    async unlock(pass) {
      const stored = JSON.parse(localStorage.getItem(KEY));
      salt = unb64(stored.salt);
      const key = await derive(pass, salt);
      try {
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(stored.iv) }, key, unb64(stored.data));
        cryptoKey = key;
        return JSON.parse(dec.decode(plain));
      } catch {
        throw new Error('Wrong passcode');
      }
    },

    async save(data) {
      if (!cryptoKey) throw new Error('Vault locked');
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(JSON.stringify(data)));
      localStorage.setItem(KEY, JSON.stringify({ v: 1, salt: b64(salt), iv: b64(iv), data: b64(cipher) }));
    },

    lock() { cryptoKey = null; },
    wipe() { localStorage.removeItem(KEY); cryptoKey = null; },
  };

  window.Vault = Vault;
})();
