/* Skin and mode, shared by the library and the reader.
   data-skin  on <html>: parchment | fantasy | scifi | detective
   data-theme on <html>: light | dark
   Loaded from <head> so the page never flashes the wrong colours. */
(function () {
  const SKINS = [
    { id: 'parchment', label: 'Parchment', note: 'plain and warm' },
    { id: 'fantasy',   label: 'Fantasy',   note: 'gold and dusk' },
    { id: 'scifi',     label: 'Sci-Fi',    note: 'glass and signal' },
    { id: 'detective', label: 'Detective', note: 'smoke and lamplight' }
  ];
  const root = document.documentElement;
  const KEY = 'reader:';

  function get(k, fallback) {
    try { const v = localStorage.getItem(KEY + k); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function set(k, v) { try { localStorage.setItem(KEY + k, v); } catch (e) {} }

  function currentSkin() { return root.getAttribute('data-skin') || 'parchment'; }
  function currentMode() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  function applySkin(id) {
    if (!SKINS.some(s => s.id === id)) id = 'parchment';
    root.setAttribute('data-skin', id);
    set('skin', id);
    sync();
  }
  function applyMode(m) {
    m = m === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', m);
    set('theme', m);
    sync();
  }

  // Keep every control that shows the current state in step with it.
  function sync() {
    const skin = currentSkin(), mode = currentMode();
    document.querySelectorAll('[data-skin-pick]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.skinPick === skin));
    });
    document.querySelectorAll('[data-mode-pick]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.modePick === mode));
    });
    document.querySelectorAll('[data-mode-toggle]').forEach(b => {
      b.setAttribute('aria-label', mode === 'dark' ? 'Switch to light' : 'Switch to dark');
      b.title = mode === 'dark' ? 'Light' : 'Dark';
    });
  }

  document.addEventListener('click', e => {
    const skinBtn = e.target.closest('[data-skin-pick]');
    if (skinBtn) return applySkin(skinBtn.dataset.skinPick);
    const modeBtn = e.target.closest('[data-mode-pick]');
    if (modeBtn) return applyMode(modeBtn.dataset.modePick);
    const toggle = e.target.closest('[data-mode-toggle]');
    if (toggle) return applyMode(currentMode() === 'dark' ? 'light' : 'dark');
  });

  // First visit: follow the machine. After that, what the reader last chose.
  const prefersDark = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-skin', get('skin', 'parchment'));
  root.setAttribute('data-theme', get('theme', prefersDark ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', sync);

  window.ReaderTheme = { SKINS, applySkin, applyMode, currentSkin, currentMode, get, set };
})();
