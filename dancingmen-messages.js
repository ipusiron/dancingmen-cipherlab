// UI-independent messages. Additional languages can share the same keys.
const DancingMenMessages = (() => {
  const DEFAULT_LANG = "ja";
  const dictionaries = {
    ja: {
      "list.open": "「",
      "list.close": "」",
      "feedback.removed": "使えない文字を取り除きました: {chars}",
      "feedback.replaced": "全角の英字・スペースやタブを半角に置き換えました",
      "feedback.truncated": "{max}文字を超えた分は切り捨てました"
    }
  };

  function format(lang, key, values = {}) {
    const dictionary = dictionaries[lang];
    if (!dictionary || !Object.hasOwn(dictionary, key)) {
      throw new Error(`Unknown message: ${lang}/${key}`);
    }
    return dictionary[key].replace(/\{([^}]+)\}/g, (_, name) => {
      if (!Object.hasOwn(values, name)) throw new Error(`Missing message value: ${name}`);
      const value = values[name];
      return Array.isArray(value)
        ? value.map(item => dictionary["list.open"] + item + dictionary["list.close"]).join("")
        : String(value);
    });
  }

  return { DEFAULT_LANG, dictionaries, format };
})();

globalThis.DancingMenMessages = DancingMenMessages;
if (typeof module === "object" && module.exports) {
  module.exports = DancingMenMessages;
}
