// Thin client for the Claude Messages API, called straight from the browser.
// Every module asks for strict JSON so results can be stored in the data model.
(function () {
  const ENDPOINT = 'https://api.anthropic.com/v1/messages';
  const DEFAULT_MODEL = 'claude-sonnet-5-5';

  function extractJSON(text) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const body = fenced ? fenced[1] : text;
    const start = body.search(/[\[{]/);
    const end = Math.max(body.lastIndexOf('}'), body.lastIndexOf(']'));
    if (start < 0 || end < start) throw new Error('AI did not return JSON');
    return JSON.parse(body.slice(start, end + 1));
  }

  async function askJSON(settings, system, prompt, maxTokens = 4000) {
    if (!settings.apiKey) throw new Error('Add your Claude API key in Settings (⚙️) first.');
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: settings.model || DEFAULT_MODEL,
        max_tokens: maxTokens,
        system: system + '\n\nRespond with a single valid JSON value only. No prose, no markdown fences.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      let msg = res.status + ' ' + res.statusText;
      try { msg = (await res.json()).error.message || msg; } catch {}
      throw new Error('AI request failed: ' + msg);
    }
    const out = await res.json();
    const text = out.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    return extractJSON(text);
  }

  window.AI = { askJSON, DEFAULT_MODEL };
})();
