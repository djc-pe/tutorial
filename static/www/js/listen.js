(function () {
  const style = document.createElement('style');
  style.textContent = `
    .listen-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0 16px;
      padding: 8px 16px;
      background: var(--color-surface);
      color: var(--color-accent);
      border: 1px solid var(--color-border);
      border-radius: 999px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
    }
    .listen-btn:hover { background: #1f1f1f; }
    .listen-btn[aria-pressed="true"] { background: var(--color-accent); color: #000; }
    .listen-btn svg { width: 16px; height: 16px; flex: none; }
  `;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', function () {
    const content = document.querySelector('main.content');
    if (!content || !('speechSynthesis' in window)) return;

    const h1 = content.querySelector('h1');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'listen-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/><path d="M14 2.5v2.5a7.5 7.5 0 0 1 0 14v2.5a10 10 0 0 0 0-19z"/></svg><span>Escuchar</span>';
    if (h1) h1.insertAdjacentElement('afterend', btn);
    else content.prepend(btn);

    const synth = window.speechSynthesis;
    let voice = null;

    const pickVoice = function () {
      const voices = synth.getVoices();
      const lang = String(navigator.language || '').toLowerCase();
      voice = voices.find(function (v) { return v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(lang.slice(0, 2)); })
        || voices.find(function (v) { return v.lang && v.lang.toLowerCase().startsWith('es'); })
        || null;
    };
    synth.onvoiceschanged = pickVoice;
    pickVoice();

    const getText = function () {
      const clone = content.cloneNode(true);
      clone.querySelectorAll('script, style, button, [data-author]').forEach(function (el) { el.remove(); });
      return clone.textContent.replace(/\s+/g, ' ').trim();
    };

    let speaking = false;
    const setState = function (on) {
      speaking = on;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.querySelector('span').textContent = on ? 'Detener' : 'Escuchar';
    };

    btn.addEventListener('click', function () {
      if (speaking) {
        synth.cancel();
        setState(false);
        return;
      }
      const text = getText();
      if (!text) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice ? voice.lang : 'es-ES';
      if (voice) utter.voice = voice;
      utter.rate = 1;
      utter.onend = function () { setState(false); };
      utter.onerror = function () { setState(false); };
      synth.cancel();
      synth.speak(utter);
      setState(true);
    });
  });
})();