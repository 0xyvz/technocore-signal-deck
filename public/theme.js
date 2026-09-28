"use strict";
// Apply before styles load so a saved dark theme never flashes a light page.
(() => {
  const key = "signal-deck-theme";
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = null;
  try { const saved = localStorage.getItem(key); if (["light", "dark"].includes(saved)) preference = saved; } catch { /* Storage may be unavailable in private browsing. */ }
  function updateButton() {
    const button = document.getElementById("themeToggle");
    if (!button) return;
    const dark = root.dataset.theme === "dark";
    const label = root.lang === "en" ? (dark ? "Switch to light theme" : "Switch to dark theme") : (dark ? "Açık temaya geç" : "Karanlık temaya geç");
    button.setAttribute("aria-label", label);
    button.title = label;
  }
  function apply() {
    const theme = preference || (system.matches ? "dark" : "light");
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#111813" : "#f4f5f0";
    updateButton();
  }
  apply();
  system.addEventListener("change", () => { if (!preference) apply(); });
  window.addEventListener("storage", event => {
    if (event.key !== key && event.key !== null) return;
    preference = ["light", "dark"].includes(event.newValue) ? event.newValue : null;
    apply();
  });
  // Delegate immediately: a reload may show the header before later scripts finish.
  document.addEventListener("click", event => {
    if (!(event.target instanceof Element) || !event.target.closest("#themeToggle")) return;
    preference = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(key, preference); } catch { /* Still works for this tab. */ }
    apply();
  });
  new MutationObserver(updateButton).observe(root, { attributes: true, attributeFilter: ["lang"] });
  document.addEventListener("DOMContentLoaded", updateButton, { once: true });
})();
