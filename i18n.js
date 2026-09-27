// Language selection for the page. The wording itself lives in dancingmen-messages.js.
const I18n = (() => {
  const messages = typeof DancingMenMessages === "object"
    ? DancingMenMessages
    : require("./dancingmen-messages.js");
  const STORAGE_KEY = "dancingmen-cipherlab-language";
  const ATTRIBUTES = ["aria-label", "title", "placeholder", "alt"];
  let language = messages.DEFAULT_LANG;

  function supported(value) {
    return messages.LANGUAGES.includes(value);
  }

  function t(key, values = {}) {
    return messages.format(language, key, values);
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    document.title = t("app.title");
    for (const element of root.querySelectorAll("[data-i18n]")) {
      element.textContent = t(element.dataset.i18n);
    }
    for (const attribute of ATTRIBUTES) {
      for (const element of root.querySelectorAll(`[data-i18n-${attribute}]`)) {
        element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
      }
    }
  }

  function setLanguage(value) {
    if (!supported(value) || value === language) return;
    language = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private modes reject storage. The choice then lasts for this visit only.
    }
    apply();
    document.dispatchEvent(new Event("languagechange"));
  }

  function preferred() {
    const query = new URLSearchParams(location.search).get("lang");
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Without storage the browser setting decides.
    }
    const chosen = [query, saved].find(supported);
    if (chosen) return chosen;
    return /^ja\b/i.test(navigator.language || "") ? "ja" : "en";
  }

  function init() {
    language = preferred();
    apply();
  }

  return {
    STORAGE_KEY,
    t,
    apply,
    init,
    setLanguage,
    supported,
    get languages() { return [...messages.LANGUAGES]; },
    get ja() { return messages.dictionaries.ja; },
    get en() { return messages.dictionaries.en; },
    get language() { return language; }
  };
})();

globalThis.I18n = I18n;
if (typeof module === "object" && module.exports) {
  module.exports = I18n;
}
